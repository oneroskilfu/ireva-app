import { Router } from "express";
import { db } from "../db";
import { directMessages, users } from "@shared/schema";
import { eq, or, and, desc } from "drizzle-orm";

const router = Router();

// Get user messages by type (inbox or sent)
router.get("/:type", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userId = req.user.id;
    const type = req.params.type; // 'inbox' or 'sent'
    
    if (type !== 'inbox' && type !== 'sent') {
      return res.status(400).json({ error: "Invalid message type. Use 'inbox' or 'sent'." });
    }

    const isInbox = type === 'inbox';
    
    // Get messages with sender and recipient details
    const messages = await db
      .select({
        id: directMessages.id,
        message: directMessages.message,
        isRead: directMessages.isRead,
        createdAt: directMessages.createdAt,
        sender: {
          id: users.id,
          name: db.sql`COALESCE(${users.firstName}, '') || ' ' || COALESCE(${users.lastName}, '')`,
          avatar: users.profileImage,
          role: users.role
        },
        recipient: {
          id: isInbox ? req.user.id : users.id,
          name: isInbox 
            ? db.sql`'You'` 
            : db.sql`COALESCE(${users.firstName}, '') || ' ' || COALESCE(${users.lastName}, '')`,
          avatar: isInbox ? null : users.profileImage,
          role: isInbox ? req.user.role : users.role
        },
        subject: directMessages.subject
      })
      .from(directMessages)
      .leftJoin(
        users, 
        isInbox 
          ? eq(directMessages.senderId, users.id) 
          : eq(directMessages.recipientId, users.id)
      )
      .where(
        isInbox
          ? eq(directMessages.recipientId, userId)
          : eq(directMessages.senderId, userId)
      )
      .orderBy(desc(directMessages.createdAt));

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get conversation (all messages between two users)
router.get("/:messageId/conversation", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userId = req.user.id;
    const messageId = parseInt(req.params.messageId);
    
    // First get the selected message to identify the conversation participants
    const [selectedMessage] = await db
      .select()
      .from(directMessages)
      .where(eq(directMessages.id, messageId));
    
    if (!selectedMessage) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    // Ensure the user is part of this conversation
    if (selectedMessage.senderId !== userId && selectedMessage.recipientId !== userId) {
      return res.status(403).json({ error: "You don't have access to this conversation" });
    }
    
    // Get the other user ID
    const otherUserId = selectedMessage.senderId === userId 
      ? selectedMessage.recipientId 
      : selectedMessage.senderId;
    
    // Get all messages between these two users
    const messages = await db
      .select({
        id: directMessages.id,
        sender: {
          id: db.sql`CASE 
            WHEN ${directMessages.senderId} = ${userId} THEN ${userId} 
            ELSE ${otherUserId} 
          END`,
          name: db.sql`CASE 
            WHEN ${directMessages.senderId} = ${userId} THEN 'You' 
            ELSE (SELECT COALESCE(firstName, '') || ' ' || COALESCE(lastName, '') FROM users WHERE id = ${otherUserId})
          END`,
          avatar: db.sql`CASE 
            WHEN ${directMessages.senderId} = ${userId} THEN (SELECT profileImage FROM users WHERE id = ${userId}) 
            ELSE (SELECT profileImage FROM users WHERE id = ${otherUserId})
          END`,
          role: db.sql`CASE 
            WHEN ${directMessages.senderId} = ${userId} THEN (SELECT role FROM users WHERE id = ${userId}) 
            ELSE (SELECT role FROM users WHERE id = ${otherUserId})
          END`
        },
        recipient: {
          id: db.sql`CASE 
            WHEN ${directMessages.recipientId} = ${userId} THEN ${userId} 
            ELSE ${otherUserId} 
          END`,
          name: db.sql`CASE 
            WHEN ${directMessages.recipientId} = ${userId} THEN 'You' 
            ELSE (SELECT COALESCE(firstName, '') || ' ' || COALESCE(lastName, '') FROM users WHERE id = ${otherUserId})
          END`,
          avatar: db.sql`CASE 
            WHEN ${directMessages.recipientId} = ${userId} THEN (SELECT profileImage FROM users WHERE id = ${userId}) 
            ELSE (SELECT profileImage FROM users WHERE id = ${otherUserId})
          END`,
          role: db.sql`CASE 
            WHEN ${directMessages.recipientId} = ${userId} THEN (SELECT role FROM users WHERE id = ${userId}) 
            ELSE (SELECT role FROM users WHERE id = ${otherUserId})
          END`
        },
        message: directMessages.message,
        isRead: directMessages.isRead,
        createdAt: directMessages.createdAt,
        subject: directMessages.subject,
        parentMessageId: directMessages.parentMessageId
      })
      .from(directMessages)
      .where(
        or(
          and(
            eq(directMessages.senderId, userId),
            eq(directMessages.recipientId, otherUserId)
          ),
          and(
            eq(directMessages.senderId, otherUserId),
            eq(directMessages.recipientId, userId)
          )
        )
      )
      .orderBy(directMessages.createdAt);
    
    res.json(messages);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark a message as read
router.patch("/:id/read", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const messageId = parseInt(req.params.id);
    
    // Find the message and check if user is the recipient
    const [message] = await db
      .select()
      .from(directMessages)
      .where(
        and(
          eq(directMessages.id, messageId),
          eq(directMessages.recipientId, req.user.id)
        )
      );
    
    if (!message) {
      return res.status(404).json({ error: "Message not found or you don't have permission" });
    }
    
    // Update the message as read
    const [updatedMessage] = await db
      .update(directMessages)
      .set({
        isRead: true,
        readAt: new Date()
      })
      .where(eq(directMessages.id, messageId))
      .returning();
    
    res.json(updatedMessage);
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Send a new message or reply
router.post("/", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { recipientId, subject, body, parentMessageId } = req.body;
    
    if (!body || body.trim() === '') {
      return res.status(400).json({ error: "Message body is required" });
    }
    
    // If it's a new message (not a reply), we need a recipient and subject
    if (!parentMessageId) {
      if (!recipientId) {
        return res.status(400).json({ error: "Recipient is required" });
      }
      
      if (!subject || subject.trim() === '') {
        return res.status(400).json({ error: "Subject is required for new messages" });
      }
    }
    
    let messageData = {};
    
    if (parentMessageId) {
      // It's a reply - get the original message to determine the recipient
      const [originalMessage] = await db
        .select()
        .from(directMessages)
        .where(eq(directMessages.id, parentMessageId));
      
      if (!originalMessage) {
        return res.status(404).json({ error: "Original message not found" });
      }
      
      // The recipient of this message is the sender of the original message (if that's not the current user)
      const replyRecipientId = originalMessage.senderId === req.user.id 
        ? originalMessage.recipientId 
        : originalMessage.senderId;
      
      messageData = {
        senderId: req.user.id,
        recipientId: replyRecipientId,
        subject: originalMessage.subject, // Keep the same subject
        message: body,
        parentMessageId: parentMessageId,
        isRead: false,
        createdAt: new Date()
      };
    } else {
      // It's a new message
      messageData = {
        senderId: req.user.id,
        recipientId: parseInt(recipientId),
        subject,
        message: body,
        isRead: false,
        createdAt: new Date()
      };
    }
    
    // Insert the message
    const [newMessage] = await db
      .insert(directMessages)
      .values(messageData)
      .returning();
    
    // Return the message with sender and recipient info
    const [messageWithDetails] = await db
      .select({
        id: directMessages.id,
        message: directMessages.message,
        isRead: directMessages.isRead,
        createdAt: directMessages.createdAt,
        subject: directMessages.subject,
        parentMessageId: directMessages.parentMessageId,
        sender: {
          id: req.user.id,
          name: db.sql`(SELECT COALESCE(firstName, '') || ' ' || COALESCE(lastName, '') FROM users WHERE id = ${req.user.id})`,
          avatar: db.sql`(SELECT profileImage FROM users WHERE id = ${req.user.id})`,
          role: db.sql`(SELECT role FROM users WHERE id = ${req.user.id})`
        },
        recipient: {
          id: newMessage.recipientId,
          name: db.sql`(SELECT COALESCE(firstName, '') || ' ' || COALESCE(lastName, '') FROM users WHERE id = ${newMessage.recipientId})`,
          avatar: db.sql`(SELECT profileImage FROM users WHERE id = ${newMessage.recipientId})`,
          role: db.sql`(SELECT role FROM users WHERE id = ${newMessage.recipientId})`
        }
      })
      .from(directMessages)
      .where(eq(directMessages.id, newMessage.id));
    
    res.status(201).json(messageWithDetails);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;