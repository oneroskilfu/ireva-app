// server/routes/adminWalletRoutes.ts
import express from 'express';
import { getWallets, getTransactions, approveTransaction } from '../controllers/adminWalletController';
import { adminAuthMiddleware } from '../middleware/adminAuth';

const router = express.Router();

// Apply the admin authentication middleware to all routes in this router
router.use(adminAuthMiddleware);

// Get all platform wallets
router.get('/', getWallets);

// Get all platform-level transactions
router.get('/transactions', getTransactions);

// Approve a pending transaction
router.post('/transactions/:id/approve', approveTransaction);

export default router;