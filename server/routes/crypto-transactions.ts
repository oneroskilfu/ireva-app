import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { CryptoPaymentService } from '../services/crypto-payment-service';
import { db } from '../db';

// Initialize services using singleton
const cryptoPaymentService = CryptoPaymentService.getInstance();

// Create router
export const cryptoTransactionsRouter = express.Router();

// GET all crypto transactions (public route for the demo - in production use ensureAdmin)
cryptoTransactionsRouter.get('/', async (req: Request, res: Response) => {
  try {
    try {
      // First try to get transactions from the database
      const result = await db.query.cryptoPayments.findMany({
        with: {
          user: true,
          property: true
        }
      });
      
      // Transform the data to match expected format
      const formattedTransactions = result.map(tx => ({
        _id: tx.id,
        txnId: tx.orderId || tx.id,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        createdAt: tx.createdAt,
        investorName: tx.user?.username || `User ${tx.userId}`,
        walletAddress: tx.walletAddress,
        propertyName: tx.property?.name || 'Unknown Property'
      }));
      
      return res.json(formattedTransactions);
    } catch (dbError) {
      console.error('Error fetching transactions from database:', dbError);
      
      // If database query fails, fall back to service method
      const transactions = await cryptoPaymentService.getAllTransactions();
      
      // Transform the data to match expected format
      const formattedTransactions = transactions.map(tx => ({
        _id: tx.id,
        txnId: tx.orderId || tx.id,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        createdAt: tx.createdAt,
        investorName: tx.user?.username || `User ${tx.userId}`,
        walletAddress: tx.walletAddress
      }));
      
      res.json(formattedTransactions);
    }
  } catch (error) {
    console.error('Error fetching all crypto transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET my transactions (requires authentication)
cryptoTransactionsRouter.get('/my', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const transactions = await cryptoPaymentService.getUserPayments(userId);
    
    // Transform the data to match expected format
    const formattedTransactions = transactions.map(tx => ({
      _id: tx.id,
      txnId: tx.orderId || tx.id,
      amount: Number(tx.amount),
      currency: tx.currency,
      status: tx.status,
      createdAt: tx.createdAt,
      walletAddress: tx.walletAddress,
      propertyId: tx.propertyId,
      propertyName: tx.property?.name
    }));
    
    res.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching user crypto transactions:', error);
    res.status(500).json({ error: 'Failed to fetch your transactions' });
  }
});

export default cryptoTransactionsRouter;