/**
 * User Routes Module
 * 
 * Defines all API endpoints related to user profile functionality:
 * - Fetching user profile information
 * - Updating user profile
 * - Changing password
 * - Managing user preferences
 */

const express = require('express');
const userController = require('../controllers/user-controller');
const securityMiddleware = require('../middleware/security-middleware');

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(securityMiddleware.verifyToken);

// Get user profile
router.get(
  '/profile', 
  securityMiddleware.checkPermission('users', 'read_own'),
  userController.getUserProfile
);

// Update user profile
router.patch(
  '/profile', 
  securityMiddleware.checkPermission('users', 'update_own'),
  userController.updateUserProfile
);

// Change password
router.patch(
  '/change-password', 
  securityMiddleware.checkPermission('users', 'update_own'),
  userController.changePassword
);

// Update user preferences
router.patch(
  '/preferences', 
  securityMiddleware.checkPermission('users', 'update_own'),
  userController.updatePreferences
);

// Update KYC information
router.post(
  '/kyc', 
  securityMiddleware.checkPermission('users', 'update_own'),
  userController.updateKYC
);

module.exports = router;