import express from 'express';
import * as walletController from '../controllers/walletController';
import { verifyToken } from '../auth-jwt';

const router = express.Router();

// All routes are protected by authentication
router.use(verifyToken);

// Get wallet for current user
router.get('/', walletController.getWallet);

// Get wallet transactions for current user
router.get('/transactions', walletController.getWalletTransactions);

// Create wallet for current user
router.post('/', walletController.createWallet);

// Deposit funds to wallet
router.post('/deposit', walletController.depositFunds);

// Withdraw funds from wallet
router.post('/withdraw', walletController.withdrawFunds);

export default router;