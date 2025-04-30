import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { db } from '../db';
import { notifications, pushSubscriptions } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';
import admin, { messaging } from '../firebase/firebaseAdmin';
import { sendNotificationToUser } from '../socketio';
import { eq } from 'drizzle-orm';

export const sendNotificationRouter = express.Router();

// Send a test notification to self
sendNotificationRouter.post('/send-self', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, message, link } = req.body;
    const userId = req.jwtPayload?.id;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // First, create a notification record in the database
    const notificationId = uuidv4();
    await db.insert(notifications).values({
      id: notificationId,
      userId: String(userId),
      title,
      message,
      type: 'general',
      isRead: false,
      link: link || null,
      createdAt: new Date()
    });

    // Get user's push subscriptions
    const userSubscriptions = await db.select().from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, String(userId)));

    // Send push notification if Firebase Admin is initialized
    if (messaging && userSubscriptions.length > 0) {
      try {
        // Prepare notification payload
        const notification = {
          title,
          body: message
        };

        const data = {
          url: link || '/',
          notificationId,
          click_action: 'OPEN_NOTIFICATION' // Custom action for handling notification click
        };

        // Send to all user's devices
        const sendPromises = userSubscriptions.map(subscription => 
          messaging.send({
            token: subscription.token,
            notification,
            data,
            webpush: {
              notification: {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                actions: [
                  {
                    action: 'view',
                    title: 'View Details'
                  }
                ]
              },
              fcmOptions: {
                link: link || '/'
              }
            }
          })
        );

        const results = await Promise.allSettled(sendPromises);
        
        // Count successful and failed sends
        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        // Emit socket event for real-time notification
        sendNotificationToUser(String(userId), {
          title,
          message,
          type: 'general'
        });

        res.status(200).json({ 
          message: 'Notification sent successfully',
          notificationId,
          pushResults: { 
            devices: userSubscriptions.length,
            succeeded,
            failed
          }
        });
      } catch (error) {
        console.error('Error sending push notification:', error);
        
        // Still return success since the notification was created in the database
        res.status(200).json({ 
          message: 'Notification saved but push notification failed',
          notificationId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      // No push subscriptions or Firebase Admin not initialized
      res.status(200).json({ 
        message: 'Notification saved but no push notification sent',
        notificationId,
        reason: !messaging ? 'Firebase Messaging not initialized' : 'No device subscriptions found'
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Failed to send notification' });
  }
});