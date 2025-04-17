import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { db } from '../db';
import { walletTransaction, wallets } from '@shared/schema';
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
    const pendingDeposits = await db.query.walletTransactions.findMany({
      where: and(
        eq(walletTransaction.userId, userId),
        eq(walletTransaction.type, 'deposit'),
        eq(walletTransaction.status, 'pending')
      ),
    });

    const pendingWithdrawals = await db.query.walletTransactions.findMany({
      where: and(
        eq(walletTransaction.userId, userId),
        eq(walletTransaction.type, 'withdrawal'),
        eq(walletTransaction.status, 'pending')
      ),
    });

    // Calculate pending amounts
    const totalPendingDeposits = pendingDeposits.reduce((sum, tx) => sum + tx.amount, 0);
    const totalPendingWithdrawals = pendingWithdrawals.reduce((sum, tx) => sum + tx.amount, 0);

    // Get total invested amount
    const investments = await db.query.investments.findMany({
      where: eq(db.schema.investments.userId, userId),
    });
    
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Calculate total returns (simplified for now)
    const totalReturns = investments.reduce((sum, inv) => sum + (inv.returns || 0), 0);

    // Get recent transactions
    const recentTransactions = await db.query.walletTransactions.findMany({
      where: eq(walletTransaction.userId, userId),
      orderBy: [desc(walletTransaction.createdAt)],
      limit: 5,
    });

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

    // Create a new transaction record
    const transactionId = uuidv4();
    const newTransaction = await db.insert(walletTransaction).values({
      userId,
      type: 'deposit',
      amount,
      status: 'pending', // Initially set as pending
      description: `Deposit via ${paymentMethod}`,
      reference: transactionId,
    }).returning();

    // In a real implementation, you would integrate with a payment processor here
    // For demo purposes, we'll mark the transaction as completed immediately
    
    // Update the transaction status to completed
    await db.update(walletTransaction)
      .set({ status: 'completed' })
      .where(eq(walletTransaction.reference, transactionId));

    // Get the user's wallet and update the balance
    const [userWallet] = await db.query.wallets.findMany({
      where: eq(db.schema.wallets.userId, userId),
    });

    if (userWallet) {
      // Update existing wallet
      await db.update(db.schema.wallets)
        .set({ balance: userWallet.balance + amount })
        .where(eq(db.schema.wallets.userId, userId));
    } else {
      // Create new wallet if it doesn't exist
      await db.insert(db.schema.wallets).values({
        userId,
        balance: amount,
      });
    }

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

    // Check if user has sufficient balance
    const [userWallet] = await db.query.wallets.findMany({
      where: eq(db.schema.wallets.userId, userId),
    });

    if (!userWallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Get pending withdrawals
    const pendingWithdrawals = await db.query.walletTransactions.findMany({
      where: and(
        eq(walletTransaction.userId, userId),
        eq(walletTransaction.type, 'withdrawal'),
        eq(walletTransaction.status, 'pending')
      ),
    });

    const totalPendingWithdrawals = pendingWithdrawals.reduce((sum, tx) => sum + tx.amount, 0);
    const availableBalance = userWallet.balance - totalPendingWithdrawals;

    if (amount > availableBalance) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Create a new withdrawal transaction
    const transactionId = uuidv4();
    const withdrawalDesc = description 
      ? `Withdrawal to ${bankName} - ${accountNumber} (${accountName}): ${description}`
      : `Withdrawal to ${bankName} - ${accountNumber} (${accountName})`;

    await db.insert(walletTransaction).values({
      userId,
      type: 'withdrawal',
      amount,
      status: 'pending', // Withdrawals are initially pending until processed
      description: withdrawalDesc,
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
    
    const offset = (Number(page) - 1) * Number(limit);
    
    // Build the query with filters
    let query = db.select().from(walletTransaction).where(eq(walletTransaction.userId, userId));
    
    // Apply type filter
    if (type && type !== 'all') {
      query = query.where(eq(walletTransaction.type, type as string));
    }
    
    // Apply status filter
    if (status && status !== 'all') {
      query = query.where(eq(walletTransaction.status, status as string));
    }
    
    // Apply date range filter
    if (startDate && endDate) {
      query = query.where(
        between(
          walletTransaction.createdAt,
          new Date(startDate as string),
          new Date(endDate as string)
        )
      );
    }
    
    // Order by most recent first
    const transactions = await query
      .orderBy(desc(walletTransaction.createdAt))
      .limit(Number(limit))
      .offset(offset);
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ message: 'Failed to fetch transaction history' });
  }
});

export default router;