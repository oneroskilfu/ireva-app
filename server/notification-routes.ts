import { Request, Response, Router } from "express";
import { eq, and, isNull, desc } from "drizzle-orm";
import { db } from "./db";
import { notifications, users, insertNotificationSchema } from "@shared/schema";
import { authMiddleware } from "./auth-jwt";
import { zodValidator } from "./utils/validators";
import { z } from "zod";

const notificationRouter = Router();

// Get all notifications for the logged-in user
notificationRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User ID not found" });
    }
    
    const userNotifications = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, req.user.id))
      .orderBy(desc(notifications.createdAt));
    
    res.json(userNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Get unread notification count for the logged-in user
notificationRouter.get("/unread", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User ID not found" });
    }
    
    const unreadNotifications = await db.select({ count: notifications.id })
      .from(notifications)
      .where(and(
        eq(notifications.userId, req.user.id),
        eq(notifications.isRead, false)
      ));
    
    const unreadCount = unreadNotifications.length;
    
    res.json({ count: unreadCount });
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    res.status(500).json({ error: "Failed to fetch unread notifications count" });
  }
});

// Mark a notification as read
notificationRouter.patch("/:id/read", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User ID not found" });
    }
    
    const { id } = req.params;
    
    // Verify the notification belongs to the user
    const [notification] = await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.id, parseInt(id)),
        eq(notifications.userId, req.user.id)
      ));
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    // Update the notification to mark as read
    await db.update(notifications)
      .set({
        isRead: true,
        readAt: new Date()
      })
      .where(eq(notifications.id, parseInt(id)));
    
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Admin: Send a notification to a specific user or broadcast to all users
notificationRouter.post(
  "/", 
  authMiddleware,
  zodValidator(z.object({
    userId: z.number().optional(), // If not provided, send to all users
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
    type: z.enum(["system", "investment", "property", "kyc", "payment", "social", "forum"]),
    link: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  })),
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "User ID not found" });
      }
      
      // Check if user is admin
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Only admins can send notifications" });
      }
      
      const { userId, title, message, type, link, metadata } = req.body;
      
      // If userId is provided, send to specific user
      if (userId) {
        // Verify the user exists
        const [targetUser] = await db.select()
          .from(users)
          .where(eq(users.id, userId));
        
        if (!targetUser) {
          return res.status(404).json({ error: "User not found" });
        }
        
        // Create notification for specific user
        const [newNotification] = await db.insert(notifications)
          .values({
            userId,
            title,
            message,
            type,
            link,
            metadata,
            isRead: false,
          })
          .returning();
        
        return res.status(201).json(newNotification);
      } else {
        // Broadcast to all users
        const allUsers = await db.select()
          .from(users);
        
        // Create notifications in bulk
        const notificationValues = allUsers.map(user => ({
          userId: user.id,
          title,
          message,
          type,
          link,
          metadata,
          isRead: false,
        }));
        
        // Insert all notifications
        await db.insert(notifications)
          .values(notificationValues);
        
        return res.status(201).json({
          message: `Notification broadcast to ${allUsers.length} users`,
          recipients: allUsers.length
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  }
);

// Mark all notifications as read for the logged-in user
notificationRouter.patch("/mark-all-read", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User ID not found" });
    }
    
    await db.update(notifications)
      .set({
        isRead: true,
        readAt: new Date()
      })
      .where(and(
        eq(notifications.userId, req.user.id),
        eq(notifications.isRead, false)
      ));
    
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

export default notificationRouter;