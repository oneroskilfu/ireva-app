import express from 'express';
import { stablecoinController } from '../controllers/stablecoin-controller';
import { authMiddleware, ensureAdmin } from '../auth-jwt';

const router = express.Router();

/**
 * @route GET /api/stablecoins/supported
 * @desc Get supported networks and tokens
 * @access Public
 */
router.get('/supported', stablecoinController.getSupportedNetworksAndTokens);

/**
 * @route GET /api/stablecoins/balance/:walletAddress/:network/:token
 * @desc Get token balance for a wallet
 * @access Public
 */
router.get('/balance/:walletAddress/:network/:token', stablecoinController.getTokenBalance);

/**
 * @route GET /api/stablecoins/allowance/:ownerAddress/:spenderAddress/:network/:token
 * @desc Get allowance for a spender
 * @access Public
 */
router.get('/allowance/:ownerAddress/:spenderAddress/:network/:token', stablecoinController.getAllowance);

/**
 * @route POST /api/stablecoins/estimate-gas
 * @desc Estimate gas for token transfer
 * @access Public
 */
router.post('/estimate-gas', stablecoinController.estimateTransferGas);

/**
 * User authenticated routes
 */

/**
 * @route GET /api/stablecoins/transactions
 * @desc Get token transaction history for a user
 * @access Private
 */
router.get('/transactions', authMiddleware, stablecoinController.getTransactionHistory);

/**
 * @route POST /api/stablecoins/approve
 * @desc Approve platform to spend tokens on behalf of user
 * @access Private
 */
router.post('/approve', authMiddleware, stablecoinController.approveTokenSpending);

/**
 * Admin only routes
 */

/**
 * @route POST /api/stablecoins/transfer
 * @desc Transfer tokens from platform wallet to a user
 * @access Admin only
 */
router.post('/transfer', ensureAdmin, stablecoinController.transferTokens);

export default router;