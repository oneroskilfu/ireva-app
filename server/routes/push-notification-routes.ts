import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';

export const pushNotificationRouter = express.Router();

// Store subscriptions (in a real implementation, these would be stored in a database)
const subscriptions = new Map();

// Subscribe endpoint
pushNotificationRouter.post('/subscribe', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { subscription } = req.body;
    const userId = req.user?.id;
    
    if (!subscription || !userId) {
      return res.status(400).json({ error: 'Invalid subscription data or user not authenticated' });
    }
    
    // Store subscription for this user
    subscriptions.set(userId, subscription);
    
    console.log(`User ${userId} subscribed to push notifications`);
    
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return res.status(500).json({ error: 'Failed to subscribe to push notifications' });
  }
});

// Unsubscribe endpoint
pushNotificationRouter.post('/unsubscribe', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User not authenticated' });
    }
    
    // Remove subscription for this user
    subscriptions.delete(userId);
    
    console.log(`User ${userId} unsubscribed from push notifications`);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return res.status(500).json({ error: 'Failed to unsubscribe from push notifications' });
  }
});

// Test notification endpoint
pushNotificationRouter.post('/test-notification', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, body } = req.body;
    const userId = req.user?.id;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // For demo purposes, we'll send a notification to the current user only
    const result = await sendPushNotificationToUser(userId, title, body);
    
    if (result) {
      return res.status(200).json({ 
        success: true, 
        message: 'Notification sent successfully' 
      });
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'You need to subscribe to push notifications first' 
      });
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    return res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Admin endpoint to send a notification to all users
pushNotificationRouter.post('/admin/notify-all', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, body } = req.body;
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
    
    const results = await sendPushNotificationToAll(title, body);
    
    return res.status(200).json({ 
      success: true, 
      message: `Notification sent to ${results.filter(r => r.success).length} users`,
      results 
    });
  } catch (error) {
    console.error('Error sending notifications to all users:', error);
    return res.status(500).json({ error: 'Failed to send notifications' });
  }
});

// Example function to send a notification to a specific user
export async function sendPushNotificationToUser(userId: number, title: string, body: string) {
  try {
    const subscription = subscriptions.get(userId);
    
    if (!subscription) {
      console.log(`No push subscription found for user ${userId}`);
      return false;
    }
    
    // In a real implementation, you would use the web-push library to send the notification
    console.log(`Sending push notification to user ${userId}: ${title} - ${body}`);
    
    // Simulate successful notification
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

// Example function to send a notification to all subscribed users
export async function sendPushNotificationToAll(title: string, body: string) {
  const results = [];
  
  // Convert Map.entries() iterator to Array to avoid TypeScript downlevel iteration issue
  const subscriptionEntries = Array.from(subscriptions.entries());
  
  for (const [userId, subscription] of subscriptionEntries) {
    try {
      // In a real implementation, you would use the web-push library to send the notification
      console.log(`Sending push notification to user ${userId}: ${title} - ${body}`);
      results.push({ userId, success: true });
    } catch (error) {
      console.error(`Error sending push notification to user ${userId}:`, error);
      results.push({ userId, success: false });
    }
  }
  
  return results;
}