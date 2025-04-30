import { Request, Response } from 'express';
import { db } from '../db';
import { SQL, and, desc, eq, inArray, like, lt, gte, sql } from 'drizzle-orm';
import { 
  communications, 
  userSegments, 
  userCommunicationLogs, 
  users,
} from '@shared/schema';
import { broadcastToUser, broadcastToAdmins } from '../socketio';
import { sendEmail } from '../services/emailService';

interface FilterOptions {
  minInvestment?: number;
  lastActivityDays?: number;
  kycStatus?: string[];
  investorType?: string[];
  registrationDateFrom?: Date;
  registrationDateTo?: Date;
}

// Get or create user segment for targeted messaging
export const getUserSegments = async (req: Request, res: Response) => {
  try {
    const segments = await db.select().from(userSegments).orderBy(desc(userSegments.createdAt));
    res.json(segments);
  } catch (error: any) {
    console.error('Error fetching user segments:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new user segment
export const createUserSegment = async (req: Request, res: Response) => {
  try {
    const { name, filters } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Segment name is required' });
    }
    
    const [segment] = await db.insert(userSegments)
      .values({
        name,
        filters
      })
      .returning();
    
    // Notify admins of new segment creation
    broadcastToAdmins({
      type: 'segment_created',
      payload: segment,
      timestamp: new Date().toISOString(),
    });
    
    res.status(201).json(segment);
  } catch (error: any) {
    console.error('Error creating user segment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get users by segment filter criteria
export const getUsersBySegment = async (req: Request, res: Response) => {
  try {
    const { segmentId } = req.params;
    
    // Get segment
    const [segment] = await db.select().from(userSegments).where(eq(userSegments.id, segmentId));
    
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    
    // Get all users matching segment filters
    const allUsers = await db.select().from(users);
    
    // Simple in-memory filtering since our schema might not match exact fields
    let matchingUsers = allUsers;
    
    // Apply filters if they exist
    if (segment.filters) {
      const filters = segment.filters;
      
      // Basic filtering logic 
      matchingUsers = allUsers.filter(user => {
        // Registration date filter
        if (filters.registrationDateFrom && user.createdAt) {
          const fromDate = new Date(filters.registrationDateFrom);
          if (new Date(user.createdAt) < fromDate) {
            return false;
          }
        }
        
        if (filters.registrationDateTo && user.createdAt) {
          const toDate = new Date(filters.registrationDateTo);
          if (new Date(user.createdAt) > toDate) {
            return false;
          }
        }
        
        // Last activity filter 
        if (filters.lastActivityDays && user.lastLoginAt) {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - filters.lastActivityDays);
          if (new Date(user.lastLoginAt) < cutoffDate) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    res.json(matchingUsers);
  } catch (error: any) {
    console.error('Error fetching users by segment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new communication
export const createCommunication = async (req: Request, res: Response) => {
  try {
    const { title, content, channel, segmentId, scheduledAt } = req.body;
    
    if (!title || !content || !channel) {
      return res.status(400).json({ error: 'Title, content and channel are required' });
    }
    
    // Create the communication
    const [communication] = await db.insert(communications)
      .values({
        title,
        content,
        channel,
        segmentId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? 'scheduled' : 'draft'
      })
      .returning();
    
    // Notify admins of new communication
    broadcastToAdmins({
      type: 'communication_created',
      payload: communication,
      timestamp: new Date().toISOString(),
    });
    
    res.status(201).json(communication);
  } catch (error: any) {
    console.error('Error creating communication:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all communications
export const getCommunications = async (req: Request, res: Response) => {
  try {
    const comms = await db.select().from(communications).orderBy(desc(communications.createdAt));
    res.json(comms);
  } catch (error: any) {
    console.error('Error fetching communications:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to get users matching filter criteria
const getUsersMatchingFilters = async (filters: any) => {
  // Get all users first
  const allUsers = await db.select().from(users);
  
  // If no filters, return all users
  if (!filters) return allUsers;
  
  // Simple in-memory filtering
  return allUsers.filter(user => {
    // Registration date filter
    if (filters.registrationDateFrom && user.createdAt) {
      const fromDate = new Date(filters.registrationDateFrom);
      if (new Date(user.createdAt) < fromDate) {
        return false;
      }
    }
    
    if (filters.registrationDateTo && user.createdAt) {
      const toDate = new Date(filters.registrationDateTo);
      if (new Date(user.createdAt) > toDate) {
        return false;
      }
    }
    
    // Last activity filter 
    if (filters.lastActivityDays && user.lastLoginAt) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filters.lastActivityDays);
      if (new Date(user.lastLoginAt) < cutoffDate) {
        return false;
      }
    }
    
    return true;
  });
};

// Send a communication immediately to users in segment
export const sendCommunication = async (req: Request, res: Response) => {
  try {
    const { communicationId } = req.params;
    
    // Get the communication
    const [communication] = await db.select().from(communications)
      .where(eq(communications.id, communicationId));
    
    if (!communication) {
      return res.status(404).json({ error: 'Communication not found' });
    }
    
    // Get target users
    let targetUsers: any[] = [];
    
    if (communication.segmentId) {
      // Get segment
      const [segment] = await db.select().from(userSegments)
        .where(eq(userSegments.id, communication.segmentId));
      
      if (!segment) {
        return res.status(404).json({ error: 'Segment not found' });
      }
      
      // Get users matching segment filters
      targetUsers = await getUsersMatchingFilters(segment.filters);
    } else {
      // If no segment specified, send to all users
      targetUsers = await db.select().from(users);
    }
    
    // Send communication to each user
    const sent = await Promise.all(targetUsers.map(async (user) => {
      // Create a log entry for this communication
      const [log] = await db.insert(userCommunicationLogs)
        .values({
          userId: user.id,
          communicationId: communication.id,
          status: 'sent',
          sentAt: new Date()
        })
        .returning();
      
      // Send based on channel
      switch (communication.channel) {
        case 'email':
          // Send email
          if (user.email) {
            await sendEmail({
              to: user.email,
              subject: communication.title,
              html: communication.content
            });
          }
          break;
        
        case 'push':
          // Send push notification via WebSocket
          broadcastToUser(user.id, {
            type: 'notification',
            payload: {
              title: communication.title,
              message: communication.content,
              type: 'crm'
            },
            timestamp: new Date().toISOString(),
          });
          break;
        
        case 'sms':
          // SMS handling would be here
          console.log(`SMS to ${user.phoneNumber}: ${communication.title}`);
          break;
      }
      
      return log;
    }));
    
    // Update communication status
    await db.update(communications)
      .set({
        status: 'sent',
        updatedAt: new Date()
      })
      .where(eq(communications.id, communicationId));
    
    res.json({
      success: true,
      sentCount: sent.length,
      logs: sent
    });
  } catch (error: any) {
    console.error('Error sending communication:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get communication logs
export const getCommunicationLogs = async (req: Request, res: Response) => {
  try {
    const { communicationId } = req.params;
    
    const logs = await db.select().from(userCommunicationLogs)
      .where(eq(userCommunicationLogs.communicationId, communicationId));
    
    res.json(logs);
  } catch (error: any) {
    console.error('Error fetching communication logs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update communication status
export const updateCommunication = async (req: Request, res: Response) => {
  try {
    const { communicationId } = req.params;
    const { title, content, channel, segmentId, scheduledAt, status } = req.body;
    
    // Get the communication
    const [existingComm] = await db.select().from(communications)
      .where(eq(communications.id, communicationId));
    
    if (!existingComm) {
      return res.status(404).json({ error: 'Communication not found' });
    }
    
    // Update the communication
    const [updatedComm] = await db.update(communications)
      .set({
        title: title || existingComm.title,
        content: content || existingComm.content,
        channel: channel || existingComm.channel,
        segmentId: segmentId || existingComm.segmentId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : existingComm.scheduledAt,
        status: status || existingComm.status,
        updatedAt: new Date()
      })
      .where(eq(communications.id, communicationId))
      .returning();
    
    res.json(updatedComm);
  } catch (error: any) {
    console.error('Error updating communication:', error);
    res.status(500).json({ error: error.message });
  }
};

// Search communications
export const searchCommunications = async (req: Request, res: Response) => {
  try {
    const { query, channel, status } = req.query;
    
    // Build where clause
    let conditions = [];
    
    if (query) {
      conditions.push(like(communications.title, `%${query}%`));
    }
    
    if (channel) {
      conditions.push(eq(communications.channel, channel as string));
    }
    
    if (status) {
      conditions.push(eq(communications.status, status as string));
    }
    
    const results = conditions.length > 0 
      ? await db.select().from(communications).where(and(...conditions))
      : await db.select().from(communications);
    
    res.json(results);
  } catch (error: any) {
    console.error('Error searching communications:', error);
    res.status(500).json({ error: error.message });
  }
};