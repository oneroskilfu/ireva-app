import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { db } from '../db';
import { fcmTokens, notifications } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Initialize Firebase Admin SDK
let messaging: any = null;

try {
  // Check if Firebase credentials are available
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : null;

  if (serviceAccount && !getApps().length) {
    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    messaging = getMessaging(app);
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else if (!serviceAccount) {
    console.log('⚠️ Firebase service account key not provided. Push notifications will be disabled.');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  actionUrl?: string;
}

export class FirebaseMessagingService {
  
  /**
   * Register an FCM token for a user
   */
  static async registerToken(
    userId: number, 
    token: string, 
    deviceType: 'ios' | 'android' | 'web',
    deviceId?: string
  ): Promise<void> {
    try {
      await db.insert(fcmTokens).values({
        userId,
        token,
        deviceType,
        deviceId,
        isActive: true,
      }).onConflictDoUpdate({
        target: [fcmTokens.userId, fcmTokens.token],
        set: {
          isActive: true,
          lastUsed: new Date(),
          deviceType,
          deviceId,
        },
      });

      console.log(`📱 FCM token registered for user ${userId} on ${deviceType}`);
    } catch (error) {
      console.error('Error registering FCM token:', error);
      throw error;
    }
  }

  /**
   * Send push notification to a specific user
   */
  static async sendToUser(
    userId: number, 
    payload: PushNotificationPayload
  ): Promise<boolean> {
    if (!messaging) {
      console.log('🚫 Firebase messaging not initialized. Skipping push notification.');
      return false;
    }

    try {
      // Get active FCM tokens for the user
      const userTokens = await db
        .select()
        .from(fcmTokens)
        .where(
          and(
            eq(fcmTokens.userId, userId),
            eq(fcmTokens.isActive, true)
          )
        );

      if (userTokens.length === 0) {
        console.log(`📱 No active FCM tokens found for user ${userId}`);
        return false;
      }

      const tokens = userTokens.map(t => t.token);

      // Prepare the message
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
          ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
        },
        data: {
          ...payload.data,
          ...(payload.actionUrl && { actionUrl: payload.actionUrl }),
          timestamp: Date.now().toString(),
        },
        tokens,
      };

      // Send the message
      const response = await messaging.sendEachForMulticast(message);

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
          }
        });

        // Deactivate failed tokens
        if (failedTokens.length > 0) {
          await this.deactivateTokens(failedTokens);
        }
      }

      // Store notification in database
      await db.insert(notifications).values({
        userId,
        title: payload.title,
        message: payload.body,
        type: 'push',
        link: payload.actionUrl,
      });

      console.log(`📨 Push notification sent to user ${userId}. Success: ${response.successCount}, Failed: ${response.failureCount}`);
      return response.successCount > 0;

    } catch (error) {
      console.error('Error sending push notification:', error);
      return false;
    }
  }

  /**
   * Send push notification to multiple users
   */
  static async sendToUsers(
    userIds: number[], 
    payload: PushNotificationPayload
  ): Promise<{ success: number; failed: number }> {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendToUser(userId, payload))
    );

    const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - success;

    return { success, failed };
  }

  /**
   * Send push notification for investment updates
   */
  static async sendInvestmentUpdate(
    userId: number,
    propertyName: string,
    updateType: 'roi_payout' | 'property_update' | 'investment_confirmed',
    amount?: number
  ): Promise<void> {
    let title: string;
    let body: string;
    let actionUrl: string;

    switch (updateType) {
      case 'roi_payout':
        title = '💰 ROI Payout Received';
        body = `You received $${amount} from ${propertyName}`;
        actionUrl = '/dashboard/investments';
        break;
      
      case 'property_update':
        title = '🏠 Property Update';
        body = `New update available for ${propertyName}`;
        actionUrl = `/properties/${propertyName}`;
        break;
      
      case 'investment_confirmed':
        title = '✅ Investment Confirmed';
        body = `Your investment in ${propertyName} has been confirmed`;
        actionUrl = '/dashboard/investments';
        break;
      
      default:
        return;
    }

    await this.sendToUser(userId, {
      title,
      body,
      actionUrl,
      data: {
        type: updateType,
        propertyName,
        ...(amount && { amount: amount.toString() }),
      },
    });
  }

  /**
   * Send push notification for KYC updates
   */
  static async sendKYCUpdate(
    userId: number,
    status: 'approved' | 'rejected' | 'pending_review'
  ): Promise<void> {
    let title: string;
    let body: string;

    switch (status) {
      case 'approved':
        title = '✅ KYC Approved';
        body = 'Your identity verification has been approved. You can now invest!';
        break;
      
      case 'rejected':
        title = '❌ KYC Requires Attention';
        body = 'Please review and resubmit your identity verification documents.';
        break;
      
      case 'pending_review':
        title = '⏳ KYC Under Review';
        body = 'Your identity verification documents are being reviewed.';
        break;
    }

    await this.sendToUser(userId, {
      title,
      body,
      actionUrl: '/profile/kyc',
      data: {
        type: 'kyc_update',
        status,
      },
    });
  }

  /**
   * Send bulk notification to all users (admin only)
   */
  static async sendBulkNotification(
    payload: PushNotificationPayload,
    userIds?: number[]
  ): Promise<{ success: number; failed: number }> {
    if (!messaging) {
      console.log('🚫 Firebase messaging not initialized');
      return { success: 0, failed: 0 };
    }

    try {
      let targetTokens: any[];

      if (userIds) {
        // Send to specific users
        targetTokens = await db
          .select()
          .from(fcmTokens)
          .where(
            and(
              eq(fcmTokens.isActive, true),
              // Add IN clause for userIds - would need proper implementation
            )
          );
      } else {
        // Send to all active users
        targetTokens = await db
          .select()
          .from(fcmTokens)
          .where(eq(fcmTokens.isActive, true));
      }

      if (targetTokens.length === 0) {
        return { success: 0, failed: 0 };
      }

      const tokens = targetTokens.map(t => t.token);
      const batchSize = 500; // FCM limit
      let totalSuccess = 0;
      let totalFailed = 0;

      // Send in batches
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batchTokens = tokens.slice(i, i + batchSize);
        
        const message = {
          notification: {
            title: payload.title,
            body: payload.body,
            ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
          },
          data: {
            ...payload.data,
            ...(payload.actionUrl && { actionUrl: payload.actionUrl }),
            timestamp: Date.now().toString(),
          },
          tokens: batchTokens,
        };

        const response = await messaging.sendEachForMulticast(message);
        totalSuccess += response.successCount;
        totalFailed += response.failureCount;

        // Handle failed tokens
        if (response.failureCount > 0) {
          const failedTokens: string[] = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              failedTokens.push(batchTokens[idx]);
            }
          });
          await this.deactivateTokens(failedTokens);
        }
      }

      console.log(`📢 Bulk notification sent. Success: ${totalSuccess}, Failed: ${totalFailed}`);
      return { success: totalSuccess, failed: totalFailed };

    } catch (error) {
      console.error('Error sending bulk notification:', error);
      return { success: 0, failed: 0 };
    }
  }

  /**
   * Deactivate invalid FCM tokens
   */
  private static async deactivateTokens(tokens: string[]): Promise<void> {
    try {
      for (const token of tokens) {
        await db
          .update(fcmTokens)
          .set({ isActive: false })
          .where(eq(fcmTokens.token, token));
      }
      console.log(`🗑️ Deactivated ${tokens.length} invalid FCM tokens`);
    } catch (error) {
      console.error('Error deactivating tokens:', error);
    }
  }

  /**
   * Get notification statistics
   */
  static async getStats(): Promise<{
    totalTokens: number;
    activeTokens: number;
    tokensByDevice: Record<string, number>;
  }> {
    try {
      const allTokens = await db.select().from(fcmTokens);
      const activeTokens = allTokens.filter(t => t.isActive);
      
      const tokensByDevice = activeTokens.reduce((acc, token) => {
        acc[token.deviceType] = (acc[token.deviceType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalTokens: allTokens.length,
        activeTokens: activeTokens.length,
        tokensByDevice,
      };
    } catch (error) {
      console.error('Error getting FCM stats:', error);
      return { totalTokens: 0, activeTokens: 0, tokensByDevice: {} };
    }
  }
}

export { FirebaseMessagingService as FCM };