import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { sendPushNotificationToMultipleUsers, sendPushNotificationToUser } from '../services/notificationService';
import { ensureAdmin } from '../auth-jwt';

export const pushNotificationSendRouter = express.Router();

// Route to send push notification to all users (admin only)
pushNotificationSendRouter.post('/send-push', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { title, body, link, userIds } = req.body;

    if (!title || !body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and body are required' 
      });
    }

    const result = await sendPushNotificationToMultipleUsers(
      title, 
      body, 
      link, 
      userIds // Optional: specific users to send to
    );

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error sending push notifications:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error sending push notifications' 
    });
  }
});

// Route to send push notification to a specific user (admin only)
pushNotificationSendRouter.post('/send-push/user/:userId', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { title, body, link } = req.body;
    const { userId } = req.params;

    if (!title || !body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and body are required' 
      });
    }

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const result = await sendPushNotificationToUser(userId, title, body, link);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error sending push notification to user:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error sending push notification' 
    });
  }
});