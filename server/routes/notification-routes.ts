import { Router, Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { db } from '../db';
import { notifications } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { sendNotificationToUser } from '../socketio';

export const notificationRouter = Router();

// Get all notifications for the current user
notificationRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userNotifications = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId.toString()))
      .orderBy(desc(notifications.createdAt));

    return res.status(200).json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get recent notifications (limited to 5) for the current user
notificationRouter.get('/recent', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const recentNotifications = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId.toString()))
      .orderBy(desc(notifications.createdAt))
      .limit(5);

    return res.status(200).json(recentNotifications);
  } catch (error) {
    console.error('Error fetching recent notifications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get unread notifications count for the current user
notificationRouter.get('/unread', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const unreadNotifications = await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId.toString()),
        eq(notifications.isRead, false)
      ));

    return res.status(200).json({ count: unreadNotifications.length });
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark a notification as read
notificationRouter.patch('/:id/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const notificationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // First check if the notification belongs to the user
    const [notification] = await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.id, notificationId.toString()),
        eq(notifications.userId, userId.toString())
      ));

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Update the notification
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId.toString()));

    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all notifications as read for the current user
notificationRouter.patch('/mark-all-read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId.toString()));

    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new notification for a user
notificationRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId, title, message, link, type } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newNotification = await db.insert(notifications)
      .values({
        userId,
        title,
        message,
        link: link || null,
        type: type || 'general',
        isRead: false,
        createdAt: new Date()
      })
      .returning();

    // Send notification through WebSocket
    sendNotificationToUser(userId.toString(), {
      title,
      message,
      type: type || 'general'
    });

    return res.status(201).json(newNotification[0]);
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a batch notification for multiple users
notificationRouter.post('/batch', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { userIds, title, message, link, type } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const notificationsToInsert = userIds.map(userId => ({
      userId,
      title,
      message,
      link: link || null,
      type: type || 'general',
      isRead: false,
      createdAt: new Date()
    }));

    const newNotifications = await db.insert(notifications)
      .values(notificationsToInsert)
      .returning();

    // Send WebSocket notifications to each user
    userIds.forEach((userId, index) => {
      sendNotificationToUser(userId, {
        title,
        message,
        type: type || 'general'
      });
    });

    return res.status(201).json({ 
      count: newNotifications.length,
      message: 'Batch notifications created successfully' 
    });
  } catch (error) {
    console.error('Error creating batch notifications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a notification
notificationRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const notificationId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // First check if the notification belongs to the user
    const [notification] = await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.id, notificationId.toString()),
        eq(notifications.userId, userId.toString())
      ));

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Delete the notification
    await db.delete(notifications)
      .where(eq(notifications.id, notificationId.toString()));

    return res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});