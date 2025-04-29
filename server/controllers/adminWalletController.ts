// server/controllers/adminWalletController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Wallet type definition
export interface Wallet {
  id: string;
  type: 'main' | 'escrow' | 'rewards';
  balance: number;
  currency: string;
  description?: string;
  lastUpdated: string;
}

// Transaction type definition
export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  walletId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  description?: string; 
  initiatedBy?: string;
  reference?: string;
}

// Mock data for wallets
let walletData: Wallet[] = [
  {
    id: "w-1",
    type: "main",
    balance: 12500000,
    currency: "₦",
    description: "Primary operational wallet",
    lastUpdated: "2025-04-28T10:15:32Z"
  },
  {
    id: "w-2",
    type: "escrow",
    balance: 8900000,
    currency: "₦",
    description: "Property acquisition escrow wallet",
    lastUpdated: "2025-04-27T14:22:10Z"
  },
  {
    id: "w-3",
    type: "rewards",
    balance: 450000,
    currency: "₦",
    description: "Investor rewards and referral bonuses",
    lastUpdated: "2025-04-26T09:05:47Z"
  },
];

// Mock data for transactions
let transactionData: Transaction[] = [
  {
    id: "tx-1",
    type: "deposit",
    walletId: "w-1",
    amount: 500000,
    status: "completed",
    date: "2025-04-25T10:15:32Z",
    description: "Bank transfer from First Bank",
    initiatedBy: "System",
    reference: "FBT-2025-0425-001"
  },
  {
    id: "tx-2",
    type: "withdrawal",
    walletId: "w-1",
    amount: 250000,
    status: "pending",
    date: "2025-04-27T14:22:10Z",
    description: "Weekly operational expenses",
    initiatedBy: "admin@ireva.com",
    reference: "EXP-2025-0427-001"
  },
  {
    id: "tx-3",
    type: "deposit",
    walletId: "w-2",
    amount: 1000000,
    status: "completed",
    date: "2025-04-26T09:05:47Z",
    description: "Investment escrow for Lagos Property #1242",
    initiatedBy: "System",
    reference: "INV-2025-1242"
  },
  {
    id: "tx-4",
    type: "withdrawal",
    walletId: "w-3",
    amount: 750000,
    status: "pending",
    date: "2025-04-28T16:30:22Z",
    description: "Monthly referral bonus payout",
    initiatedBy: "admin@ireva.com",
    reference: "REF-2025-0428-007"
  },
  {
    id: "tx-5",
    type: "deposit",
    walletId: "w-1",
    amount: 320000,
    status: "pending",
    date: "2025-04-28T18:45:19Z",
    description: "Return of unused property acquisition funds",
    initiatedBy: "System",
    reference: "REF-2025-0428-008"
  },
  {
    id: "tx-6",
    type: "transfer",
    walletId: "w-1",
    amount: 150000,
    status: "completed",
    date: "2025-04-29T09:15:20Z",
    description: "Transfer to rewards wallet for promotion",
    initiatedBy: "admin@ireva.com",
    reference: "TRF-2025-0429-001"
  },
  {
    id: "tx-7",
    type: "withdrawal",
    walletId: "w-2",
    amount: 450000,
    status: "completed",
    date: "2025-04-29T11:35:10Z",
    description: "Property vendor payment - Lekki Phase 1",
    initiatedBy: "admin@ireva.com",
    reference: "VEN-2025-0429-001"
  },
  {
    id: "tx-8",
    type: "deposit",
    walletId: "w-3",
    amount: 275000,
    status: "completed",
    date: "2025-04-30T13:22:54Z",
    description: "Quarterly rewards program funding",
    initiatedBy: "System",
    reference: "REW-2025-0430-001"
  },
  {
    id: "tx-9",
    type: "withdrawal",
    walletId: "w-1",
    amount: 189000,
    status: "pending",
    date: "2025-04-30T15:47:33Z",
    description: "Marketing expenses payment",
    initiatedBy: "admin@ireva.com",
    reference: "MKT-2025-0430-001"
  },
  {
    id: "tx-10",
    type: "transfer",
    walletId: "w-2",
    amount: 500000,
    status: "pending",
    date: "2025-04-30T16:58:12Z",
    description: "Transfer to main wallet - matured escrow",
    initiatedBy: "System",
    reference: "ESC-2025-0430-001"
  },
  {
    id: "tx-11",
    type: "deposit",
    walletId: "w-1",
    amount: 780000,
    status: "completed",
    date: "2025-05-01T09:12:45Z",
    description: "New investment receipts",
    initiatedBy: "System",
    reference: "INV-2025-0501-001"
  },
  {
    id: "tx-12",
    type: "withdrawal",
    walletId: "w-3",
    amount: 125000,
    status: "completed",
    date: "2025-05-01T10:30:21Z",
    description: "Investor loyalty rewards payout",
    initiatedBy: "admin@ireva.com",
    reference: "LOY-2025-0501-001"
  }
];

// Get all wallets
export const getWallets = async (req: Request, res: Response) => {
  try {
    res.status(200).json(walletData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve wallet data' });
  }
};

// Get a single wallet by ID
export const getWalletById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const wallet = walletData.find(w => w.id === id);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve wallet data' });
  }
};

// Get transactions with filtering, sorting, and pagination
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { 
      walletId,
      type,
      status,
      search,
      startDate,
      endDate,
      page = '1',
      limit = '10',
      sortBy = 'date',
      sortDir = 'desc'
    } = req.query;
    
    // Clone the transactions array to avoid modifying the original
    let filteredTransactions = [...transactionData];
    
    // Apply filters
    if (walletId) {
      filteredTransactions = filteredTransactions.filter(tx => tx.walletId === walletId);
    }
    
    if (type) {
      filteredTransactions = filteredTransactions.filter(tx => tx.type === type);
    }
    
    if (status) {
      filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
    }
    
    if (search) {
      const searchTerm = String(search).toLowerCase();
      filteredTransactions = filteredTransactions.filter(tx => 
        tx.id.toLowerCase().includes(searchTerm) ||
        tx.description?.toLowerCase().includes(searchTerm) ||
        tx.reference?.toLowerCase().includes(searchTerm) ||
        tx.initiatedBy?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (startDate) {
      const start = new Date(String(startDate));
      filteredTransactions = filteredTransactions.filter(tx => new Date(tx.date) >= start);
    }
    
    if (endDate) {
      const end = new Date(String(endDate));
      filteredTransactions = filteredTransactions.filter(tx => new Date(tx.date) <= end);
    }
    
    // Sort transactions
    const sortDirection = sortDir === 'asc' ? 1 : -1;
    filteredTransactions.sort((a, b) => {
      if (sortBy === 'amount') {
        return sortDirection * (a.amount - b.amount);
      } else if (sortBy === 'date') {
        return sortDirection * (new Date(a.date).getTime() - new Date(b.date).getTime());
      }
      return 0;
    });
    
    // Calculate pagination
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    // Return with pagination metadata
    res.status(200).json({
      transactions: paginatedTransactions,
      pagination: {
        total: filteredTransactions.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredTransactions.length / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve transaction data' });
  }
};

// Get transactions for a specific wallet
export const getTransactionsByWalletId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transactions = transactionData.filter(tx => tx.walletId === id);
    
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve wallet transactions' });
  }
};

// Approve a pending transaction
export const approveTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const transactionIndex = transactionData.findIndex(tx => tx.id === id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (transactionData[transactionIndex].status !== 'pending') {
      return res.status(400).json({ error: 'Transaction is not pending' });
    }
    
    // Update the transaction status
    transactionData[transactionIndex] = {
      ...transactionData[transactionIndex],
      status: 'completed'
    };
    
    // Update wallet balance based on transaction type
    const tx = transactionData[transactionIndex];
    const walletIndex = walletData.findIndex(w => w.id === tx.walletId);
    
    if (walletIndex !== -1) {
      if (tx.type === 'deposit' || tx.type === 'transfer') {
        walletData[walletIndex].balance += tx.amount;
      } else if (tx.type === 'withdrawal') {
        walletData[walletIndex].balance -= tx.amount;
      }
      
      // Update the lastUpdated timestamp
      walletData[walletIndex].lastUpdated = new Date().toISOString();
    }
    
    res.status(200).json({ 
      message: 'Transaction approved successfully',
      transaction: transactionData[transactionIndex],
      wallet: walletData[walletIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve transaction' });
  }
};

// Add funds to a wallet
export const addFunds = async (req: Request, res: Response) => {
  try {
    const { walletId, amount, description, reference } = req.body;
    
    // Validate request
    if (!walletId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid request. Wallet ID and a positive amount are required.' });
    }
    
    // Find the wallet
    const walletIndex = walletData.findIndex(w => w.id === walletId);
    
    if (walletIndex === -1) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    // Create a new transaction
    const newTransaction: Transaction = {
      id: `tx-${uuidv4().substring(0, 8)}`,
      type: 'deposit',
      walletId,
      amount: Number(amount),
      status: 'completed',
      date: new Date().toISOString(),
      description: description || 'Manual funds addition by admin',
      initiatedBy: req.body.adminEmail || 'admin@ireva.com',
      reference: reference || `MAN-${new Date().toISOString().substring(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    };
    
    // Add the transaction
    transactionData.push(newTransaction);
    
    // Update wallet balance
    walletData[walletIndex].balance += Number(amount);
    walletData[walletIndex].lastUpdated = new Date().toISOString();
    
    res.status(201).json({
      message: 'Funds added successfully',
      transaction: newTransaction,
      wallet: walletData[walletIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add funds to wallet' });
  }
};

// Transfer funds between wallets
export const transferFunds = async (req: Request, res: Response) => {
  try {
    const { sourceWalletId, destinationWalletId, amount, description } = req.body;
    
    // Validate request
    if (!sourceWalletId || !destinationWalletId || !amount || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid request. Source wallet ID, destination wallet ID, and a positive amount are required.' 
      });
    }
    
    // Find the wallets
    const sourceWalletIndex = walletData.findIndex(w => w.id === sourceWalletId);
    const destWalletIndex = walletData.findIndex(w => w.id === destinationWalletId);
    
    if (sourceWalletIndex === -1 || destWalletIndex === -1) {
      return res.status(404).json({ error: 'One or both wallets not found' });
    }
    
    // Check if source wallet has enough funds
    if (walletData[sourceWalletIndex].balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds in source wallet' });
    }
    
    // Create a new transaction for the transfer
    const transferId = `tx-${uuidv4().substring(0, 8)}`;
    const newTransaction: Transaction = {
      id: transferId,
      type: 'transfer',
      walletId: sourceWalletId,
      amount: Number(amount),
      status: 'completed',
      date: new Date().toISOString(),
      description: description || `Transfer from ${walletData[sourceWalletIndex].type} wallet to ${walletData[destWalletIndex].type} wallet`,
      initiatedBy: req.body.adminEmail || 'admin@ireva.com',
      reference: `TRF-${new Date().toISOString().substring(0, 10)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
    };
    
    // Add the transaction
    transactionData.push(newTransaction);
    
    // Update wallet balances
    walletData[sourceWalletIndex].balance -= Number(amount);
    walletData[sourceWalletIndex].lastUpdated = new Date().toISOString();
    
    walletData[destWalletIndex].balance += Number(amount);
    walletData[destWalletIndex].lastUpdated = new Date().toISOString();
    
    res.status(200).json({
      message: 'Funds transferred successfully',
      transaction: newTransaction,
      sourceWallet: walletData[sourceWalletIndex],
      destinationWallet: walletData[destWalletIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to transfer funds between wallets' });
  }
};

// Get wallet statistics
export const getWalletStats = async (req: Request, res: Response) => {
  try {
    // Calculate various metrics
    const totalBalance = walletData.reduce((sum, wallet) => sum + wallet.balance, 0);
    
    // Count transactions by status
    const pendingTransactions = transactionData.filter(tx => tx.status === 'pending').length;
    const completedTransactions = transactionData.filter(tx => tx.status === 'completed').length;
    
    // Get transaction volume by type
    const depositVolume = transactionData
      .filter(tx => tx.type === 'deposit' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const withdrawalVolume = transactionData
      .filter(tx => tx.type === 'withdrawal' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    // Calculate recent activity
    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);
    
    const recentTransactions = transactionData.filter(tx => new Date(tx.date) >= last7Days);
    
    // Return the statistics
    res.status(200).json({
      totalBalance,
      walletCount: walletData.length,
      transactionStats: {
        pending: pendingTransactions,
        completed: completedTransactions,
        total: transactionData.length
      },
      volumes: {
        deposits: depositVolume,
        withdrawals: withdrawalVolume,
        net: depositVolume - withdrawalVolume
      },
      recentActivity: {
        count: recentTransactions.length,
        volume: recentTransactions.reduce((sum, tx) => sum + tx.amount, 0)
      },
      currency: walletData[0]?.currency || '₦'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve wallet statistics' });
  }
};