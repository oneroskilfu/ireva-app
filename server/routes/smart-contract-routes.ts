import express from 'express';
import { smartContractController } from '../controllers/smart-contract-controller';
import { ensureAdmin } from '../auth-jwt';

const router = express.Router();

/**
 * @route GET /api/contracts
 * @desc Get all deployed contracts
 * @access Public (read-only)
 */
router.get('/', smartContractController.getAllContracts);

/**
 * @route GET /api/contracts/:address
 * @desc Get a single contract by address
 * @access Public (read-only)
 */
router.get('/:address', smartContractController.getContract);

/**
 * @route GET /api/contracts/source/:name
 * @desc Get contract source code
 * @access Public (read-only)
 */
router.get('/source/:name', smartContractController.getContractSource);

/**
 * @route GET /api/contracts/audit/:address
 * @desc Get audit result for a contract
 * @access Public (read-only)
 */
router.get('/audit/:address', smartContractController.getAuditResult);

/**
 * @route GET /api/contracts/security-report
 * @desc Generate a comprehensive security report for all contracts
 * @access Public (read-only)
 */
router.get('/security-report', smartContractController.generateSecurityReport);

/**
 * The following routes require admin privileges
 */

/**
 * @route POST /api/contracts/analyze/:name
 * @desc Analyze a contract for security issues
 * @access Admin only
 */
router.post('/analyze/:name', ensureAdmin, smartContractController.analyzeContract);

/**
 * @route POST /api/contracts/verify/:address
 * @desc Verify a contract on blockchain explorer
 * @access Admin only
 */
router.post('/verify/:address', ensureAdmin, smartContractController.verifyContract);

export default router;