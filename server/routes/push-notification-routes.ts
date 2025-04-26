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