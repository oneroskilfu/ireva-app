import express, { Request, Response } from 'express';
import { authMiddleware, ensureAdmin } from '../auth-jwt';
import { db } from '../db';
import { pushSubscriptions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import axios from 'axios';

const pushNotificationRouter = express.Router();

// Middleware to ensure user is authenticated
pushNotificationRouter.use(authMiddleware);

/**
 * @route   POST /api/push-notifications/subscribe
 * @desc    Save a user's push notification subscription
 * @access  Private (requires authentication)
 */
pushNotificationRouter.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const userId = req.jwtPayload?.id;

    if (!token) {
      return res.status(400).json({ message: 'Push token is required' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if subscription already exists
    const existingSubscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId.toString()));

    if (existingSubscriptions.length > 0) {
      // Update existing subscription
      await db
        .update(pushSubscriptions)
        .set({ token, updatedAt: new Date() })
        .where(eq(pushSubscriptions.userId, userId.toString()));
    } else {
      // Create new subscription
      await db.insert(pushSubscriptions).values({
        userId: userId.toString(),
        token,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return res.status(200).json({ message: 'Push notification subscription saved successfully' });
  } catch (error) {
    console.error('Error saving push notification subscription:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/push-notifications/unsubscribe
 * @desc    Remove a user's push notification subscription
 * @access  Private (requires authentication)
 */
pushNotificationRouter.delete('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId.toString()));

    return res.status(200).json({ message: 'Push notification subscription removed successfully' });
  } catch (error) {
    console.error('Error removing push notification subscription:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/push-notifications/send-test
 * @desc    Send a test push notification to the current user
 * @access  Private (requires authentication)
 */
pushNotificationRouter.post('/send-test', async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const { title, body, icon, clickAction } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    // Get user's subscription
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId.toString()));

    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No push subscription found for this user' });
    }

    // Send notification via Firebase Cloud Messaging
    if (process.env.FIREBASE_SERVER_KEY) {
      try {
        const response = await axios.post(
          'https://fcm.googleapis.com/fcm/send',
          {
            to: subscriptions[0].token,
            notification: {
              title,
              body,
              icon: icon || '/icons/icon-192x192.png',
              click_action: clickAction || '/',
            },
            data: {
              url: clickAction || '/',
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
            },
          }
        );

        return res.status(200).json({
          message: 'Test notification sent successfully',
          fcmResponse: response.data,
        });
      } catch (error: any) {
        console.error('Error sending FCM notification:', error);
        return res.status(500).json({
          message: 'Error sending Firebase notification',
          error: error.response?.data || error.message || 'Unknown error',
        });
      }
    } else {
      // Mock successful response for development without Firebase key
      console.log('FIREBASE_SERVER_KEY not set, mock notification sent');
      return res.status(200).json({
        message: 'Test notification would be sent (mock)',
        mockNotification: { title, body, icon, clickAction },
      });
    }
  } catch (error) {
    console.error('Error sending test push notification:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/push-notifications/admin/send
 * @desc    Admin sends push notification to all users or selected users
 * @access  Admin only
 */
pushNotificationRouter.post('/admin/send', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { title, body, type, priority, clickAction, sendToAll, targetSegment } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    // Get all user subscriptions or filter by segment if needed
    let userSubscriptions;
    
    if (sendToAll) {
      userSubscriptions = await db.select().from(pushSubscriptions);
    } else {
      // Here you would implement logic to filter subscriptions by segment
      // For example: active users, users in a certain region, etc.
      // This is a simplified example
      userSubscriptions = await db.select().from(pushSubscriptions);
      console.log(`Would filter by segment: ${targetSegment}`);
    }

    if (userSubscriptions.length === 0) {
      return res.status(404).json({ message: 'No push subscriptions found' });
    }

    let successCount = 0;
    let errorCount = 0;

    // Send notification via Firebase Cloud Messaging
    if (process.env.FIREBASE_SERVER_KEY) {
      // Get all tokens
      const tokens = userSubscriptions.map(sub => sub.token);
      
      try {
        // Send to multiple recipients
        const response = await axios.post(
          'https://fcm.googleapis.com/fcm/send',
          {
            registration_ids: tokens,
            notification: {
              title,
              body,
              icon: '/icons/icon-192x192.png',
              click_action: clickAction || '/',
            },
            data: {
              url: clickAction || '/',
              type,
              priority,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
            },
          }
        );

        // Parse FCM response
        const fcmResponse = response.data;
        successCount = fcmResponse.success || 0;
        errorCount = fcmResponse.failure || 0;

        return res.status(200).json({
          message: 'Notifications sent successfully',
          stats: {
            total: tokens.length,
            success: successCount,
            failed: errorCount,
          },
          fcmResponse,
        });
      } catch (error: any) {
        console.error('Error sending batch FCM notifications:', error);
        return res.status(500).json({
          message: 'Error sending Firebase notifications',
          error: error.response?.data || error.message || 'Unknown error',
        });
      }
    } else {
      // Mock successful response for development without Firebase key
      console.log('FIREBASE_SERVER_KEY not set, mock notifications sent');
      return res.status(200).json({
        message: `${userSubscriptions.length} notifications would be sent (mock)`,
        mockNotification: { title, body, clickAction, type, priority },
        stats: {
          total: userSubscriptions.length,
          success: userSubscriptions.length,
          failed: 0,
        },
      });
    }
  } catch (error) {
    console.error('Error sending admin push notifications:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/push-notifications/stats
 * @desc    Get push notification statistics for admins
 * @access  Admin only
 */
pushNotificationRouter.get('/stats', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const totalSubscriptions = await db
      .select({ count: pushSubscriptions.id })
      .from(pushSubscriptions)
      .then(result => result[0]?.count || 0);

    // This would be expanded with more detailed stats in a real implementation
    return res.status(200).json({
      totalSubscriptions,
      // These would be actual DB queries in a real implementation
      mockStats: {
        totalSentToday: 24,
        averageOpenRate: 68,
        averageClickRate: 42,
        activeSubscribers: totalSubscriptions,
      }
    });
  } catch (error) {
    console.error('Error getting push notification stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export { pushNotificationRouter };