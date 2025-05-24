import express, { Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware } from '../auth-jwt';
import { z } from 'zod';
import { error } from 'console';

export const walletTransactionsRouter = express.Router();

// Schema for filtering transactions
const transactionFilterSchema = z.object({
  type: z.enum(['all', 'deposit', 'withdrawal', 'investment', 'return', 'fee', 'crypto_deposit', 'crypto_withdrawal']).optional().default('all'),
  walletType: z.enum(['all', 'fiat', 'crypto']).optional().default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['all', 'completed', 'pending', 'failed', 'processing']).optional().default('all'),
  search: z.string().optional()
});

// Get all transactions for current user
walletTransactionsRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.jwtPayload) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.jwtPayload.id;
    
    // Parse query parameters with zod for validation
    const query = transactionFilterSchema.parse(req.query);
    
    // Begin building our query - fetch both regular transactions and crypto transactions
    // For a real application, you would build the query based on the filters
    
    // For development/prototype, we can return sample transactions
    const sampleTransactions = [
      {
        id: 'tx_001',
        date: '2025-04-15T10:30:00Z',
        type: 'deposit',
        status: 'completed',
        amount: 5000,
        currency: 'USD',
        description: 'Bank transfer deposit',
        method: 'bank_transfer',
        reference: 'REF123456',
        wallet_type: 'fiat',
        userId: userId
      },
      {
        id: 'tx_002',
        date: '2025-04-14T15:45:00Z',
        type: 'investment',
        status: 'completed',
        amount: 2500,
        currency: 'USD',
        description: 'Investment in Lagos Heights Property',
        reference: 'INV789012',
        wallet_type: 'fiat',
        userId: userId
      },
      {
        id: 'tx_003',
        date: '2025-04-13T09:15:00Z',
        type: 'crypto_deposit',
        status: 'completed',
        amount: 1000,
        currency: 'USD',
        description: 'USDC Deposit',
        wallet_type: 'crypto',
        userId: userId,
        crypto_details: {
          asset: 'USDC',
          network: 'Ethereum',
          tx_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          confirmations: 35
        }
      },
      {
        id: 'tx_004',
        date: '2025-04-12T14:20:00Z',
        type: 'withdrawal',
        status: 'pending',
        amount: 1000,
        currency: 'USD',
        description: 'Withdrawal to bank account',
        method: 'bank_transfer',
        reference: 'WD345678',
        wallet_type: 'fiat',
        userId: userId
      },
      {
        id: 'tx_005',
        date: '2025-04-11T16:50:00Z',
        type: 'return',
        status: 'completed',
        amount: 275,
        currency: 'USD',
        description: 'Monthly ROI from Abuja Towers',
        reference: 'ROI456789',
        wallet_type: 'fiat',
        userId: userId
      },
      {
        id: 'tx_006',
        date: '2025-04-10T11:30:00Z',
        type: 'crypto_withdrawal',
        status: 'processing',
        amount: 500,
        currency: 'USD',
        description: 'USDT Withdrawal',
        wallet_type: 'crypto',
        userId: userId,
        crypto_details: {
          asset: 'USDT',
          network: 'Polygon',
          tx_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          confirmations: 15
        }
      },
      {
        id: 'tx_007',
        date: '2025-04-09T10:00:00Z',
        type: 'fee',
        status: 'completed',
        amount: 25,
        currency: 'USD',
        description: 'Platform fee',
        wallet_type: 'fiat',
        userId: userId
      }
    ];

    // Filter transactions based on query parameters
    let filteredTransactions = sampleTransactions;
    
    if (query.type !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.type === query.type);
    }
    
    if (query.walletType !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.wallet_type === query.walletType);
    }
    
    if (query.status !== 'all') {
      filteredTransactions = filteredTransactions.filter(tx => tx.status === query.status);
    }
    
    if (query.startDate) {
      const startDate = new Date(query.startDate);
      filteredTransactions = filteredTransactions.filter(tx => new Date(tx.date) >= startDate);
    }
    
    if (query.endDate) {
      const endDate = new Date(query.endDate);
      filteredTransactions = filteredTransactions.filter(tx => new Date(tx.date) <= endDate);
    }
    
    if (query.search) {
      const search = query.search.toLowerCase();
      filteredTransactions = filteredTransactions.filter(tx => 
        tx.description.toLowerCase().includes(search) ||
        tx.id.toLowerCase().includes(search) ||
        (tx.reference && tx.reference.toLowerCase().includes(search)) ||
        (tx.crypto_details && tx.crypto_details.tx_hash.toLowerCase().includes(search))
      );
    }
    
    // Sort transactions by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    res.json(filteredTransactions);
  } catch (err) {
    console.error('Error getting wallet transactions:', err);
    res.status(500).json({ error: 'Failed to get wallet transactions' });
  }
});

// Get transaction details by ID
walletTransactionsRouter.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.jwtPayload) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.jwtPayload.id;
    const transactionId = req.params.id;
    
    // In a real app, fetch from DB
    const sampleTransactions = [
      {
        id: 'tx_001',
        date: '2025-04-15T10:30:00Z',
        type: 'deposit',
        status: 'completed',
        amount: 5000,
        currency: 'USD',
        description: 'Bank transfer deposit',
        method: 'bank_transfer',
        reference: 'REF123456',
        wallet_type: 'fiat',
        userId: userId
      },
      {
        id: 'tx_002',
        date: '2025-04-14T15:45:00Z',
        type: 'investment',
        status: 'completed',
        amount: 2500,
        currency: 'USD',
        description: 'Investment in Lagos Heights Property',
        reference: 'INV789012',
        wallet_type: 'fiat',
        userId: userId
      }
    ];
    
    const transaction = sampleTransactions.find(tx => tx.id === transactionId && tx.userId === userId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error('Error getting transaction details:', err);
    res.status(500).json({ error: 'Failed to get transaction details' });
  }
});

// Get transaction summary statistics
walletTransactionsRouter.get('/summary', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.jwtPayload) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.jwtPayload.id;
    
    // In a real app, calculate these from DB
    const summary = {
      totalDeposits: 6000,
      totalWithdrawals: 1000,
      totalInvestments: 2500,
      totalReturns: 275,
      totalFees: 25,
      netBalance: 2750,
      pendingTransactions: 1,
      totalTransactions: 7
    };
    
    res.json(summary);
  } catch (err) {
    console.error('Error getting transaction summary:', err);
    res.status(500).json({ error: 'Failed to get transaction summary' });
  }
});