/**
 * Wallet Controller
 * 
 * Handles all wallet-related operations including:
 * - Retrieving wallet information
 * - Processing deposits
 * - Processing withdrawals
 * - Viewing transaction history
 */

const { eq, and, desc, asc } = require('drizzle-orm');
const { db } = require('../db.cjs');
const { wallets, transactions, users } = require('../../shared/schema');
const securityMiddleware = require('../middleware/security-middleware');

/**
 * Get user wallet
 */
exports.getWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's wallet
    const [wallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);
    
    if (!wallet) {
      // Create wallet if it doesn't exist
      const [newWallet] = await db.insert(wallets)
        .values({
          userId,
          balance: 0,
          currency: 'USD',
          isActive: true,
          lastUpdated: new Date()
        })
        .returning();
      
      return res.status(200).json({
        status: 'success',
        data: { wallet: newWallet }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { wallet }
    });
  } catch (error) {
    console.error('Error getting wallet:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving wallet'
    });
  }
};

/**
 * Get wallet transaction history with pagination
 */
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type, sort = 'desc' } = req.query;
    
    // Convert to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Base query
    let query = db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId));
    
    // Add type filter if provided
    if (type) {
      query = query.where(eq(transactions.type, type));
    }
    
    // Add sorting
    query = query.orderBy(
      sort === 'asc' 
        ? asc(transactions.createdAt) 
        : desc(transactions.createdAt)
    );
    
    // Execute query with pagination
    const history = await query
      .limit(limitNum)
      .offset(offset);
    
    // Get total count for pagination
    const [{ count }] = await db.select({
      count: db.fn.count()
    })
    .from(transactions)
    .where(eq(transactions.userId, userId));
    
    const totalItems = Number(count);
    const totalPages = Math.ceil(totalItems / limitNum);
    
    res.status(200).json({
      status: 'success',
      data: { 
        transactions: history,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving transaction history'
    });
  }
};

/**
 * Process wallet deposit request
 */
exports.depositFunds = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethod, reference } = req.body;
    
    // Validate amount
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid deposit amount'
      });
    }
    
    // Start transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // Get current wallet
      const [wallet] = await tx.select()
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1);
      
      // Create wallet if doesn't exist
      if (!wallet) {
        await tx.insert(wallets)
          .values({
            userId,
            balance: depositAmount,
            currency: 'USD',
            isActive: true,
            lastUpdated: new Date()
          });
      } else {
        // Update wallet balance
        await tx.update(wallets)
          .set({
            balance: Number(wallet.balance) + depositAmount,
            lastUpdated: new Date()
          })
          .where(eq(wallets.userId, userId));
      }
      
      // Create transaction record
      const [transaction] = await tx.insert(transactions)
        .values({
          userId,
          type: 'deposit',
          amount: depositAmount,
          status: 'completed',
          description: `Deposit via ${paymentMethod}`,
          reference: reference || 'manual',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Create audit log
      await securityMiddleware.auditLog('WALLET_DEPOSIT')(req, res, () => {});
    });
    
    // Get updated wallet
    const [updatedWallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);
    
    // Send success response
    res.status(200).json({
      status: 'success',
      message: 'Funds deposited successfully',
      data: { wallet: updatedWallet }
    });
  } catch (error) {
    console.error('Error depositing funds:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing deposit'
    });
  }
};

/**
 * Process wallet withdrawal request
 */
exports.withdrawFunds = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, withdrawalMethod, accountDetails } = req.body;
    
    // Validate amount
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid withdrawal amount'
      });
    }
    
    // Check if required fields are provided
    if (!withdrawalMethod) {
      return res.status(400).json({
        status: 'error',
        message: 'Withdrawal method is required'
      });
    }
    
    // Validate account details based on method
    if (!accountDetails) {
      return res.status(400).json({
        status: 'error',
        message: 'Account details are required for withdrawal'
      });
    }
    
    // Start database transaction
    await db.transaction(async (tx) => {
      // Get current wallet
      const [wallet] = await tx.select()
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1);
      
      // Check if wallet exists
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // Check if sufficient balance
      if (Number(wallet.balance) < withdrawalAmount) {
        throw new Error('Insufficient funds');
      }
      
      // Update wallet balance
      await tx.update(wallets)
        .set({
          balance: Number(wallet.balance) - withdrawalAmount,
          lastUpdated: new Date()
        })
        .where(eq(wallets.userId, userId));
      
      // Create transaction record - initial status is 'pending'
      const [transaction] = await tx.insert(transactions)
        .values({
          userId,
          type: 'withdrawal',
          amount: withdrawalAmount,
          status: 'pending', // Withdrawals start as pending until processed
          description: `Withdrawal via ${withdrawalMethod}`,
          reference: `withdrawal-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // In a real system, we would integrate with payment processors
      // and update the transaction status asynchronously
      
      // Create audit log
      await securityMiddleware.auditLog('WALLET_WITHDRAWAL_REQUEST')(req, res, () => {});
    });
    
    // Get updated wallet
    const [updatedWallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);
    
    // Send success response
    res.status(200).json({
      status: 'success',
      message: 'Withdrawal request submitted successfully',
      data: { 
        wallet: updatedWallet,
        withdrawalStatus: 'pending',
        estimatedProcessingTime: '1-3 business days'
      }
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    
    // Handle specific errors
    if (error.message === 'Insufficient funds') {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient funds for withdrawal'
      });
    } else if (error.message === 'Wallet not found') {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing withdrawal'
    });
  }
};

/**
 * Get wallet balance summary with investment totals
 */
exports.getWalletSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's wallet
    const [wallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);
    
    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found'
      });
    }
    
    // Get investment totals
    const [investmentStats] = await db.select({
      totalInvested: db.fn.sum(investments.amount),
      totalInvestments: db.fn.count()
    })
    .from(investments)
    .where(
      and(
        eq(investments.userId, userId),
        eq(investments.status, 'active')
      )
    );
    
    // Get transaction totals by type
    const depositTotal = await db.select({
      total: db.fn.sum(transactions.amount)
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'deposit'),
        eq(transactions.status, 'completed')
      )
    );
    
    const withdrawalTotal = await db.select({
      total: db.fn.sum(transactions.amount)
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'withdrawal'),
        eq(transactions.status, 'completed')
      )
    );
    
    const roiTotal = await db.select({
      total: db.fn.sum(transactions.amount)
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'dividend'),
        eq(transactions.status, 'completed')
      )
    );
    
    // Recent transactions
    const recentTransactions = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(5);
    
    // Format summary
    const summary = {
      currentBalance: Number(wallet.balance),
      currency: wallet.currency,
      totalInvested: Number(investmentStats?.totalInvested || 0),
      totalInvestments: Number(investmentStats?.totalInvestments || 0),
      depositTotal: Number(depositTotal[0]?.total || 0),
      withdrawalTotal: Number(withdrawalTotal[0]?.total || 0),
      roiTotal: Number(roiTotal[0]?.total || 0),
      lastUpdated: wallet.lastUpdated,
      recentTransactions
    };
    
    res.status(200).json({
      status: 'success',
      data: { summary }
    });
  } catch (error) {
    console.error('Error getting wallet summary:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving wallet summary'
    });
  }
};

/**
 * Admin: Update user wallet balance (for admins only)
 */
exports.adminUpdateWallet = async (req, res) => {
  try {
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Admin access required'
      });
    }
    
    const { userId, amount, reason } = req.body;
    
    // Validate inputs
    if (!userId || !amount || !reason) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID, amount, and reason are required'
      });
    }
    
    // Verify user exists
    const [userExists] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!userExists) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Start transaction
    await db.transaction(async (tx) => {
      // Get user's wallet
      const [wallet] = await tx.select()
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1);
      
      // Create wallet if doesn't exist
      if (!wallet) {
        await tx.insert(wallets)
          .values({
            userId,
            balance: Number(amount),
            currency: 'USD',
            isActive: true,
            lastUpdated: new Date()
          });
      } else {
        // Update wallet balance
        await tx.update(wallets)
          .set({
            balance: Number(wallet.balance) + Number(amount),
            lastUpdated: new Date()
          })
          .where(eq(wallets.userId, userId));
      }
      
      // Determine transaction type based on amount
      const transactionType = Number(amount) >= 0 ? 'admin_credit' : 'admin_debit';
      
      // Create transaction record
      await tx.insert(transactions)
        .values({
          userId,
          type: transactionType,
          amount: Math.abs(Number(amount)),
          status: 'completed',
          description: `Administrative ${Number(amount) >= 0 ? 'credit' : 'deduction'}: ${reason}`,
          reference: `admin-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      
      // Create audit log
      await securityMiddleware.auditLog('ADMIN_WALLET_UPDATE')(req, res, () => {});
    });
    
    // Get updated wallet
    const [updatedWallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId))
      .limit(1);
    
    // Send success response
    res.status(200).json({
      status: 'success',
      message: `User wallet updated successfully`,
      data: { wallet: updatedWallet }
    });
  } catch (error) {
    console.error('Error updating wallet as admin:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating wallet'
    });
  }
};