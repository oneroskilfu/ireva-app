import { Request, Response } from 'express';
import { db } from '../config/db';
import { and, desc, eq, inArray, like, lt, gte } from 'drizzle-orm';
import { 
  communications, 
  userSegments, 
  userCommunicationLogs, 
  users,
  kycVerifications
} from '@shared/schema';
import { broadcastToUser, broadcastToAdmins } from '../socketio';
import { sendEmail } from '../services/emailService';

interface FilterOptions {
  minInvestment?: number;
  lastActivityDays?: number;
  kycStatus?: string[];
  investorType?: string[];
  country?: string[];
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
    const matchingUsers = await getUsersMatchingFilters(segment.filters);
    
    res.json(matchingUsers);
  } catch (error: any) {
    console.error('Error fetching users by segment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to find users based on filter criteria
const getUsersMatchingFilters = async (filters: FilterOptions) => {
  // Start with a base query that gets all users
  let query = db.select().from(users);
  
  // Add filters based on the provided criteria
  if (filters) {
    // KYC Status filter
    if (filters.kycStatus && filters.kycStatus.length > 0) {
      // Join with KYC table and filter by status
      query = db.select({
        user: users
      })
      .from(users)
      .innerJoin(
        kycVerifications,
        eq(users.id, kycVerifications.userId)
      )
      .where(inArray(kycVerifications.status, filters.kycStatus))
      .then(rows => rows.map(row => row.user));
    }
    
    // Last activity days filter
    if (filters.lastActivityDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filters.lastActivityDays);
      
      query = query.where(gte(users.lastLoginAt, cutoffDate));
    }
    
    // Country filter
    if (filters.country && filters.country.length > 0) {
      query = query.where(inArray(users.country, filters.country));
    }
    
    // Registration date filters
    if (filters.registrationDateFrom) {
      query = query.where(gte(users.createdAt, filters.registrationDateFrom));
    }
    
    if (filters.registrationDateTo) {
      query = query.where(lt(users.createdAt, filters.registrationDateTo));
    }
  }
  
  return await query;
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