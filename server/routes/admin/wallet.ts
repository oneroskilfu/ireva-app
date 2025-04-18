import { Router, Request, Response } from 'express';
import { db } from '../../db';
import { wallets, users, walletTransaction } from '../../../shared/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { ensureAdmin } from '../../auth-jwt';

const adminWalletRouter = Router();

/**
 * @route GET /api/admin/wallets
 * @desc Get all user wallets
 * @access Admin only
 */
adminWalletRouter.get('/', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // Get all wallets with user information
    const walletsWithUsers = await db
      .select({
        id: wallets.id,
        userId: wallets.userId,
        balance: wallets.balance,
        lastUpdated: wallets.lastUpdated,
        currency: wallets.currency,
        isActive: wallets.isActive,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      })
      .from(wallets)
      .innerJoin(users, eq(wallets.userId, users.id))
      .orderBy(desc(wallets.balance));

    // Calculate total balance across all wallets
    const [{ totalBalance }] = await db
      .select({
        totalBalance: sql<number>`SUM(${wallets.balance})`,
      })
      .from(wallets);

    // Format wallet data for response
    const summary = walletsWithUsers.map(w => ({
      id: w.id,
      userId: w.userId,
      user: {
        username: w.username,
        email: w.email,
        name: `${w.firstName || ''} ${w.lastName || ''}`.trim() || w.username,
        role: w.role,
      },
      balance: w.balance,
      currency: w.currency,
      lastUpdated: w.lastUpdated,
      isActive: w.isActive,
    }));

    res.json({ 
      wallets: summary,
      stats: {
        totalWallets: summary.length,
        totalBalance,
        averageBalance: summary.length > 0 ? totalBalance / summary.length : 0,
      }
    });
  } catch (error) {
    console.error("Error fetching wallets:", error);
    res.status(500).json({ 
      message: "Failed to fetch wallets", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route GET /api/admin/wallets/:userId
 * @desc Get specific user wallet
 * @access Admin only
 */
adminWalletRouter.get('/:userId', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get wallet with user information
    const [walletWithUser] = await db
      .select({
        id: wallets.id,
        userId: wallets.userId,
        balance: wallets.balance,
        lastUpdated: wallets.lastUpdated,
        currency: wallets.currency,
        isActive: wallets.isActive,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      })
      .from(wallets)
      .innerJoin(users, eq(wallets.userId, users.id))
      .where(eq(wallets.userId, userId));

    if (!walletWithUser) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Get recent transactions for this wallet
    const transactions = await db
      .select()
      .from(walletTransaction)
      .where(eq(walletTransaction.userId, userId))
      .orderBy(desc(walletTransaction.createdAt))
      .limit(10);

    // Format wallet data for response
    const walletDetails = {
      id: walletWithUser.id,
      userId: walletWithUser.userId,
      user: {
        username: walletWithUser.username,
        email: walletWithUser.email,
        name: `${walletWithUser.firstName || ''} ${walletWithUser.lastName || ''}`.trim() || walletWithUser.username,
        role: walletWithUser.role,
      },
      balance: walletWithUser.balance,
      currency: walletWithUser.currency,
      lastUpdated: walletWithUser.lastUpdated,
      isActive: walletWithUser.isActive,
      transactions,
    };

    res.json(walletDetails);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ 
      message: "Failed to fetch wallet", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route PATCH /api/admin/wallets/:userId/adjust
 * @desc Adjust user's wallet balance (admin only)
 * @access Admin only
 */
adminWalletRouter.patch('/:userId/adjust', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { amount, reason, type } = req.body;
    
    if (!amount || isNaN(parseInt(amount)) || !reason || !type) {
      return res.status(400).json({ 
        message: "Invalid request. Required: amount, reason, type (credit/debit)" 
      });
    }

    // Get user wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const adjustmentAmount = parseInt(amount);
    let newBalance: number;
    let transactionType: 'deposit' | 'withdrawal';

    if (type === 'credit') {
      newBalance = wallet.balance + adjustmentAmount;
      transactionType = 'deposit';
    } else if (type === 'debit') {
      // Check if enough balance for debit
      if (wallet.balance < adjustmentAmount) {
        return res.status(400).json({ 
          message: "Insufficient funds", 
          balance: wallet.balance,
          requested: adjustmentAmount
        });
      }
      newBalance = wallet.balance - adjustmentAmount;
      transactionType = 'withdrawal';
    } else {
      return res.status(400).json({ message: "Type must be 'credit' or 'debit'" });
    }

    // Generate reference
    const reference = `ADMIN-${type.toUpperCase()}-${Date.now()}-${userId}`;
    
    // Process adjustment in a transaction
    await db.transaction(async (tx) => {
      // Record transaction
      await tx.insert(walletTransaction)
        .values({
          userId,
          amount: adjustmentAmount,
          type: transactionType,
          status: "completed",
          description: `Admin adjustment: ${reason}`,
          reference,
          metadata: { 
            admin: req.jwtPayload?.username || 'unknown', 
            adminId: req.jwtPayload?.id,
            reason 
          }
        });
      
      // Update wallet balance
      await tx.update(wallets)
        .set({ 
          balance: newBalance,
          lastUpdated: new Date()
        })
        .where(eq(wallets.id, wallet.id));
    });
    
    // Get updated wallet
    const [updatedWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    res.status(200).json({ 
      message: `Wallet ${type === 'credit' ? 'credited' : 'debited'} successfully`, 
      wallet: updatedWallet,
      reference,
      adjustment: {
        type,
        amount: adjustmentAmount,
        reason
      }
    });
  } catch (error) {
    console.error("Error adjusting wallet:", error);
    res.status(500).json({ 
      message: "Failed to adjust wallet", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default adminWalletRouter;