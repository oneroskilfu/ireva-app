import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { db } from '../db';
import { transactions, wallets } from '@shared/schema';
import { eq, desc, and, between, or } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get wallet balance and overview
router.get('/balance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get user's wallet data
    const [walletData] = await db.select().from(wallets)
      .where(eq(wallets.userId, userId));

    if (!walletData) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Get pending transactions
    const pendingDeposits = await db.select().from(transactions)
      .where(and(
        eq(transactions.walletId, walletData.id),
        eq(transactions.type, 'deposit'),
        eq(transactions.status, 'pending')
      ));

    const pendingWithdrawals = await db.select().from(transactions)
      .where(and(
        eq(transactions.walletId, walletData.id),
        eq(transactions.type, 'withdrawal'),
        eq(transactions.status, 'pending')
      ));

    // Calculate pending amounts
    const totalPendingDeposits = pendingDeposits.reduce((sum, tx) => sum + tx.amount, 0);
    const totalPendingWithdrawals = pendingWithdrawals.reduce((sum, tx) => sum + tx.amount, 0);

    // Get total invested amount
    const investments = await db.select().from(db.schema.investments)
      .where(eq(db.schema.investments.userId, userId));
    
    const totalInvested = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0);
    
    // Calculate total returns (simplified for now)
    const totalReturns = investments.reduce((sum: number, inv: any) => sum + (inv.earnings || 0), 0);

    // Get recent transactions
    const recentTransactions = await db.select().from(transactions)
      .where(eq(transactions.walletId, walletData.id))
      .orderBy(desc(transactions.createdAt))
      .limit(5);

    // Format the response
    const response = {
      balance: walletData.balance,
      pendingDeposits: totalPendingDeposits,
      pendingWithdrawals: totalPendingWithdrawals,
      availableBalance: walletData.balance - totalPendingWithdrawals,
      totalInvested,
      totalReturns,
      recentTransactions,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ message: 'Failed to fetch wallet data' });
  }
});

// Add funds to wallet
router.post('/fund', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Get user's wallet 
    const [userWallet] = await db.select().from(wallets)
      .where(eq(wallets.userId, userId));
      
    if (!userWallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // Create a new transaction record
    const transactionId = uuidv4();
    const newTransaction = await db.insert(transactions).values({
      walletId: userWallet.id,
      amount,
      type: 'deposit',
      status: 'pending', // Initially set as pending
      reference: transactionId,
    }).returning();

    // In a real implementation, you would integrate with a payment processor here
    // For demo purposes, we'll mark the transaction as completed immediately
    
    // Update the transaction status to completed
    await db.update(transactions)
      .set({ status: 'completed' })
      .where(eq(transactions.reference, transactionId));

    // Update the wallet balance
    await db.update(wallets)
      .set({ 
        balance: Number(userWallet.balance || 0) + Number(amount),
        lastUpdated: new Date()
      })
      .where(eq(wallets.id, userWallet.id));

    res.status(200).json({ 
      message: 'Funds added successfully',
      transactionId 
    });
  } catch (error) {
    console.error('Error adding funds:', error);
    res.status(500).json({ message: 'Failed to add funds' });
  }
});

// Withdraw funds from wallet
router.post('/withdraw', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount, bankName, accountNumber, accountName, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Get user's wallet
    const [userWallet] = await db.select().from(wallets)
      .where(eq(wallets.userId, userId));
      
    if (!userWallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    // Get pending withdrawals
    const pendingWithdrawals = await db.select().from(transactions)
      .where(and(
        eq(transactions.walletId, userWallet.id),
        eq(transactions.type, 'withdrawal'),
        eq(transactions.status, 'pending')
      ));

    const totalPendingWithdrawals = pendingWithdrawals.reduce((sum: number, tx: any) => 
      sum + Number(tx.amount || 0), 0);
      
    const availableBalance = Number(userWallet.balance || 0) - totalPendingWithdrawals;

    if (amount > availableBalance) {
      return res.status(400).json({ 
        message: 'Insufficient funds',
        available: availableBalance,
        requested: amount
      });
    }

    // Create a new withdrawal transaction
    const transactionId = uuidv4();
    const withdrawalDesc = description 
      ? `Withdrawal to ${bankName} - ${accountNumber} (${accountName}): ${description}`
      : `Withdrawal to ${bankName} - ${accountNumber} (${accountName})`;

    await db.insert(transactions).values({
      walletId: userWallet.id,
      amount,
      type: 'withdrawal',
      status: 'pending', // Withdrawals are initially pending until processed
      reference: transactionId,
    });

    // In a real implementation, you would initiate a bank transfer here
    // For demo purposes, we'll leave the transaction as pending
    
    res.status(200).json({ 
      message: 'Withdrawal request submitted',
      transactionId 
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ message: 'Failed to process withdrawal' });
  }
});

// Get transaction history
router.get('/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type, status, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    // Get user's wallet first
    const [wallet] = await db.select().from(wallets)
      .where(eq(wallets.userId, userId));
      
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    const offset = (Number(page) - 1) * Number(limit);
    
    // Build the base query
    let query = db.select().from(transactions)
      .where(eq(transactions.walletId, wallet.id));
    
    // Apply type filter
    if (type && type !== 'all') {
      query = query.where(eq(transactions.type, type as string));
    }
    
    // Apply status filter
    if (status && status !== 'all') {
      query = query.where(eq(transactions.status, status as string));
    }
    
    // Apply date range filter
    if (startDate && endDate) {
      query = query.where(
        between(
          transactions.createdAt,
          new Date(startDate as string),
          new Date(endDate as string)
        )
      );
    }
    
    // Order by most recent first
    const transactionHistory = await query
      .orderBy(desc(transactions.createdAt))
      .limit(Number(limit))
      .offset(offset);
    
    res.json(transactionHistory);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ message: 'Failed to fetch transaction history' });
  }
});

export default router;