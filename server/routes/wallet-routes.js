/**
 * Wallet Routes Module
 * 
 * Defines all API endpoints related to wallet functionality:
 * - Fetching wallet information
 * - Processing deposits and withdrawals
 * - Transaction history
 * - Admin wallet management
 */

const express = require('express');
const walletController = require('../controllers/wallet-controller');
const securityMiddleware = require('../middleware/security-middleware');

const router = express.Router();

// Apply authentication middleware to all wallet routes
router.use(securityMiddleware.verifyToken);

// Get user wallet
router.get(
  '/', 
  securityMiddleware.checkPermission('wallets', 'read_own'),
  walletController.getWallet
);

// Get wallet summary with investments
router.get(
  '/summary', 
  securityMiddleware.checkPermission('wallets', 'read_own'),
  walletController.getWalletSummary
);

// Get transaction history
router.get(
  '/transactions', 
  securityMiddleware.checkPermission('wallets', 'read_own'),
  walletController.getTransactionHistory
);

// Deposit funds
router.post(
  '/deposit', 
  securityMiddleware.checkPermission('wallets', 'update_own'),
  walletController.depositFunds
);

// Withdraw funds
router.post(
  '/withdraw', 
  securityMiddleware.checkPermission('wallets', 'update_own'),
  walletController.withdrawFunds
);

// Admin routes
router.put(
  '/admin/update-balance', 
  securityMiddleware.checkPermission('wallets', 'update'),
  walletController.adminUpdateWallet
);

module.exports = router;