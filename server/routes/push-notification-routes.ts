import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { db } from '../db';
import { notifications, pushSubscriptions } from '@shared/schema';
import { desc, eq, and, sql, count } from 'drizzle-orm';
import { getSocketIo } from '../socketio';

export const pushNotificationRouter = express.Router();

// Subscribe to push notifications
pushNotificationRouter.post('/subscribe', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const userId = req.jwtPayload?.id;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Check if subscription already exists for this user
    const existingSubscription = await db.query.pushSubscriptions.findFirst({
      where: (subscription) => 
        and(
          eq(subscription.userId, String(userId)),
          eq(subscription.token, token)
        )
    });

    if (existingSubscription) {
      return res.status(200).json({ message: 'Subscription already exists' });
    }

    // Insert new subscription
    await db.insert(pushSubscriptions).values({
      userId: String(userId),
      token,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Push notification subscription saved successfully' });
  } catch (error) {
    console.error('Error saving push notification subscription:', error);
    res.status(500).json({ message: 'Failed to save push notification subscription' });
  }
});

// Unsubscribe from push notifications
pushNotificationRouter.post('/unsubscribe', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const userId = req.jwtPayload?.id;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Delete subscription
    await db.delete(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, String(userId)),
          eq(pushSubscriptions.token, token)
        )
      );

    res.status(200).json({ message: 'Push notification subscription removed successfully' });
  } catch (error) {
    console.error('Error removing push notification subscription:', error);
    res.status(500).json({ message: 'Failed to remove push notification subscription' });
  }
});

// Get user notifications
pushNotificationRouter.get('/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const userNotifications = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, String(userId)))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ count: count() })
      .from(notifications)
      .where(eq(notifications.userId, String(userId)));

    res.status(200).json({
      notifications: userNotifications,
      pagination: {
        total: Number(totalCount[0]?.count || 0),
        page,
        limit,
        pages: Math.ceil(Number(totalCount[0]?.count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
pushNotificationRouter.patch('/:id/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const notificationId = req.params.id;
    const userId = req.jwtPayload?.id;

    await db.update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, String(userId))
        )
      );

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
pushNotificationRouter.patch('/mark-all-read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;

    await db.update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(eq(notifications.userId, String(userId)));

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Get unread notifications count
pushNotificationRouter.get('/unread-count', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;

    const unreadCount = await db.select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, String(userId)),
          eq(notifications.isRead, false)
        )
      );

    res.status(200).json({ count: Number(unreadCount[0]?.count || 0) });
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    res.status(500).json({ message: 'Failed to fetch unread notifications count' });
  }
});