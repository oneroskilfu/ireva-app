import { messaging } from '../firebase/firebaseAdmin';
import { db } from '../db';
import { pushSubscriptions } from '@shared/schema';
import { eq, inArray, or, SQL } from 'drizzle-orm';

// Function to send push notification to multiple users
export async function sendPushNotificationToMultipleUsers(
  title: string, 
  body: string, 
  link?: string,
  userIds?: string[]
) {
  try {
    let subscriptions;
    
    // If specific userIds are provided, filter by those users
    if (userIds && userIds.length > 0) {
      subscriptions = await db.select().from(pushSubscriptions)
        .where(inArray(pushSubscriptions.userId, userIds));
    } else {
      subscriptions = await db.select().from(pushSubscriptions);
    }
    
    
    if (subscriptions.length === 0) {
      console.log('No tokens to send to.');
      return {
        success: false,
        message: 'No tokens to send to',
        tokensCount: 0
      };
    }

    // Extract tokens from subscriptions
    const tokens = subscriptions.map(sub => sub.token);
    
    // Create the notification message
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        url: link || '/',
        click_action: 'OPEN_NOTIFICATION'
      },
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
      },
      tokens // Send to multiple tokens in one request
    };

    // Send the notification
    const response = await messaging.sendMulticast(message);
    
    return {
      success: true,
      message: `${response.successCount} messages were sent successfully`,
      tokensCount: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error sending push notification',
      tokensCount: 0
    };
  }
}

// Function to send notification to a single user
export async function sendPushNotificationToUser(
  userId: string,
  title: string,
  body: string,
  link?: string
) {
  return sendPushNotificationToMultipleUsers(title, body, link, [userId]);
}