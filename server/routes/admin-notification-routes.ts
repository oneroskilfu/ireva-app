import { Router, Request, Response } from 'express';
import { ensureAdmin } from '../auth-jwt';
import { db } from '../db';
import { notifications, users, insertNotificationSchema } from '../../shared/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { sendNotificationToUser, broadcastToUser } from '../socketio';
import { zodValidator } from '../utils/validators';

export const adminNotificationRouter = Router();

// Get all notifications (admin only)
adminNotificationRouter.get('/all', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const allNotifications = await db.select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));

    return res.status(200).json(allNotifications);
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Send notification to a specific user
adminNotificationRouter.post('/user/:userId', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { title, message, link, type } = req.body;
    const userId = parseInt(req.params.userId);
    
    // Validate user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [newNotification] = await db.insert(notifications)
      .values({
        userId: userId.toString(), // Convert to string as schema expects string
        title,
        message,
        link: link || null,
        type: type || 'admin',
        isRead: false,
        createdAt: new Date()
      })
      .returning();

    // Send notification via WebSocket
    sendNotificationToUser(userId.toString(), {
      title,
      message,
      type: type || 'admin'
    });

    return res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification for user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Send broadcast notification to all users
adminNotificationRouter.post('/broadcast', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { title, message, link, type, userFilter } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get all users (with optional filtering)
    let query = db.select().from(users);
    
    // Apply filters if provided
    if (userFilter?.role) {
      query = query.where(eq(users.role, userFilter.role));
    }
    
    const allUsers = await query;
    
    if (allUsers.length === 0) {
      return res.status(404).json({ message: 'No users found matching filter criteria' });
    }

    const notificationsToInsert = allUsers.map(user => ({
      userId: user.id.toString(), // Convert to string as schema expects string
      title,
      message,
      link: link || null,
      type: type || 'broadcast',
      isRead: false,
      createdAt: new Date()
    }));

    const newNotifications = await db.insert(notifications)
      .values(notificationsToInsert)
      .returning();

    // Send WebSocket notifications to each user
    allUsers.forEach((user) => {
      sendNotificationToUser(user.id.toString(), {
        title,
        message,
        type: type || 'broadcast'
      });
    });

    return res.status(201).json({ 
      count: newNotifications.length,
      message: 'Broadcast notification sent successfully' 
    });
  } catch (error) {
    console.error('Error sending broadcast notification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Send notification to users who invested in a specific property
adminNotificationRouter.post('/property/:propertyId', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { title, message, link, type } = req.body;
    const propertyId = parseInt(req.params.propertyId);
    
    if (!title || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get all users who invested in this property
    // This SQL query will depend on your schema structure for investments
    // Using SQL template tag for parameterized queries
    const result = await db.execute(sql`
      SELECT DISTINCT u.id FROM users u
      JOIN investments i ON u.id = i.userId
      WHERE i.projectId = ${propertyId}
    `);
    const investorIds = result.rows.map((row: any) => row.id);
    
    if (investorIds.length === 0) {
      return res.status(404).json({ message: 'No investors found for this property' });
    }

    const notificationsToInsert = investorIds.map(userId => ({
      userId: userId.toString(), // Convert to string as schema expects string
      title,
      message,
      link: link || `/investor/properties/${propertyId}`,
      type: type || 'property',
      isRead: false,
      createdAt: new Date()
    }));

    const newNotifications = await db.insert(notifications)
      .values(notificationsToInsert)
      .returning();

    // Send WebSocket notifications to each investor
    investorIds.forEach((userId) => {
      sendNotificationToUser(userId.toString(), {
        title,
        message,
        type: type || 'property'
      });
    });

    return res.status(201).json({ 
      count: newNotifications.length,
      message: 'Property notification sent successfully to all investors' 
    });
  } catch (error) {
    console.error('Error sending property notification:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get notification statistics
adminNotificationRouter.get('/stats', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const totalCount = await db.select({ count: notifications.id }).from(notifications);
    
    // Get read vs unread counts
    const readCount = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(eq(notifications.isRead, true));
    
    const unreadCount = await db
      .select({ count: notifications.id })
      .from(notifications)
      .where(eq(notifications.isRead, false));
    
    // Get counts by type
    const types = ['general', 'admin', 'broadcast', 'property', 'system'];
    const typeStats = await Promise.all(
      types.map(async (type) => {
        const typeCount = await db
          .select({ count: notifications.id })
          .from(notifications)
          .where(eq(notifications.type, type));
        
        return {
          type,
          count: typeCount[0]?.count || 0
        };
      })
    );
    
    return res.status(200).json({
      total: totalCount[0]?.count || 0,
      read: readCount[0]?.count || 0,
      unread: unreadCount[0]?.count || 0,
      byType: typeStats
    });
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});