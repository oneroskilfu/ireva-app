import express, { Request, Response } from 'express';
import { db } from '../../db';
import { users, transactions } from '../../../shared/schema';
import { authMiddleware, ensureAdmin } from '../../auth-jwt';
import { sql, eq, and, desc, gt, lt, between } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const router = express.Router();

// Middleware to ensure admin access
router.use(authMiddleware, ensureAdmin);

/**
 * Get user wallet information
 */
router.get('/users/:userId/wallet', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Get the user to check wallet balance
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get total investments
    const [totalInvestmentsResult] = await db
      .select({
        total: sql`COALESCE(SUM(${transactions.amount}::numeric), 0)`.mapWith(Number)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'investment'),
          eq(transactions.status, 'completed')
        )
      );
    
    // Get total earnings (ROI + referrals)
    const [totalEarningsResult] = await db
      .select({
        total: sql`COALESCE(SUM(${transactions.amount}::numeric), 0)`.mapWith(Number)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`${transactions.type} IN ('roi', 'referral')`,
          eq(transactions.status, 'completed')
        )
      );
    
    // Get pending balance
    const [pendingBalanceResult] = await db
      .select({
        total: sql`COALESCE(SUM(${transactions.amount}::numeric), 0)`.mapWith(Number)
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          sql`${transactions.type} IN ('deposit', 'roi', 'referral')`,
          eq(transactions.status, 'pending')
        )
      );
    
    const totalInvestments = totalInvestmentsResult.total || 0;
    const totalEarnings = totalEarningsResult.total || 0;
    const pendingBalance = pendingBalanceResult.total || 0;
    const availableBalance = parseFloat(user.walletBalance) || 0;
    
    res.json({
      availableBalance: availableBalance.toFixed(2),
      pendingBalance: pendingBalance.toFixed(2),
      totalInvestments: totalInvestments.toFixed(2),
      totalEarnings: totalEarnings.toFixed(2)
    });
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    res.status(500).json({ message: 'Failed to fetch wallet information' });
  }
});

/**
 * Get user transactions
 */
router.get('/users/:userId/transactions', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '10', type, startDate, endDate } = req.query;
    
    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Build conditions for filtering
    const conditions = [eq(transactions.userId, userId)];
    
    if (type) {
      conditions.push(eq(transactions.type, type as string));
    }
    
    if (startDate && endDate) {
      conditions.push(
        between(
          transactions.createdAt, 
          new Date(startDate as string), 
          new Date(endDate as string)
        )
      );
    } else if (startDate) {
      conditions.push(gt(transactions.createdAt, new Date(startDate as string)));
    } else if (endDate) {
      conditions.push(lt(transactions.createdAt, new Date(endDate as string)));
    }
    
    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(transactions)
      .where(and(...conditions));
    
    // Get paginated results
    const results = await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.createdAt))
      .limit(limitNum)
      .offset(offset);
    
    res.json({
      transactions: results,
      pagination: {
        total: countResult.count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(countResult.count / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

/**
 * Add manual transaction
 */
router.post('/users/:userId/transactions', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { amount, type, description } = req.body;
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    
    if (!type || !['deposit', 'withdrawal'].includes(type)) {
      return res.status(400).json({ message: 'Valid transaction type is required (deposit or withdrawal)' });
    }
    
    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create transaction
    const [transaction] = await db
      .insert(transactions)
      .values({
        id: uuidv4(),
        userId,
        amount: amount.toString(),
        type: type as 'deposit' | 'withdrawal',
        status: 'completed',
        description: description || `Manual ${type} by admin`,
        createdAt: new Date(),
        referenceId: `manual-${uuidv4().slice(0, 8)}`
      })
      .returning();
    
    // Update user wallet balance
    const newBalance = type === 'deposit' 
      ? parseFloat(user.walletBalance) + parseFloat(amount)
      : parseFloat(user.walletBalance) - parseFloat(amount);
    
    if (type === 'withdrawal' && newBalance < 0) {
      return res.status(400).json({ message: 'Insufficient wallet balance for withdrawal' });
    }
    
    await db
      .update(users)
      .set({ walletBalance: newBalance.toFixed(2) })
      .where(eq(users.id, userId));
    
    res.status(201).json({
      message: `Manual ${type} transaction added successfully`,
      transaction
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Failed to add transaction' });
  }
});

export default router;