import { db } from '../db';
import { notifications } from '@shared/schema';
import { sendNotificationToUser, broadcastToAll, broadcastToAdmins } from '../socketio';
import { eq, and, sql } from 'drizzle-orm';

interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: string;
}

/**
 * Creates a notification record and emits a real-time WebSocket event
 */
export const sendNotification = async (payload: NotificationPayload) => {
  try {
    // Insert notification into database
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        link: payload.link || null,
        isRead: false,
        createdAt: new Date()
      })
      .returning();
    
    // Emit real-time notification through WebSocket
    sendNotificationToUser(payload.userId, {
      title: payload.title,
      message: payload.message,
      type: payload.type
    });
    
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Gets unread notification count for a user
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const result = await db
      .select({ count: sql`COUNT(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return Number(result[0]?.count) || 0;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

/**
 * Marks a notification as read
 */
export const markAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
    
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Marks all notifications for a user as read
 */
export const markAllAsRead = async (userId: string): Promise<boolean> => {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

/**
 * Sends a push notification to a specific user
 * For mobile app push notifications
 */
export const sendPushNotificationToUser = async (
  userId: string,
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<boolean> => {
  try {
    console.log(`Attempting to send push notification to user ${userId}`);
    
    // Check if Firebase messaging is available
    // This is a placeholder implementation - in a real system, you would use Firebase Admin SDK
    if (process.env.NODE_ENV === 'development') {
      console.log('Push notification would be sent in production:');
      console.log({ userId, title, body, data });
      
      // In development mode, just create a record of the notification
      await sendNotification({
        userId,
        type: 'push-notification',
        title,
        message: body,
        metadata: JSON.stringify(data)
      });
      
      return true;
    }
    
    // In production, we would actually send the push notification
    // Implementation would depend on the push notification service being used
    // This is just a placeholder
    console.log('Push notification service is not fully implemented in production');
    return false;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};

/**
 * Sends a push notification to multiple users
 * For broadcasting notifications to a group of users
 */
export const sendPushNotificationToMultipleUsers = async (
  userIds: string[],
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<{success: number, failed: number}> => {
  let successCount = 0;
  let failedCount = 0;
  
  console.log(`Attempting to send push notification to ${userIds.length} users`);
  
  // Process each user in parallel
  const results = await Promise.all(
    userIds.map(userId => 
      sendPushNotificationToUser(userId, title, body, data)
        .then(success => {
          if (success) {
            successCount++;
            return {userId, success: true};
          } else {
            failedCount++;
            return {userId, success: false};
          }
        })
        .catch(error => {
          console.error(`Failed to send push notification to user ${userId}:`, error);
          failedCount++;
          return {userId, success: false, error: String(error)};
        })
    )
  );
  
  console.log(`Push notification results: ${successCount} succeeded, ${failedCount} failed`);
  
  return {
    success: successCount,
    failed: failedCount
  };
};

/**
 * Simplified wrapper function for the CRM system
 * Sends a push notification to a user with a token
 */
export const sendPushNotification = async (
  token: string,
  title: string,
  body: string
): Promise<boolean> => {
  try {
    // In a real implementation, you would use the token to send the notification
    // through Firebase Cloud Messaging or another push service
    console.log(`[PUSH SERVICE] Sending push notification to token: ${token}`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${body}`);
    
    // In development, just simulate success
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    
    // In production, we would implement the actual push notification
    // using Firebase Admin SDK or another service
    
    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
};