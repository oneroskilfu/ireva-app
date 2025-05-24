import express from 'express';
import * as notificationController from '../controllers/notificationController';
import { verifyToken } from '../auth-jwt';

const router = express.Router();

// All routes are protected by authentication
router.use(verifyToken);

// Get notifications for current user
router.get('/', notificationController.getUserNotifications);

// Mark notification as read
router.patch('/:id/read', notificationController.markNotificationAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllNotificationsAsRead);

// Create notification (for admin or system use)
router.post('/', notificationController.createNotification);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

export default router;