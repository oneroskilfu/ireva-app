import { db } from '../db';
import { eq, and, or, desc, sql } from 'drizzle-orm';
import { 
  messages,
  users,
  InsertMessage,
  Message
} from '../../shared/schema';

/**
 * Message Service
 * 
 * This service provides methods to manage the messaging system between users
 * (investors, admins, project developers).
 */
class MessageService {
  /**
   * Send a new message
   * 
   * @param messageData Message data to be sent
   * @returns The created message
   */
  async sendMessage(messageData: InsertMessage): Promise<Message> {
    try {
      const [message] = await db.insert(messages)
        .values(messageData)
        .returning();
      
      console.log(`Message sent from user ${messageData.senderId} to user ${messageData.receiverId}`);
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  /**
   * Send a system message to a user
   * 
   * @param userId Recipient user ID
   * @param subject Message subject
   * @param content Message content
   * @param metadata Additional metadata (optional)
   * @returns The created message
   */
  async sendSystemMessage(
    userId: number,
    subject: string,
    content: string,
    metadata?: any
  ): Promise<Message> {
    return this.sendMessage({
      senderId: 0, // System user ID (consider having a dedicated system user)
      receiverId: userId,
      subject,
      content,
      isSystemMessage: true,
      metadata: metadata || null,
      status: 'unread'
    });
  }
  
  /**
   * Reply to an existing message
   * 
   * @param originalMessageId The ID of the message being replied to
   * @param senderId Sender user ID
   * @param content Reply content
   * @param metadata Additional metadata (optional)
   * @returns The created reply message
   */
  async replyToMessage(
    originalMessageId: number,
    senderId: number,
    content: string,
    metadata?: any
  ): Promise<Message> {
    try {
      // Get the original message
      const originalMessage = await this.getMessageById(originalMessageId);
      if (!originalMessage) {
        throw new Error('Original message not found');
      }
      
      // Create reply with parent message ID
      return this.sendMessage({
        senderId,
        receiverId: originalMessage.senderId, // Reply to the original sender
        subject: originalMessage.subject ? `Re: ${originalMessage.subject}` : undefined,
        content,
        parentMessageId: originalMessageId,
        metadata: metadata || null,
        status: 'unread'
      });
    } catch (error) {
      console.error('Error replying to message:', error);
      throw error;
    }
  }
  
  /**
   * Get a message by its ID
   * 
   * @param messageId Message ID
   * @returns The message or undefined if not found
   */
  async getMessageById(messageId: number): Promise<Message | undefined> {
    try {
      const [message] = await db.select()
        .from(messages)
        .where(eq(messages.id, messageId));
      
      return message;
    } catch (error) {
      console.error(`Error fetching message with ID ${messageId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all messages for a user (both sent and received)
   * 
   * @param userId User ID
   * @returns Array of messages
   */
  async getUserMessages(userId: number): Promise<Message[]> {
    try {
      return db.select()
        .from(messages)
        .where(or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        ))
        .orderBy(desc(messages.createdAt));
    } catch (error) {
      console.error(`Error fetching messages for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get inbox messages (received by user)
   * 
   * @param userId User ID
   * @param includeDeleted Whether to include deleted messages
   * @returns Array of received messages
   */
  async getInboxMessages(userId: number, includeDeleted = false): Promise<Message[]> {
    try {
      let query = db.select({
          message: messages,
          senderName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`.as('sender_name')
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.receiverId, userId));
      
      if (!includeDeleted) {
        query = query.where(sql`${messages.status} != 'deleted'`);
      }
      
      const results = await query.orderBy(desc(messages.createdAt));
      
      // Extract messages from the results
      return results.map(r => ({
        ...r.message,
        // Add sender name to the message object
        senderName: r.senderName || 'System'
      }));
    } catch (error) {
      console.error(`Error fetching inbox messages for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get sent messages (sent by user)
   * 
   * @param userId User ID
   * @param includeDeleted Whether to include deleted messages
   * @returns Array of sent messages
   */
  async getSentMessages(userId: number, includeDeleted = false): Promise<Message[]> {
    try {
      let query = db.select({
          message: messages,
          receiverName: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`.as('receiver_name')
        })
        .from(messages)
        .leftJoin(users, eq(messages.receiverId, users.id))
        .where(eq(messages.senderId, userId));
      
      if (!includeDeleted) {
        query = query.where(sql`${messages.status} != 'deleted'`);
      }
      
      const results = await query.orderBy(desc(messages.createdAt));
      
      // Extract messages from the results
      return results.map(r => ({
        ...r.message,
        // Add receiver name to the message object
        receiverName: r.receiverName || 'Unknown'
      }));
    } catch (error) {
      console.error(`Error fetching sent messages for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get unread messages count for a user
   * 
   * @param userId User ID
   * @returns Count of unread messages
   */
  async getUnreadMessagesCount(userId: number): Promise<number> {
    try {
      const result = await db.select({ 
          count: sql<number>`count(*)` 
        })
        .from(messages)
        .where(and(
          eq(messages.receiverId, userId),
          eq(messages.status, 'unread')
        ));
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error(`Error counting unread messages for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Mark a message as read
   * 
   * @param messageId Message ID
   * @param userId User ID (for validation)
   * @returns Updated message
   */
  async markAsRead(messageId: number, userId: number): Promise<Message> {
    try {
      const [message] = await db.select()
        .from(messages)
        .where(and(
          eq(messages.id, messageId),
          eq(messages.receiverId, userId)
        ));
      
      if (!message) {
        throw new Error('Message not found or you do not have permission to update it');
      }
      
      const now = new Date();
      const [updatedMessage] = await db.update(messages)
        .set({ 
          status: 'read',
          readAt: now
        })
        .where(eq(messages.id, messageId))
        .returning();
      
      return updatedMessage;
    } catch (error) {
      console.error(`Error marking message ${messageId} as read:`, error);
      throw error;
    }
  }
  
  /**
   * Update message status (archived/deleted)
   * 
   * @param messageId Message ID
   * @param userId User ID (for validation)
   * @param status New status
   * @returns Updated message
   */
  async updateMessageStatus(
    messageId: number, 
    userId: number, 
    status: 'read' | 'archived' | 'deleted'
  ): Promise<Message> {
    try {
      const [message] = await db.select()
        .from(messages)
        .where(and(
          eq(messages.id, messageId),
          or(
            eq(messages.receiverId, userId),
            eq(messages.senderId, userId)
          )
        ));
      
      if (!message) {
        throw new Error('Message not found or you do not have permission to update it');
      }
      
      const [updatedMessage] = await db.update(messages)
        .set({ status })
        .where(eq(messages.id, messageId))
        .returning();
      
      return updatedMessage;
    } catch (error) {
      console.error(`Error updating message ${messageId} status:`, error);
      throw error;
    }
  }
  
  /**
   * Get conversation thread (a message and all its replies)
   * 
   * @param messageId Original message ID
   * @param userId User ID (for validation)
   * @returns Array of messages in the conversation
   */
  async getConversation(messageId: number, userId: number): Promise<Message[]> {
    try {
      // Get the original message
      const originalMessage = await this.getMessageById(messageId);
      if (!originalMessage) {
        throw new Error('Original message not found');
      }
      
      // Verify permission
      if (originalMessage.senderId !== userId && originalMessage.receiverId !== userId) {
        throw new Error('You do not have permission to view this conversation');
      }
      
      // Find all messages in the same thread
      const threadMessages = await db.select()
        .from(messages)
        .where(or(
          eq(messages.id, messageId),
          eq(messages.parentMessageId, messageId)
        ))
        .orderBy(messages.createdAt);
      
      return threadMessages;
    } catch (error) {
      console.error(`Error fetching conversation for message ${messageId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const messageService = new MessageService();
export default messageService;