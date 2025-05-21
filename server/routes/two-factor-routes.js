/**
 * Two-Factor Authentication Routes Module
 * 
 * Defines all API endpoints related to two-factor authentication:
 * - Generating 2FA secrets
 * - Verifying and enabling 2FA
 * - Disabling 2FA
 * - Validating 2FA during login
 */

const express = require('express');
const twoFactorController = require('../controllers/two-factor-controller');
const securityMiddleware = require('../middleware/security-middleware');

const router = express.Router();

// Get 2FA status (authenticated)
router.get(
  '/status',
  securityMiddleware.verifyToken,
  twoFactorController.get2FAStatus
);

// Generate 2FA secret (authenticated)
router.post(
  '/generate',
  securityMiddleware.verifyToken,
  twoFactorController.generate2FASecret
);

// Verify and enable 2FA (authenticated)
router.post(
  '/verify',
  securityMiddleware.verifyToken,
  twoFactorController.verify2FAToken
);

// Disable 2FA (authenticated)
router.post(
  '/disable',
  securityMiddleware.verifyToken,
  twoFactorController.disable2FA
);

// Validate 2FA during login (not authenticated)
router.post(
  '/validate',
  twoFactorController.validate2FALogin
);

module.exports = router;