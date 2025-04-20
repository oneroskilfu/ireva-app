import { Router, Request, Response } from 'express';
import { db } from './db';
import { wallets, transactions } from '../shared/schema';
import { and, eq, desc } from 'drizzle-orm';
import { verifyToken } from './auth-jwt';

const walletRouter = Router();

/**
 * @route GET /api/wallet
 * @desc Get user wallet information
 * @access Private
 */
walletRouter.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get user wallet
    const [wallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    res.json(wallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ 
      message: "Failed to fetch wallet", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route GET /api/wallet/transactions
 * @desc Get user wallet transactions
 * @access Private
 */
walletRouter.get('/transactions', verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get user wallet first
    const [wallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    // Get transactions with pagination
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;
    
    // Get user transactions
    const userTransactions = await db.select()
      .from(transactions)
      .where(eq(transactions.walletId, wallet.id))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Get total count for pagination
    const [{ count }] = await db.select({ 
        count: db.fn.count() 
      })
      .from(transactions)
      .where(eq(transactions.walletId, wallet.id));
    
    res.json({
      transactions: userTransactions,
      pagination: {
        total: Number(count),
        page,
        limit,
        pages: Math.ceil(Number(count) / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ 
      message: "Failed to fetch transactions", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route POST /api/wallet/fund
 * @desc Fund user wallet
 * @access Private
 */
walletRouter.post('/fund', verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { amount, paymentMethod } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }
    
    // Get user wallet
    const [wallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    // Generate reference
    const reference = `FUND-${Date.now()}-${userId}`;
    
    // Process funding in a transaction
    await db.transaction(async (tx) => {
      // Record transaction
      await tx.insert(transactions)
        .values({
          walletId: wallet.id,
          amount: amount.toString(),
          type: "deposit",
          status: "completed",
          reference,
          metadata: { paymentMethod, description: `Wallet funding via ${paymentMethod}` }
        });
      
      // Update wallet balance
      const newBalance = wallet.balance ? parseFloat(wallet.balance) + amount : amount;
      await tx.update(wallets)
        .set({ 
          balance: newBalance.toString(),
          lastUpdated: new Date()
        })
        .where(eq(wallets.id, wallet.id));
    });
    
    // Get updated wallet
    const [updatedWallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    res.status(200).json({ 
      message: "Wallet funded successfully", 
      wallet: updatedWallet,
      reference
    });
  } catch (error) {
    console.error("Error funding wallet:", error);
    res.status(500).json({ 
      message: "Failed to fund wallet", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route POST /api/wallet/withdraw
 * @desc Withdraw from user wallet
 * @access Private
 */
walletRouter.post('/withdraw', verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { amount, bankAccount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    
    if (!bankAccount) {
      return res.status(400).json({ message: "Bank account details are required" });
    }
    
    // Get user wallet
    const [wallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    // Check if sufficient balance
    const currentBalance = wallet.balance ? parseFloat(wallet.balance) : 0;
    if (currentBalance < amount) {
      return res.status(400).json({ 
        message: "Insufficient funds", 
        balance: currentBalance,
        requested: amount
      });
    }
    
    // Generate reference
    const reference = `WD-${Date.now()}-${userId}`;
    
    // Process withdrawal in a transaction
    await db.transaction(async (tx) => {
      // Record transaction
      await tx.insert(transactions)
        .values({
          walletId: wallet.id,
          amount: amount.toString(),
          type: "withdrawal",
          status: "pending",
          reference,
          metadata: { bankAccount, description: `Withdrawal to bank account` }
        });
      
      // Update wallet balance
      const newBalance = currentBalance - amount;
      await tx.update(wallets)
        .set({ 
          balance: newBalance.toString(),
          lastUpdated: new Date()
        })
        .where(eq(wallets.id, wallet.id));
    });
    
    // Get updated wallet
    const [updatedWallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    res.status(200).json({ 
      message: "Withdrawal request submitted successfully", 
      wallet: updatedWallet,
      reference,
      status: "pending"
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    res.status(500).json({ 
      message: "Failed to process withdrawal", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default walletRouter;