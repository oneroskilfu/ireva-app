import { Request, Response } from 'express';
import { messageService } from '../services/messageService';
import { insertMessageSchema } from '../../shared/schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Message controller for handling all message-related API endpoints
 */
export const messageController = {
  /**
   * Send a new message
   * POST /api/messages
   */
  async sendMessage(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Parse and validate request body
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: req.user.id // Ensure sender is the authenticated user
      });
      
      // Send the message
      const message = await messageService.sendMessage(messageData);
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      res.status(500).json({ error: 'Failed to send message' });
    }
  },
  
  /**
   * Reply to a message
   * POST /api/messages/:id/reply
   */
  async replyToMessage(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) {
        return res.status(400).json({ error: 'Invalid message ID' });
      }
      
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Message content is required' });
      }
      
      // Send reply
      const reply = await messageService.replyToMessage(
        messageId,
        req.user.id,
        content,
        req.body.metadata
      );
      
      res.status(201).json(reply);
    } catch (error) {
      console.error('Error replying to message:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to reply to message' });
    }
  },
  
  /**
   * Get inbox messages
   * GET /api/messages/inbox
   */
  async getInbox(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const includeDeleted = req.query.includeDeleted === 'true';
      const messages = await messageService.getInboxMessages(req.user.id, includeDeleted);
      
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching inbox messages:', error);
      res.status(500).json({ error: 'Failed to fetch inbox messages' });
    }
  },
  
  /**
   * Get sent messages
   * GET /api/messages/sent
   */
  async getSent(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const includeDeleted = req.query.includeDeleted === 'true';
      const messages = await messageService.getSentMessages(req.user.id, includeDeleted);
      
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching sent messages:', error);
      res.status(500).json({ error: 'Failed to fetch sent messages' });
    }
  },
  
  /**
   * Get unread messages count
   * GET /api/messages/unread/count
   */
  async getUnreadCount(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const count = await messageService.getUnreadMessagesCount(req.user.id);
      
      res.status(200).json({ count });
    } catch (error) {
      console.error('Error counting unread messages:', error);
      res.status(500).json({ error: 'Failed to count unread messages' });
    }
  },
  
  /**
   * Get a specific message by ID
   * GET /api/messages/:id
   */
  async getMessage(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) {
        return res.status(400).json({ error: 'Invalid message ID' });
      }
      
      const message = await messageService.getMessageById(messageId);
      
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }
      
      // Check if user has permission to view this message
      if (message.senderId !== req.user.id && message.receiverId !== req.user.id) {
        return res.status(403).json({ error: 'You do not have permission to view this message' });
      }
      
      // If user is the recipient and message is unread, mark it as read
      if (message.receiverId === req.user.id && message.status === 'unread') {
        await messageService.markAsRead(messageId, req.user.id);
      }
      
      res.status(200).json(message);
    } catch (error) {
      console.error('Error fetching message:', error);
      res.status(500).json({ error: 'Failed to fetch message' });
    }
  },
  
  /**
   * Mark a message as read
   * PATCH /api/messages/:id/read
   */
  async markAsRead(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) {
        return res.status(400).json({ error: 'Invalid message ID' });
      }
      
      const updatedMessage = await messageService.markAsRead(messageId, req.user.id);
      
      res.status(200).json(updatedMessage);
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to mark message as read' 
      });
    }
  },
  
  /**
   * Update message status (archived/deleted)
   * PATCH /api/messages/:id/status
   */
  async updateStatus(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) {
        return res.status(400).json({ error: 'Invalid message ID' });
      }
      
      const { status } = req.body;
      if (!status || !['read', 'archived', 'deleted'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be one of: read, archived, deleted' });
      }
      
      const updatedMessage = await messageService.updateMessageStatus(
        messageId, 
        req.user.id, 
        status as 'read' | 'archived' | 'deleted'
      );
      
      res.status(200).json(updatedMessage);
    } catch (error) {
      console.error('Error updating message status:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to update message status' 
      });
    }
  },
  
  /**
   * Get conversation thread
   * GET /api/messages/:id/conversation
   */
  async getConversation(req: Request, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) {
        return res.status(400).json({ error: 'Invalid message ID' });
      }
      
      const conversation = await messageService.getConversation(messageId, req.user.id);
      
      res.status(200).json(conversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch conversation' 
      });
    }
  }
};

export default messageController;