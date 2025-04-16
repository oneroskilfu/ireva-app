import express from 'express';
import * as settingsController from '../controllers/settingsController';
import { verifyToken } from '../auth-jwt';

const router = express.Router();

// All routes are protected by authentication
router.use(verifyToken);

// Get user profile
router.get('/profile', settingsController.getUserProfile);

// Update user profile
router.patch('/profile', settingsController.updateUserProfile);

// Update user password
router.patch('/password', settingsController.updatePassword);

// Update notification preferences
router.patch('/notifications', settingsController.updateNotificationPreferences);

// Generate or update referral code
router.post('/referral-code', settingsController.generateReferralCode);

export default router;