import express from 'express';
import { dataProtectionController } from '../controllers/data-protection-controller';
import { authMiddleware, ensureAdmin } from '../auth-jwt';

const router = express.Router();

/**
 * @route GET /api/privacy/consent
 * @desc Get user's consent status
 * @access Private
 */
router.get('/consent', authMiddleware, dataProtectionController.getConsentStatus);

/**
 * @route POST /api/privacy/consent
 * @desc Update user's consent settings
 * @access Private
 */
router.post('/consent', authMiddleware, dataProtectionController.updateConsent);

/**
 * @route GET /api/privacy/export
 * @desc Export all user data (GDPR compliance)
 * @access Private
 */
router.get('/export', authMiddleware, dataProtectionController.exportUserData);

/**
 * @route POST /api/privacy/delete-account
 * @desc Request account deletion (GDPR compliance)
 * @access Private
 */
router.post('/delete-account', authMiddleware, dataProtectionController.requestAccountDeletion);

/**
 * Admin-only routes
 */

/**
 * @route GET /api/privacy/admin/compliance/:userId
 * @desc Check compliance status for a user
 * @access Admin only
 */
router.get('/admin/compliance/:userId', ensureAdmin, dataProtectionController.checkUserCompliance);

/**
 * @route POST /api/privacy/admin/anonymize/:userId
 * @desc Anonymize user data
 * @access Admin only
 */
router.post('/admin/anonymize/:userId', ensureAdmin, dataProtectionController.anonymizeUser);

/**
 * @route POST /api/privacy/admin/detect-pii
 * @desc Detect PII in text
 * @access Admin only
 */
router.post('/admin/detect-pii', ensureAdmin, dataProtectionController.detectPII);

export default router;