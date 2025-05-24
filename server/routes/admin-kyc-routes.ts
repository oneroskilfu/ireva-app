import express from 'express';
import { adminKycController } from '../controllers/admin-kyc-controller';
import { ensureAdmin } from '../auth-jwt';

const router = express.Router();

/**
 * @route GET /api/admin/kyc
 * @desc Get all KYC submissions with risk assessment
 * @access Admin only
 */
router.get('/', ensureAdmin, adminKycController.getAllSubmissions);

/**
 * @route GET /api/admin/kyc/:id
 * @desc Get a single KYC submission with detailed verification info
 * @access Admin only
 */
router.get('/:id', ensureAdmin, adminKycController.getSubmission);

/**
 * @route PATCH /api/admin/kyc/:id/verify
 * @desc Verify a KYC submission with enhanced checks
 * @access Admin only
 */
router.patch('/:id/verify', ensureAdmin, adminKycController.verifySubmission);

/**
 * @route GET /api/admin/kyc/stats
 * @desc Get KYC verification statistics
 * @access Admin only
 */
router.get('/stats', ensureAdmin, adminKycController.getKycStats);

export default router;