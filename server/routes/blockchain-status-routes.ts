import express from 'express';
import { blockchainStatusController } from '../controllers/blockchain-status-controller';

const router = express.Router();

/**
 * @route GET /api/blockchain/status
 * @desc Check status of blockchain providers
 * @access Public
 */
router.get('/status', blockchainStatusController.checkStatus);

/**
 * @route POST /api/blockchain/api-keys
 * @desc Save blockchain provider API keys
 * @access Private
 */
router.post('/api-keys', blockchainStatusController.saveApiKeys);

export default router;