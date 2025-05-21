/**
 * Notification Routes Module
 * 
 * Defines all API endpoints related to notification functionality:
 * - Fetching user notifications
 * - Marking notifications as read
 * - Creating new notifications
 * - Managing notification preferences
 */

const express = require('express');
const notificationController = require('../controllers/notification-controller');
const securityMiddleware = require('../middleware/security-middleware');

const router = express.Router();

// Apply authentication middleware to all notification routes
router.use(securityMiddleware.verifyToken);

// Get user notifications with filtering and pagination
router.get(
  '/', 
  securityMiddleware.checkPermission('notifications', 'read_own'),
  notificationController.getUserNotifications
);

// Mark notification as read
router.patch(
  '/:id/read', 
  securityMiddleware.checkPermission('notifications', 'update_own'),
  notificationController.markNotificationAsRead
);

// Mark all notifications as read
router.patch(
  '/read-all', 
  securityMiddleware.checkPermission('notifications', 'update_own'),
  notificationController.markAllNotificationsAsRead
);

// Delete a notification
router.delete(
  '/:id', 
  securityMiddleware.checkPermission('notifications', 'update_own'),
  notificationController.deleteNotification
);

// Update notification preferences
router.patch(
  '/preferences', 
  securityMiddleware.checkPermission('users', 'update_own'),
  notificationController.updateNotificationPreferences
);

// Admin routes
router.post(
  '/', 
  securityMiddleware.checkPermission('notifications', 'create'),
  notificationController.createNotification
);

router.post(
  '/property', 
  securityMiddleware.checkPermission('notifications', 'create'),
  notificationController.createPropertyNotifications
);

module.exports = router;