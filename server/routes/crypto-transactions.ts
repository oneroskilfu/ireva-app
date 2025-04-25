import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock transaction data store (would be a database in production)
const transactions = new Map<string, {
  id: string;
  userId: number;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'investment';
  status: 'pending' | 'completed' | 'failed';
  hash: string;
  network: string;
  currency: string;
  createdAt: Date;
}>();

// Sample networks and currencies
const networks = ['ethereum', 'polygon', 'binance', 'solana'];
const currencies = ['USDC', 'USDT', 'ETH', 'MATIC', 'BNB', 'SOL'];

// Helper to generate mock transaction
const generateMockTransaction = (userId: number, type: 'deposit' | 'withdrawal' | 'investment') => {
  const id = uuidv4();
  const network = networks[Math.floor(Math.random() * networks.length)];
  const currency = currencies[Math.floor(Math.random() * currencies.length)];
  const amount = type === 'investment' 
    ? Math.floor(Math.random() * 10000) + 1000 
    : Math.floor(Math.random() * 1000) + 100;
  
  const transaction = {
    id,
    userId,
    amount,
    type,
    status: Math.random() > 0.2 ? 'completed' : 'pending',
    hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    network,
    currency,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random date within the last 30 days
  };
  
  transactions.set(id, transaction);
  return transaction;
};

// Seed some transactions for demo
const seedTransactions = (userId: number) => {
  if (Array.from(transactions.values()).some(tx => tx.userId === userId)) {
    return; // Already seeded for this user
  }
  
  // Generate 5 random transactions
  for (let i = 0; i < 5; i++) {
    const type = Math.random() > 0.5 ? 'deposit' : (Math.random() > 0.5 ? 'withdrawal' : 'investment');
    generateMockTransaction(userId, type);
  }
};

// Get user's transactions
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Seed transactions for demo if needed
    seedTransactions(userId);
    
    // Get all transactions for the user
    const userTransactions = Array.from(transactions.values())
      .filter(tx => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    res.json(userTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// Get a specific transaction
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.id;
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const transaction = transactions.get(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (transaction.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Failed to fetch transaction' });
  }
});

// Create a new deposit transaction
router.post('/deposit', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'USDC', network = 'ethereum' } = req.body;
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    
    const id = uuidv4();
    const transaction = {
      id,
      userId,
      amount,
      type: 'deposit' as const,
      status: 'pending' as const,
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      network,
      currency,
      createdAt: new Date(),
    };
    
    transactions.set(id, transaction);
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating deposit transaction:', error);
    res.status(500).json({ message: 'Failed to create deposit transaction' });
  }
});

// Create a new withdrawal transaction
router.post('/withdrawal', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, address, currency = 'USDC', network = 'ethereum' } = req.body;
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    
    if (!address) {
      return res.status(400).json({ message: 'Withdrawal address is required' });
    }
    
    const id = uuidv4();
    const transaction = {
      id,
      userId,
      amount,
      type: 'withdrawal' as const,
      status: 'pending' as const,
      hash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      network,
      currency,
      createdAt: new Date(),
    };
    
    transactions.set(id, transaction);
    
    // Simulate async processing
    setTimeout(() => {
      if (Math.random() > 0.2) { // 80% success rate for demo
        transaction.status = 'completed';
      } else {
        transaction.status = 'failed';
      }
      transactions.set(id, transaction);
    }, 30000); // 30 seconds later
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating withdrawal transaction:', error);
    res.status(500).json({ message: 'Failed to create withdrawal transaction' });
  }
});

export default router;