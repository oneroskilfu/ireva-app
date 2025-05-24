import { messaging } from '../firebase/firebaseAdmin';  // Import from centralized location
import { Request, Response } from 'express';
import { db } from '../db';
import { pushSubscriptions } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Use centralized Firebase Admin initialization
// Send notification to all users with push tokens
export const sendNotificationToAll = async (req: Request, res: Response) => {
  try {
    const { title, body, clickAction } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }
    
    // Get all push tokens from database
    const subscriptions = await db.select().from(pushSubscriptions);
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No push notification subscriptions found' });
    }
    
    const tokens = subscriptions.map(sub => sub.token);
    
    // Create message payload
    const message = {
      notification: { 
        title, 
        body,
        icon: '/icons/icon-192x192.png',
        clickAction: clickAction || '/'
      },
      tokens,
    };
    
    // Send the message using the imported messaging service
    const response = await messaging.sendMulticast(message);
    
    // Save notification results for reporting
    const adminId = req.user?.id;
    
    // Return the response
    return res.status(200).json({
      message: 'Notifications sent successfully',
      stats: {
        total: tokens.length,
        success: response.successCount,
        failed: response.failureCount
      },
      responses: response.responses
    });
    
  } catch (error: any) {
    console.error('Error sending notifications:', error);
    return res.status(500).json({ 
      message: 'Server error sending notifications',
      error: error.message || 'Unknown error'
    });
  }
};

// Send notification to specific user by userId
export const sendNotificationToUser = async (req: Request, res: Response) => {
  try {
    const { userId, title, body, clickAction } = req.body;
    
    if (!userId || !title || !body) {
      return res.status(400).json({ message: 'User ID, title and body are required' });
    }
    
    // Get user's push token from database
    const subscriptions = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No push subscription found for this user' });
    }
    
    const tokens = subscriptions.map(sub => sub.token);
    
    // Create message payload
    const message = {
      notification: { 
        title, 
        body,
        icon: '/icons/icon-192x192.png',
        clickAction: clickAction || '/'
      },
      tokens,
    };
    
    // Send the message using the imported messaging service
    const response = await messaging.sendMulticast(message);
    
    // Return the response
    return res.status(200).json({
      message: 'Notification sent to user',
      stats: {
        total: tokens.length,
        success: response.successCount,
        failed: response.failureCount
      }
    });
    
  } catch (error: any) {
    console.error('Error sending notification to user:', error);
    return res.status(500).json({ 
      message: 'Server error sending notification',
      error: error.message || 'Unknown error'
    });
  }
};

// Send notification to a segment of users
export const sendNotificationToSegment = async (req: Request, res: Response) => {
  try {
    const { segment, title, body, clickAction } = req.body;
    
    if (!segment || !title || !body) {
      return res.status(400).json({ message: 'Segment, title and body are required' });
    }
    
    // Logic to get users based on segment would be implemented here
    // For now, we'll just get all users as an example
    const subscriptions = await db.select().from(pushSubscriptions);
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ message: 'No push notification subscriptions found' });
    }
    
    const tokens = subscriptions.map(sub => sub.token);
    
    // Create message payload
    const message = {
      notification: { 
        title, 
        body,
        icon: '/icons/icon-192x192.png',
        clickAction: clickAction || '/'
      },
      tokens,
    };
    
    // Send the message using the imported messaging service
    const response = await messaging.sendMulticast(message);
    
    // Return the response
    return res.status(200).json({
      message: `Notifications sent to ${segment} segment`,
      stats: {
        total: tokens.length,
        success: response.successCount,
        failed: response.failureCount
      }
    });
    
  } catch (error: any) {
    console.error('Error sending segment notifications:', error);
    return res.status(500).json({ 
      message: 'Server error sending segment notifications',
      error: error.message || 'Unknown error'
    });
  }
};