/**
 * Notification API Routes
 * 
 * Handles all notification-related endpoints including fetching,
 * marking as read, and managing notification preferences
 */

const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth-middleware');
const NotificationService = require('../services/notifications/NotificationService');

// Get user notifications with pagination and filtering
router.get('/notifications', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly, type, startDate, endDate, sortDirection = 'desc' } = req.query;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      unreadOnly: unreadOnly === 'true',
      type: type || null,
      startDate: startDate || null,
      endDate: endDate || null,
      sortDirection
    };
    
    const result = await NotificationService.getUserNotifications(req.user.id, options);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Mark notification(s) as read
router.post('/notifications/mark-read', authenticateUser, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'No notification IDs provided'
      });
    }
    
    const result = await NotificationService.markAsRead(ids, req.user.id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
});

// Mark all notifications as read
router.post('/notifications/mark-all-read', authenticateUser, async (req, res) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user.id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// Delete notification(s)
router.post('/notifications/delete', authenticateUser, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || (Array.isArray(ids) && ids.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'No notification IDs provided'
      });
    }
    
    const result = await NotificationService.deleteNotifications(ids, req.user.id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notifications',
      error: error.message
    });
  }
});

// Delete a single notification
router.delete('/notifications/:id', authenticateUser, async (req, res) => {
  try {
    const result = await NotificationService.deleteNotifications(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
});

// Get user notification preferences
router.get('/users/notification-preferences', authenticateUser, async (req, res) => {
  try {
    // In a full implementation, this would query user preferences from the database
    // For now, we'll return default preferences
    const defaultPreferences = {
      email: true,
      inApp: true,
      sms: false,
      investment: true,
      roi: true,
      kyc: true,
      wallet: true,
      system: true
    };
    
    // Try to get user preferences from user record if available
    let userPreferences = defaultPreferences;
    
    if (req.user.notificationPreferences) {
      try {
        userPreferences = JSON.parse(req.user.notificationPreferences);
      } catch (e) {
        console.error('Error parsing user notification preferences:', e);
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        preferences: userPreferences
      }
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences',
      error: error.message
    });
  }
});

// Update user notification preferences
router.put('/users/notification-preferences', authenticateUser, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({
        success: false,
        message: 'No preferences provided'
      });
    }
    
    // In a full implementation, this would update preferences in the database
    // For now, we'll just acknowledge the update
    
    // Basic validation of preferences format
    const allowedKeys = [
      'email', 'inApp', 'sms', 
      'investment', 'roi', 'kyc', 'wallet', 'system'
    ];
    
    const isValid = Object.keys(preferences).every(key => 
      allowedKeys.includes(key) && typeof preferences[key] === 'boolean'
    );
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid preferences format'
      });
    }
    
    // Update user record in a real implementation
    // For now, just return success
    
    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: {
        preferences
      }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message
    });
  }
});

// Create a test notification (for development)
router.post('/notifications/test', authenticateUser, async (req, res) => {
  try {
    const { type = 'system', channels = ['in-app'] } = req.body;
    
    let notificationData = {};
    let title = 'Test Notification';
    let message = 'This is a test notification.';
    
    switch (type) {
      case 'investment':
        title = 'Test Investment Notification';
        message = 'Your test investment of $10,000 has been processed successfully.';
        notificationData = {
          investmentId: 'test-123',
          propertyName: 'Test Property',
          amount: 10000,
          date: new Date().toISOString()
        };
        break;
        
      case 'roi':
        title = 'Test ROI Payment Notification';
        message = 'You have received a test ROI payment of $750 from your investment.';
        notificationData = {
          investmentId: 'test-123',
          propertyName: 'Test Property',
          amount: 750,
          date: new Date().toISOString()
        };
        break;
        
      case 'kyc':
        title = 'Test KYC Verification Notification';
        message = 'Your KYC verification status has been updated to approved.';
        notificationData = {
          kycId: 'kyc-test-123',
          status: 'approved',
          date: new Date().toISOString()
        };
        break;
        
      case 'wallet':
        title = 'Test Wallet Transaction Notification';
        message = 'Your deposit of $5,000 has been successfully added to your wallet.';
        notificationData = {
          transactionId: 'tx-test-123',
          transactionType: 'deposit',
          amount: 5000,
          status: 'completed',
          date: new Date().toISOString()
        };
        break;
    }
    
    const result = await NotificationService.createAndSend({
      userId: req.user.id,
      title,
      message,
      type,
      data: notificationData,
      channels,
      priority: 'normal'
    });
    
    res.status(201).json({
      success: true,
      message: 'Test notification created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification',
      error: error.message
    });
  }
});

module.exports = router;