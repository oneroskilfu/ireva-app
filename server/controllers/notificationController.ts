import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertNotificationSchema } from '../../shared/schema';
import * as emailService from '../services/emailService';

// Get all notifications for current user
export async function getUserNotifications(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notifications = await storage.getUserNotifications(req.user.id);
    
    // Sort by creation date (newest first)
    notifications.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return res.status(500).json({ message: 'Error fetching notifications' });
  }
}

// Mark notification as read
export async function markNotificationAsRead(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const notificationId = parseInt(id);

    if (isNaN(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    // First get the notification to check ownership
    const notifications = await storage.getUserNotifications(req.user.id);
    const notification = notifications.find(n => n.id === notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to the user
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedNotification = await storage.markNotificationAsRead(notificationId);

    return res.status(200).json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Error marking notification as read' });
  }
}

// Create notification (for admin or system use)
export async function createNotification(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Only admins can create notifications for other users
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const targetUserId = req.body.userId || req.user.id;

    if (targetUserId !== req.user.id && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notificationData = insertNotificationSchema.parse({
      ...req.body,
      userId: targetUserId,
      isRead: false,
      createdAt: new Date()
    });

    const notification = await storage.createNotification(notificationData);

    // Get user for email notification
    const user = await storage.getUser(targetUserId);

    if (user && user.email && req.body.sendEmail) {
      await emailService.sendNotificationEmail(user, notification);
    }

    return res.status(201).json(notification);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid notification data', errors: error.errors });
    }
    console.error('Error creating notification:', error);
    return res.status(500).json({ message: 'Error creating notification' });
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notifications = await storage.getUserNotifications(req.user.id);
    
    // Filter for unread notifications
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    // Mark each notification as read
    const updatePromises = unreadNotifications.map(n => 
      storage.markNotificationAsRead(n.id)
    );
    
    await Promise.all(updatePromises);

    return res.status(200).json({ 
      message: 'All notifications marked as read',
      count: unreadNotifications.length
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Error marking all notifications as read' });
  }
}

// Delete a notification (optional functionality)
export async function deleteNotification(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const notificationId = parseInt(id);

    if (isNaN(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    // First get the notification to check ownership
    const notifications = await storage.getUserNotifications(req.user.id);
    const notification = notifications.find(n => n.id === notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if notification belongs to the user or user is admin
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (notification.userId !== req.user.id && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // This assumes we've added a deleteNotification method to the storage interface
    // You'll need to implement this method in your storage classes
    await storage.deleteNotification(notificationId);

    return res.status(200).json({ 
      message: 'Notification deleted successfully',
      id: notificationId
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Error deleting notification' });
  }
}