/**
 * Authentication Routes
 * 
 * Defines API endpoints for user authentication, registration, and session management
 */

const express = require('express');
const authController = require('../controllers/auth-controller');

const router = express.Router();

// User registration and authentication
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// Protected routes (require authentication)
router.use(authController.protect);

// Current user operations
router.get('/me', authController.getCurrentUser);
router.patch('/update-me', authController.updateCurrentUser);
router.patch('/update-password', authController.updatePassword);
router.patch('/update-preferences', authController.updatePreferences);

module.exports = router;