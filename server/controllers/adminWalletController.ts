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

// Get all wallets with filtering and pagination
export const getWallets = async (req: Request, res: Response) => {
  try {
    const {
      type,
      minBalance,
      maxBalance,
      search,
      page = '1',
      limit = '10',
      sortBy = 'balance',
      sortDir = 'desc'
    } = req.query;

    // Clone the wallets array to avoid modifying the original
    let filteredWallets = [...walletData];

    // Apply filters
    if (type) {
      filteredWallets = filteredWallets.filter(wallet => wallet.type === type);
    }

    if (minBalance) {
      const min = parseFloat(String(minBalance));
      filteredWallets = filteredWallets.filter(wallet => wallet.balance >= min);
    }

    if (maxBalance) {
      const max = parseFloat(String(maxBalance));
      filteredWallets = filteredWallets.filter(wallet => wallet.balance <= max);
    }

    if (search) {
      const searchTerm = String(search).toLowerCase();
      filteredWallets = filteredWallets.filter(wallet => 
        wallet.id.toLowerCase().includes(searchTerm) ||
        wallet.description?.toLowerCase().includes(searchTerm) ||
        wallet.type.toLowerCase().includes(searchTerm)
      );
    }

    // Sort wallets
    const sortDirection = sortDir === 'asc' ? 1 : -1;
    filteredWallets.sort((a, b) => {
      if (sortBy === 'balance') {
        return sortDirection * (a.balance - b.balance);
      } else if (sortBy === 'lastUpdated') {
        return sortDirection * (new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime());
      }
      // Default to sorting by ID
      return sortDirection * (a.id.localeCompare(b.id));
    });

    // Calculate pagination
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedWallets = filteredWallets.slice(startIndex, endIndex);

    // Calculate total balance across all wallets (pre-filtered)
    const totalBalance = filteredWallets.reduce((sum, wallet) => sum + wallet.balance, 0);

    // Return with pagination metadata and summary statistics
    res.status(200).json({
      data: paginatedWallets,
      meta: {
        total: filteredWallets.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredWallets.length / limitNum),
        totalBalance: totalBalance,
        currency: filteredWallets.length > 0 ? filteredWallets[0].currency : '₦'
      }
    });
  } catch (error) {
    console.error('Error retrieving wallet data:', error);
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

// Get transactions for a specific wallet with pagination and filtering
export const getTransactionsByWalletId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
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

    // First filter by wallet ID
    let walletTransactions = transactionData.filter(tx => tx.walletId === id);
    
    // Apply additional filters
    if (type) {
      walletTransactions = walletTransactions.filter(tx => tx.type === type);
    }
    
    if (status) {
      walletTransactions = walletTransactions.filter(tx => tx.status === status);
    }
    
    if (search) {
      const searchTerm = String(search).toLowerCase();
      walletTransactions = walletTransactions.filter(tx => 
        tx.id.toLowerCase().includes(searchTerm) ||
        tx.description?.toLowerCase().includes(searchTerm) ||
        tx.reference?.toLowerCase().includes(searchTerm) ||
        tx.initiatedBy?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (startDate) {
      const start = new Date(String(startDate));
      walletTransactions = walletTransactions.filter(tx => new Date(tx.date) >= start);
    }
    
    if (endDate) {
      const end = new Date(String(endDate));
      walletTransactions = walletTransactions.filter(tx => new Date(tx.date) <= end);
    }
    
    // Sort transactions
    const sortDirection = sortDir === 'asc' ? 1 : -1;
    walletTransactions.sort((a, b) => {
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
    const paginatedTransactions = walletTransactions.slice(startIndex, endIndex);
    
    // Calculate transaction statistics
    const completedTransactions = walletTransactions.filter(tx => tx.status === 'completed');
    const pendingTransactions = walletTransactions.filter(tx => tx.status === 'pending');
    
    const totalDeposits = completedTransactions
      .filter(tx => tx.type === 'deposit')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const totalWithdrawals = completedTransactions
      .filter(tx => tx.type === 'withdrawal')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    // Get the associated wallet to display its current balance
    const associatedWallet = walletData.find(w => w.id === id);
    
    // Return with pagination metadata and summary statistics
    res.status(200).json({
      data: paginatedTransactions,
      meta: {
        total: walletTransactions.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(walletTransactions.length / limitNum),
        statistics: {
          pendingCount: pendingTransactions.length,
          completedCount: completedTransactions.length,
          totalDeposits,
          totalWithdrawals,
          walletBalance: associatedWallet?.balance || 0,
          currency: associatedWallet?.currency || '₦'
        }
      }
    });
  } catch (error) {
    console.error('Error retrieving wallet transactions:', error);
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

// Mock data for wallet balance history
const walletBalanceHistory = [
  { date: '2025-01-01', main: 10000000, escrow: 6500000, rewards: 250000 },
  { date: '2025-02-01', main: 10800000, escrow: 7200000, rewards: 300000 },
  { date: '2025-03-01', main: 11500000, escrow: 8000000, rewards: 350000 },
  { date: '2025-04-01', main: 12200000, escrow: 8500000, rewards: 400000 },
  { date: '2025-05-01', main: 12500000, escrow: 8900000, rewards: 450000 },
];

// Mock data for admin activity logs
const adminActivityLogs = [
  { id: 'log-1', adminId: 'admin123', action: 'approve_transaction', target: 'tx-3', details: 'Approved deposit of ₦1,000,000', timestamp: '2025-04-26T10:15:32Z' },
  { id: 'log-2', adminId: 'admin123', action: 'add_funds', target: 'w-1', details: 'Added ₦500,000 to main wallet', timestamp: '2025-04-27T14:32:10Z' },
  { id: 'log-3', adminId: 'admin456', action: 'transfer_funds', target: 'w-2 to w-1', details: 'Transferred ₦200,000 from escrow to main wallet', timestamp: '2025-04-28T09:45:22Z' },
  { id: 'log-4', adminId: 'admin123', action: 'approve_transaction', target: 'tx-7', details: 'Approved withdrawal of ₦450,000', timestamp: '2025-04-29T11:40:15Z' },
  { id: 'log-5', adminId: 'admin456', action: 'reconcile_wallet', target: 'w-1', details: 'Reconciliation completed - no discrepancies', timestamp: '2025-04-30T16:22:37Z' },
];

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

// Get wallet balance history for charting
export const getWalletBalanceHistory = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, walletType } = req.query;
    
    // Clone the data to avoid modifying the original
    let filteredHistory = [...walletBalanceHistory];
    
    // Apply filters if provided
    if (startDate) {
      const start = new Date(String(startDate));
      filteredHistory = filteredHistory.filter(h => new Date(h.date) >= start);
    }
    
    if (endDate) {
      const end = new Date(String(endDate));
      filteredHistory = filteredHistory.filter(h => new Date(h.date) <= end);
    }
    
    // If a specific wallet type is requested, transform the data to only include that type
    if (walletType) {
      const type = String(walletType);
      if (['main', 'escrow', 'rewards'].includes(type)) {
        filteredHistory = filteredHistory.map(h => {
          const transformedEntry: {date: string, [key: string]: number | string} = {
            date: h.date,
          };
          // Add the specific wallet type balance
          transformedEntry[type] = h[type as keyof typeof h];
          return transformedEntry;
        });
      }
    }
    
    res.status(200).json({
      data: filteredHistory,
      meta: {
        total: filteredHistory.length,
        timespan: {
          start: filteredHistory.length > 0 ? filteredHistory[0].date : null,
          end: filteredHistory.length > 0 ? filteredHistory[filteredHistory.length - 1].date : null
        }
      }
    });
  } catch (error) {
    console.error('Error retrieving wallet balance history:', error);
    res.status(500).json({ error: 'Failed to retrieve wallet balance history' });
  }
};

// Get admin activity logs for the wallet operations with pagination and filtering
export const getAdminActivityLogs = async (req: Request, res: Response) => {
  try {
    const {
      adminId,
      action,
      startDate,
      endDate,
      search,
      page = '1',
      limit = '10',
      sortBy = 'timestamp',
      sortDir = 'desc'
    } = req.query;
    
    // Start with a copy of all logs
    let filteredLogs = [...adminActivityLogs];
    
    // Apply filters
    if (adminId) {
      filteredLogs = filteredLogs.filter(log => log.adminId === adminId);
    }
    
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    
    if (startDate) {
      const start = new Date(String(startDate));
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }
    
    if (endDate) {
      const end = new Date(String(endDate));
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }
    
    if (search) {
      const searchTerm = String(search).toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.details.toLowerCase().includes(searchTerm) ||
        log.target.toLowerCase().includes(searchTerm) ||
        log.action.toLowerCase().includes(searchTerm)
      );
    }
    
    // Sort logs
    const sortDirection = sortDir === 'asc' ? 1 : -1;
    filteredLogs.sort((a, b) => {
      if (sortBy === 'timestamp') {
        return sortDirection * (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      } else if (sortBy === 'action') {
        return sortDirection * (a.action.localeCompare(b.action));
      } else if (sortBy === 'adminId') {
        return sortDirection * (a.adminId.localeCompare(b.adminId));
      }
      return 0;
    });
    
    // Calculate pagination
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    // Group actions by type for summary
    const actionSummary = filteredLogs.reduce((summary, log) => {
      summary[log.action] = (summary[log.action] || 0) + 1;
      return summary;
    }, {} as Record<string, number>);
    
    // Get unique admin IDs
    const uniqueAdmins = [...new Set(filteredLogs.map(log => log.adminId))];
    
    // Return with pagination metadata and summary statistics
    res.status(200).json({
      data: paginatedLogs,
      meta: {
        total: filteredLogs.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filteredLogs.length / limitNum),
        summary: {
          actionTypes: actionSummary,
          uniqueAdmins: uniqueAdmins.length,
          adminList: uniqueAdmins,
          timespan: {
            first: filteredLogs.length > 0 ? filteredLogs[filteredLogs.length - 1].timestamp : null,
            last: filteredLogs.length > 0 ? filteredLogs[0].timestamp : null
          }
        }
      }
    });
  } catch (error) {
    console.error('Error retrieving admin activity logs:', error);
    res.status(500).json({ error: 'Failed to retrieve admin activity logs' });
  }
};

// Export transaction data in various formats
export const exportTransactions = async (req: Request, res: Response) => {
  try {
    const { format = 'json', startDate, endDate, walletId, status } = req.query;
    
    // Filter transactions based on query parameters
    let filteredTransactions = [...transactionData];
    
    if (startDate) {
      const start = new Date(String(startDate));
      filteredTransactions = filteredTransactions.filter(tx => new Date(tx.date) >= start);
    }
    
    if (endDate) {
      const end = new Date(String(endDate));
      filteredTransactions = filteredTransactions.filter(tx => new Date(tx.date) <= end);
    }
    
    if (walletId) {
      filteredTransactions = filteredTransactions.filter(tx => tx.walletId === walletId);
    }
    
    if (status) {
      filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
    }
    
    // Generate response based on format
    switch (format) {
      case 'csv':
        // Build CSV string
        const headers = 'ID,Type,Wallet ID,Amount,Status,Date,Description,Initiated By,Reference\n';
        const rows = filteredTransactions.map(tx => 
          `${tx.id},${tx.type},${tx.walletId},${tx.amount},${tx.status},${tx.date},${tx.description || ''},${tx.initiatedBy || ''},${tx.reference || ''}`
        ).join('\n');
        
        const csvData = headers + rows;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        res.status(200).send(csvData);
        break;
        
      case 'json':
      default:
        res.status(200).json(filteredTransactions);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to export transaction data' });
  }
};

// Import transactions from CSV or JSON
export const importTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = req.body.transactions;
    
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'Invalid transaction data format' });
    }
    
    // Validate each transaction and add required fields
    const newTransactions = transactions.map(tx => {
      // Validate required fields
      if (!tx.type || !tx.walletId || tx.amount === undefined) {
        throw new Error('Missing required fields in transaction data');
      }
      
      // Generate an ID if not provided
      const id = tx.id || `tx-${uuidv4().substring(0, 8)}`;
      
      // Use current timestamp if date not provided
      const date = tx.date || new Date().toISOString();
      
      // Default to pending status if not specified
      const status = tx.status || 'pending';
      
      return {
        id,
        type: tx.type,
        walletId: tx.walletId,
        amount: Number(tx.amount),
        status,
        date,
        description: tx.description || 'Imported transaction',
        initiatedBy: tx.initiatedBy || 'System Import',
        reference: tx.reference || `IMP-${new Date().toISOString().substring(0, 10)}`
      };
    });
    
    // Add transactions to the existing data
    transactionData = [...newTransactions, ...transactionData];
    
    res.status(201).json({
      message: `Successfully imported ${newTransactions.length} transactions`,
      transactions: newTransactions
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to import transactions' });
  }
};

// Perform wallet reconciliation check
export const reconcileWallet = async (req: Request, res: Response) => {
  try {
    const { walletId } = req.params;
    
    // Find the wallet
    const wallet = walletData.find(w => w.id === walletId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    // Get all completed transactions for this wallet
    const walletTransactions = transactionData.filter(tx => 
      tx.walletId === walletId && tx.status === 'completed'
    );
    
    // Calculate the expected balance based on transactions
    const depositSum = walletTransactions
      .filter(tx => tx.type === 'deposit' || tx.type === 'transfer')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const withdrawalSum = walletTransactions
      .filter(tx => tx.type === 'withdrawal')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expectedBalance = depositSum - withdrawalSum;
    
    // Check if the wallet balance matches the expected balance
    const discrepancy = wallet.balance - expectedBalance;
    
    // Create a reconciliation record
    const reconciliationReport = {
      walletId,
      actualBalance: wallet.balance,
      expectedBalance,
      discrepancy,
      transactionCount: walletTransactions.length,
      timestamp: new Date().toISOString(),
      status: Math.abs(discrepancy) < 0.01 ? 'balanced' : 'discrepancy_found'
    };
    
    res.status(200).json({
      message: Math.abs(discrepancy) < 0.01 
        ? 'Wallet is balanced' 
        : `Wallet has a discrepancy of ${wallet.currency}${discrepancy.toLocaleString()}`,
      reconciliation: reconciliationReport
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reconcile wallet' });
  }
};