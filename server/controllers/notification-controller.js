/**
 * Notification Controller
 * 
 * Handles all notification-related operations including:
 * - Fetching user notifications
 * - Marking notifications as read
 * - Creating new notifications
 * - Managing notification preferences
 */

const { eq, and, desc, asc, ne, sql } = require('drizzle-orm');
const { db } = require('../db.cjs');
const { notifications, users } = require('../../shared/schema');
const securityMiddleware = require('../middleware/security-middleware');

/**
 * Get user notifications with pagination and filtering
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type, isRead, sort = 'desc' } = req.query;
    
    // Convert to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Base query
    let query = db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId));
    
    // Add type filter if provided
    if (type) {
      query = query.where(eq(notifications.type, type));
    }
    
    // Add read status filter if provided
    if (isRead !== undefined) {
      const isReadBool = isRead === 'true';
      query = query.where(eq(notifications.isRead, isReadBool));
    }
    
    // Add sorting
    query = query.orderBy(
      sort === 'asc' 
        ? asc(notifications.createdAt) 
        : desc(notifications.createdAt)
    );
    
    // Execute query with pagination
    const userNotifications = await query
      .limit(limitNum)
      .offset(offset);
    
    // Get total count for pagination
    const [{ count }] = await db.select({
      count: db.fn.count()
    })
    .from(notifications)
    .where(eq(notifications.userId, userId));
    
    const totalItems = Number(count);
    const totalPages = Math.ceil(totalItems / limitNum);
    
    // Get unread count
    const [{ unreadCount }] = await db.select({
      unreadCount: db.fn.count()
    })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      )
    );
    
    res.status(200).json({
      status: 'success',
      data: { 
        notifications: userNotifications,
        unreadCount: Number(unreadCount),
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving notifications'
    });
  }
};

/**
 * Mark a notification as read
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    // Verify notification belongs to the user
    const [notification] = await db.select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );
    
    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }
    
    // Update notification
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
    
    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating notification'
    });
  }
};

/**
 * Mark all user notifications as read
 */
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update all unread notifications for the user
    await db.update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
    
    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating notifications'
    });
  }
};

/**
 * Create a new notification for a user
 */
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, link } = req.body;
    
    // Validate required fields
    if (!userId || !title || !message || !type) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: userId, title, message, and type are required'
      });
    }
    
    // Verify user exists (admin only, regular users can't create notifications for others)
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You cannot create notifications for other users'
      });
    }
    
    // Create notification
    const [newNotification] = await db.insert(notifications)
      .values({
        userId,
        title,
        message,
        type,
        link: link || null,
        isRead: false,
        createdAt: new Date()
      })
      .returning();
    
    res.status(201).json({
      status: 'success',
      data: { notification: newNotification }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while creating notification'
    });
  }
};

/**
 * Delete a notification
 */
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    // Verify notification belongs to the user
    const [notification] = await db.select()
      .from(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      );
    
    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }
    
    // Delete notification
    await db.delete(notifications)
      .where(eq(notifications.id, notificationId));
    
    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while deleting notification'
    });
  }
};

/**
 * Create notifications for all investors of a property
 * Used for property updates, ROI payments, etc.
 */
exports.createPropertyNotifications = async (req, res) => {
  try {
    // Admin only endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Admin access required'
      });
    }
    
    const { propertyId, title, message, type, link } = req.body;
    
    // Validate required fields
    if (!propertyId || !title || !message || !type) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: propertyId, title, message, and type are required'
      });
    }
    
    // Get all users who invested in the property
    const investorIds = await db.select({
      userId: sql`DISTINCT ${investments.userId}`
    })
    .from(investments)
    .where(
      and(
        eq(investments.propertyId, propertyId),
        eq(investments.status, 'active')
      )
    );
    
    if (investorIds.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No investors found for this property'
      });
    }
    
    // Create notifications for each investor
    const notificationValues = investorIds.map(({ userId }) => ({
      userId,
      title,
      message,
      type,
      link: link || null,
      isRead: false,
      createdAt: new Date()
    }));
    
    await db.insert(notifications).values(notificationValues);
    
    res.status(201).json({
      status: 'success',
      message: `Notifications sent to ${investorIds.length} investors`,
      data: { notificationCount: investorIds.length }
    });
  } catch (error) {
    console.error('Error creating property notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while creating notifications'
    });
  }
};

/**
 * Update user notification preferences
 */
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;
    
    // Validate preferences
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid preferences format'
      });
    }
    
    // Get current user
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Merge existing preferences with new ones
    const currentPreferences = user.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      notifications: {
        ...(currentPreferences.notifications || {}),
        ...(preferences.notifications || {})
      },
      // other preference categories can be added here
    };
    
    // Update user preferences
    await db.update(users)
      .set({ 
        preferences: updatedPreferences,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    res.status(200).json({
      status: 'success',
      message: 'Notification preferences updated',
      data: { preferences: updatedPreferences }
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating preferences'
    });
  }
};