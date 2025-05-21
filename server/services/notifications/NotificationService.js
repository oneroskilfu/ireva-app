/**
 * NotificationService.js
 * 
 * Core service for managing and distributing notifications across multiple channels
 * Handles creation, delivery tracking, and persistence of system notifications
 */

const { eq, and, gte, desc, sql } = require('drizzle-orm');
const { db } = require('../../db.cjs');
const { notifications, users } = require('../../../shared/schema');
const EmailService = require('./EmailService');
const InAppService = require('./InAppService');
const SmsService = require('./SmsService');

class NotificationService {
  /**
   * Create a new notification record and send it through specified channels
   * 
   * @param {object} notification - Notification details
   * @param {string} notification.userId - ID of the user to notify
   * @param {string} notification.title - Notification title
   * @param {string} notification.message - Notification message content
   * @param {string} notification.type - Type of notification (investment, kyc, roi, system, etc)
   * @param {object} notification.data - Additional metadata related to the notification
   * @param {array} notification.channels - Channels to send the notification through (email, in-app, sms)
   * @param {object} options - Additional options
   * @returns {Promise<object>} Created notification and delivery statuses
   */
  static async createAndSend(notification, options = {}) {
    try {
      const {
        userId,
        title,
        message,
        type,
        data = {},
        channels = ['in-app'],
        priority = 'normal'
      } = notification;
      
      const { sendImmediately = true } = options;
      
      // Get user info for delivery
      const [user] = await db.select({
        id: users.id,
        email: users.email,
        phone: users.phone,
        notificationPreferences: users.notificationPreferences
      })
      .from(users)
      .where(eq(users.id, userId));
      
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Create initial notification record
      const [notificationRecord] = await db.insert(notifications)
        .values({
          userId,
          title,
          message,
          type,
          data: data ? JSON.stringify(data) : null,
          priority,
          createdAt: new Date(),
          isRead: false,
          deliveryStatus: sendImmediately ? 'pending' : 'scheduled',
          sentVia: channels.join(',')
        })
        .returning();
      
      // If notification should be sent immediately, proceed with delivery
      if (sendImmediately) {
        const deliveryResults = {};
        
        // Check user preferences before sending
        const userPrefs = user.notificationPreferences 
          ? JSON.parse(user.notificationPreferences) 
          : { email: true, inApp: true, sms: false };
        
        // Send through selected channels based on user preferences
        for (const channel of channels) {
          if (channel === 'email' && userPrefs.email && user.email) {
            // Send email notification
            deliveryResults.email = await EmailService.send({
              to: user.email,
              subject: title,
              message,
              type,
              metadata: data
            });
          }
          
          if (channel === 'in-app' && userPrefs.inApp) {
            // Create in-app notification
            deliveryResults.inApp = await InAppService.send({
              userId,
              notificationId: notificationRecord.id,
              title,
              message,
              type,
              data
            });
          }
          
          if (channel === 'sms' && userPrefs.sms && user.phone) {
            // Send SMS notification
            deliveryResults.sms = await SmsService.send({
              to: user.phone,
              message,
              type
            });
          }
        }
        
        // Update notification with delivery status
        let overallStatus = 'delivered';
        const delivered = [];
        
        for (const [channel, result] of Object.entries(deliveryResults)) {
          if (result.success) {
            delivered.push(channel);
          } else {
            overallStatus = 'partial';
          }
        }
        
        if (delivered.length === 0 && Object.keys(deliveryResults).length > 0) {
          overallStatus = 'failed';
        }
        
        // Update notification record with delivery status
        const [updatedNotification] = await db.update(notifications)
          .set({
            deliveryStatus: overallStatus,
            deliveredAt: new Date(),
            sentVia: delivered.join(',')
          })
          .where(eq(notifications.id, notificationRecord.id))
          .returning();
        
        return {
          notification: updatedNotification,
          deliveryResults
        };
      }
      
      return {
        notification: notificationRecord,
        scheduled: true
      };
    } catch (error) {
      console.error('Error in notification service:', error);
      throw error;
    }
  }
  
  /**
   * Get notifications for a specific user
   * 
   * @param {string} userId - User ID
   * @param {object} options - Query options (pagination, filters)
   * @returns {Promise<array>} User notifications
   */
  static async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        unreadOnly = false,
        type = null,
        startDate = null,
        endDate = null,
        sortDirection = 'desc'
      } = options;
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      // Build query
      let query = db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId));
      
      // Apply filters
      if (unreadOnly) {
        query = query.where(eq(notifications.isRead, false));
      }
      
      if (type) {
        query = query.where(eq(notifications.type, type));
      }
      
      if (startDate) {
        query = query.where(gte(notifications.createdAt, new Date(startDate)));
      }
      
      if (endDate) {
        query = query.where(sql`${notifications.createdAt} <= ${new Date(endDate)}`);
      }
      
      // Apply sorting
      if (sortDirection === 'desc') {
        query = query.orderBy(desc(notifications.createdAt));
      } else {
        query = query.orderBy(notifications.createdAt);
      }
      
      // Apply pagination
      query = query.limit(limit).offset(offset);
      
      // Execute query
      const notificationsList = await query;
      
      // Get total count (for pagination)
      const [{ count }] = await db.select({
        count: sql`COUNT(*)`
      })
      .from(notifications)
      .where(eq(notifications.userId, userId));
      
      // Format response
      const formattedNotifications = notificationsList.map(notification => ({
        ...notification,
        data: notification.data ? JSON.parse(notification.data) : null
      }));
      
      // Count unread
      const [{ unreadCount }] = await db.select({
        unreadCount: sql`COUNT(*)`
      })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
      
      return {
        notifications: formattedNotifications,
        pagination: {
          total: Number(count),
          pages: Math.ceil(Number(count) / limit),
          page,
          limit
        },
        meta: {
          unreadCount: Number(unreadCount)
        }
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }
  
  /**
   * Mark notifications as read
   * 
   * @param {string|array} notificationIds - Single ID or array of notification IDs to mark as read
   * @param {string} userId - User ID (for security check)
   * @returns {Promise<object>} Result of the operation
   */
  static async markAsRead(notificationIds, userId) {
    try {
      // Normalize to array
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      
      if (ids.length === 0) {
        return { success: false, message: 'No notification IDs provided' };
      }
      
      // Update notifications, ensuring they belong to the user
      const { rowCount } = await db.update(notifications)
        .set({
          isRead: true,
          readAt: new Date()
        })
        .where(and(
          sql`${notifications.id} IN (${ids.join(',')})`,
          eq(notifications.userId, userId)
        ));
      
      return {
        success: true,
        updatedCount: rowCount,
        message: `${rowCount} notification(s) marked as read`
      };
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }
  
  /**
   * Mark all notifications as read for a user
   * 
   * @param {string} userId - User ID
   * @returns {Promise<object>} Result of the operation
   */
  static async markAllAsRead(userId) {
    try {
      const { rowCount } = await db.update(notifications)
        .set({
          isRead: true,
          readAt: new Date()
        })
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));
      
      return {
        success: true,
        updatedCount: rowCount,
        message: `${rowCount} notification(s) marked as read`
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  /**
   * Delete notifications
   * 
   * @param {string|array} notificationIds - Single ID or array of notification IDs to delete
   * @param {string} userId - User ID (for security check)
   * @returns {Promise<object>} Result of the operation
   */
  static async deleteNotifications(notificationIds, userId) {
    try {
      // Normalize to array
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
      
      if (ids.length === 0) {
        return { success: false, message: 'No notification IDs provided' };
      }
      
      // Delete notifications, ensuring they belong to the user
      const { rowCount } = await db.delete(notifications)
        .where(and(
          sql`${notifications.id} IN (${ids.join(',')})`,
          eq(notifications.userId, userId)
        ));
      
      return {
        success: true,
        deletedCount: rowCount,
        message: `${rowCount} notification(s) deleted`
      };
    } catch (error) {
      console.error('Error deleting notifications:', error);
      throw error;
    }
  }
  
  /**
   * Create notification templates for common events
   * 
   * These methods provide standardized notifications for common platform events
   */
  
  /**
   * Create an investment success notification
   * 
   * @param {object} params - Notification parameters
   * @returns {Promise<object>} Created notification
   */
  static async investmentSuccess(params) {
    const {
      userId,
      propertyName,
      amount,
      investmentId,
      channels = ['in-app', 'email']
    } = params;
    
    return this.createAndSend({
      userId,
      title: 'Investment Successful',
      message: `Your investment of $${amount} in ${propertyName} has been processed successfully.`,
      type: 'investment',
      data: {
        investmentId,
        propertyName,
        amount,
        date: new Date().toISOString()
      },
      channels,
      priority: 'high'
    });
  }
  
  /**
   * Create a KYC status update notification
   * 
   * @param {object} params - Notification parameters
   * @returns {Promise<object>} Created notification
   */
  static async kycStatusUpdate(params) {
    const {
      userId,
      kycId,
      status,
      message,
      channels = ['in-app', 'email']
    } = params;
    
    let title, priority;
    
    switch (status) {
      case 'approved':
        title = 'KYC Verification Approved';
        priority = 'high';
        break;
      case 'rejected':
        title = 'KYC Verification Rejected';
        priority = 'high';
        break;
      case 'pending':
        title = 'KYC Verification In Progress';
        priority = 'normal';
        break;
      default:
        title = 'KYC Verification Update';
        priority = 'normal';
    }
    
    return this.createAndSend({
      userId,
      title,
      message: message || `Your KYC verification status has been updated to ${status}.`,
      type: 'kyc',
      data: {
        kycId,
        status,
        date: new Date().toISOString()
      },
      channels,
      priority
    });
  }
  
  /**
   * Create an ROI distribution notification
   * 
   * @param {object} params - Notification parameters
   * @returns {Promise<object>} Created notification
   */
  static async roiDistribution(params) {
    const {
      userId,
      propertyName,
      amount,
      investmentId,
      channels = ['in-app', 'email']
    } = params;
    
    return this.createAndSend({
      userId,
      title: 'ROI Payment Received',
      message: `You have received an ROI payment of $${amount} from your investment in ${propertyName}.`,
      type: 'roi',
      data: {
        investmentId,
        propertyName,
        amount,
        date: new Date().toISOString()
      },
      channels,
      priority: 'high'
    });
  }
  
  /**
   * Create a wallet transaction notification
   * 
   * @param {object} params - Notification parameters
   * @returns {Promise<object>} Created notification
   */
  static async walletTransaction(params) {
    const {
      userId,
      transactionType,
      amount,
      transactionId,
      status,
      channels = ['in-app']
    } = params;
    
    let title, message, priority;
    
    switch (transactionType) {
      case 'deposit':
        title = status === 'completed' ? 'Deposit Successful' : 'Deposit Processing';
        message = status === 'completed' 
          ? `Your deposit of $${amount} has been successfully added to your wallet.`
          : `Your deposit of $${amount} is being processed.`;
        priority = status === 'completed' ? 'high' : 'normal';
        break;
      case 'withdrawal':
        title = status === 'completed' ? 'Withdrawal Successful' : 'Withdrawal Processing';
        message = status === 'completed' 
          ? `Your withdrawal of $${amount} has been successfully processed.`
          : `Your withdrawal request of $${amount} is being processed.`;
        priority = status === 'completed' ? 'high' : 'normal';
        break;
      default:
        title = 'Wallet Transaction Update';
        message = `Your ${transactionType} transaction of $${amount} has been ${status}.`;
        priority = 'normal';
    }
    
    return this.createAndSend({
      userId,
      title,
      message,
      type: 'wallet',
      data: {
        transactionId,
        transactionType,
        amount,
        status,
        date: new Date().toISOString()
      },
      channels,
      priority
    });
  }
}

module.exports = NotificationService;