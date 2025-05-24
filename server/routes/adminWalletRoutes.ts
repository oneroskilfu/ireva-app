// server/routes/adminWalletRoutes.ts
import express from 'express';
import { 
  getWallets, 
  getWalletById,
  getTransactions, 
  getTransactionsByWalletId,
  approveTransaction,
  addFunds,
  transferFunds,
  getWalletStats,
  getWalletBalanceHistory,
  getAdminActivityLogs,
  exportTransactions,
  importTransactions,
  reconcileWallet
} from '../controllers/adminWalletController';
import { adminAuthMiddleware } from '../middleware/adminAuth';

const router = express.Router();

// Apply the admin authentication middleware to all routes in this router
router.use(adminAuthMiddleware);

// Get wallet statistics and dashboard data
router.get('/stats', getWalletStats);

// Get wallet balance history for charts
router.get('/balance-history', getWalletBalanceHistory);

// Get admin activity logs
router.get('/activity-logs', getAdminActivityLogs);

// Export transactions in various formats
router.get('/transactions/export', exportTransactions);

// Import transactions
router.post('/transactions/import', importTransactions);

// Get all platform wallets
router.get('/', getWallets);

// Get a specific wallet by ID
router.get('/:id', getWalletById);

// Get transactions for a specific wallet
router.get('/:id/transactions', getTransactionsByWalletId);

// Reconcile a specific wallet
router.post('/:id/reconcile', reconcileWallet);

// Get all platform-level transactions with filtering and pagination
router.get('/transactions', getTransactions);

// Approve a pending transaction
router.post('/transactions/:id/approve', approveTransaction);

// Add funds to a wallet
router.post('/add-funds', addFunds);

// Transfer funds between wallets
router.post('/transfer', transferFunds);

export default router;