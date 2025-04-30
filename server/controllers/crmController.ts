import { Request, Response } from 'express';
import { db } from '../db';
import { 
  communications,
  userCommunicationLogs,
  userSegments,
  users 
} from '@shared/schema';
import { and, eq, inArray, like, gte, lte, sql, desc } from 'drizzle-orm';
import { sendEmail } from '../services/emailService';
import { sendPushNotification } from '../services/notificationService';
import { sendSms } from '../services/smsService';

/**
 * User Segments Controller
 */

// Get all segments
export const getAllSegments = async (req: Request, res: Response) => {
  try {
    const results = await db.select().from(userSegments).orderBy(desc(userSegments.createdAt));
    
    // For each segment, count the number of users that match the segment criteria
    const segmentsWithCount = await Promise.all(
      results.map(async (segment) => {
        const userCount = await getUserCountForSegment(segment.id);
        return { ...segment, userCount };
      })
    );
    
    res.json(segmentsWithCount);
  } catch (error) {
    console.error('Error fetching segments:', error);
    res.status(500).json({ message: 'Failed to fetch segments', error: String(error) });
  }
};

// Get segment by ID
export const getSegmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [segment] = await db.select().from(userSegments).where(eq(userSegments.id, id));
    
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found' });
    }
    
    const userCount = await getUserCountForSegment(id);
    
    res.json({ ...segment, userCount });
  } catch (error) {
    console.error('Error fetching segment:', error);
    res.status(500).json({ message: 'Failed to fetch segment', error: String(error) });
  }
};

// Create a new segment
export const createSegment = async (req: Request, res: Response) => {
  try {
    const { name, filters } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Segment name is required' });
    }
    
    const [newSegment] = await db.insert(userSegments)
      .values({
        name,
        filters: filters || {},
      })
      .returning();
    
    res.status(201).json(newSegment);
  } catch (error) {
    console.error('Error creating segment:', error);
    res.status(500).json({ message: 'Failed to create segment', error: String(error) });
  }
};

// Update a segment
export const updateSegment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, filters } = req.body;
    
    const [segment] = await db.select().from(userSegments).where(eq(userSegments.id, id));
    
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found' });
    }
    
    const [updatedSegment] = await db.update(userSegments)
      .set({
        name: name || segment.name,
        filters: filters || segment.filters
      })
      .where(eq(userSegments.id, id))
      .returning();
    
    res.json(updatedSegment);
  } catch (error) {
    console.error('Error updating segment:', error);
    res.status(500).json({ message: 'Failed to update segment', error: String(error) });
  }
};

// Delete a segment
export const deleteSegment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [segment] = await db.select().from(userSegments).where(eq(userSegments.id, id));
    
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found' });
    }
    
    await db.delete(userSegments).where(eq(userSegments.id, id));
    
    res.json({ message: 'Segment deleted successfully' });
  } catch (error) {
    console.error('Error deleting segment:', error);
    res.status(500).json({ message: 'Failed to delete segment', error: String(error) });
  }
};

// Get users for a segment
export const getUsersForSegment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [segment] = await db.select().from(userSegments).where(eq(userSegments.id, id));
    
    if (!segment) {
      return res.status(404).json({ message: 'Segment not found' });
    }
    
    const segmentUsers = await getUsersBySegment(segment);
    
    res.json(segmentUsers);
  } catch (error) {
    console.error('Error fetching users for segment:', error);
    res.status(500).json({ message: 'Failed to fetch users for segment', error: String(error) });
  }
};

// Helper function to get users that match segment criteria
const getUsersBySegment = async (segment: any) => {
  let query = db.select().from(users);
  
  // Apply filters
  if (segment.filters) {
    const filters = segment.filters;
    
    // Min investment filter
    if (filters.minInvestment) {
      query = query.where(gte(users.totalInvestment, filters.minInvestment));
    }
    
    // Last activity days filter
    if (filters.lastActivityDays) {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - filters.lastActivityDays);
      query = query.where(gte(users.lastLoginAt, dateThreshold));
    }
    
    // KYC status filter
    if (filters.kycStatus && filters.kycStatus.length > 0) {
      query = query.where(inArray(users.kycStatus, filters.kycStatus));
    }
    
    // Investor type filter
    if (filters.investorType && filters.investorType.length > 0) {
      query = query.where(inArray(users.investorType, filters.investorType));
    }
    
    // Registration date range filter
    if (filters.registrationDateFrom) {
      const fromDate = new Date(filters.registrationDateFrom);
      query = query.where(gte(users.createdAt, fromDate));
    }
    
    if (filters.registrationDateTo) {
      const toDate = new Date(filters.registrationDateTo);
      query = query.where(lte(users.createdAt, toDate));
    }
  }
  
  return await query;
};

// Helper function to count users in a segment
const getUserCountForSegment = async (segmentId: string) => {
  const [segment] = await db.select().from(userSegments).where(eq(userSegments.id, segmentId));
  
  if (!segment) {
    return 0;
  }
  
  const users = await getUsersBySegment(segment);
  return users.length;
};

/**
 * Communications Controller
 */

// Get all communications with optional filters
export const getAllCommunications = async (req: Request, res: Response) => {
  try {
    const { status, channel, query } = req.query;
    
    let queryBuilder = db.select().from(communications);
    
    if (status) {
      queryBuilder = queryBuilder.where(eq(communications.status, status as string));
    }
    
    if (channel) {
      queryBuilder = queryBuilder.where(eq(communications.channel, channel as string));
    }
    
    if (query) {
      queryBuilder = queryBuilder.where(
        sql`${communications.title} ILIKE ${`%${query}%`} OR ${communications.content} ILIKE ${`%${query}%`}`
      );
    }
    
    const results = await queryBuilder.orderBy(desc(communications.createdAt));
    
    res.json(results);
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({ message: 'Failed to fetch communications', error: String(error) });
  }
};

// Get communication by ID
export const getCommunicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [communication] = await db.select().from(communications).where(eq(communications.id, id));
    
    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }
    
    res.json(communication);
  } catch (error) {
    console.error('Error fetching communication:', error);
    res.status(500).json({ message: 'Failed to fetch communication', error: String(error) });
  }
};

// Create a new communication
export const createCommunication = async (req: Request, res: Response) => {
  try {
    const { title, content, channel, segmentId, scheduledAt } = req.body;
    
    if (!title || !content || !channel) {
      return res.status(400).json({ 
        message: 'Title, content, and channel are required' 
      });
    }
    
    // Default status is draft, unless scheduledAt is provided, then it's scheduled
    const status = scheduledAt ? 'scheduled' : 'draft';
    
    const [newCommunication] = await db.insert(communications)
      .values({
        title,
        content,
        channel,
        segmentId: segmentId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status,
      })
      .returning();
    
    // If scheduledAt is provided, schedule the communication
    if (scheduledAt) {
      // In a real implementation, you would use a job scheduler here
      const scheduledTime = new Date(scheduledAt).getTime();
      const now = new Date().getTime();
      const delay = scheduledTime - now;
      
      if (delay > 0) {
        setTimeout(() => {
          sendCommunication(newCommunication.id)
            .catch(err => console.error(`Failed to send scheduled communication ${newCommunication.id}:`, err));
        }, delay);
      } else {
        // If the scheduled time is in the past, send immediately
        await sendCommunication(newCommunication.id);
      }
    }
    
    res.status(201).json(newCommunication);
  } catch (error) {
    console.error('Error creating communication:', error);
    res.status(500).json({ message: 'Failed to create communication', error: String(error) });
  }
};

// Update a communication
export const updateCommunication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, channel, segmentId, scheduledAt, status } = req.body;
    
    const [communication] = await db.select().from(communications).where(eq(communications.id, id));
    
    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }
    
    if (communication.status === 'sent') {
      return res.status(400).json({ message: 'Cannot update a sent communication' });
    }
    
    let newStatus = status;
    
    // If scheduledAt is updated, update the status to scheduled
    if (scheduledAt && !status) {
      newStatus = 'scheduled';
    }
    
    const [updatedCommunication] = await db.update(communications)
      .set({
        title: title || communication.title,
        content: content || communication.content,
        channel: channel || communication.channel,
        segmentId: segmentId !== undefined ? segmentId : communication.segmentId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : communication.scheduledAt,
        status: newStatus || communication.status,
        updatedAt: new Date(),
      })
      .where(eq(communications.id, id))
      .returning();
    
    res.json(updatedCommunication);
  } catch (error) {
    console.error('Error updating communication:', error);
    res.status(500).json({ message: 'Failed to update communication', error: String(error) });
  }
};

// Delete a communication
export const deleteCommunication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [communication] = await db.select().from(communications).where(eq(communications.id, id));
    
    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }
    
    if (communication.status === 'sent') {
      return res.status(400).json({ message: 'Cannot delete a sent communication' });
    }
    
    await db.delete(communications).where(eq(communications.id, id));
    
    res.json({ message: 'Communication deleted successfully' });
  } catch (error) {
    console.error('Error deleting communication:', error);
    res.status(500).json({ message: 'Failed to delete communication', error: String(error) });
  }
};

// Send a communication
export const sendCommunicationHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await sendCommunication(id);
    
    res.json({ message: 'Communication sent successfully' });
  } catch (error) {
    console.error('Error sending communication:', error);
    res.status(500).json({ message: 'Failed to send communication', error: String(error) });
  }
};

// Helper function to send a communication
export const sendCommunication = async (communicationId: string) => {
  const [communication] = await db.select().from(communications).where(eq(communications.id, communicationId));
  
  if (!communication) {
    throw new Error('Communication not found');
  }
  
  // Get users to send to based on segment
  let usersToSend: any[] = [];
  
  if (communication.segmentId) {
    const [segment] = await db.select().from(userSegments).where(eq(userSegments.id, communication.segmentId));
    
    if (segment) {
      usersToSend = await getUsersBySegment(segment);
    }
  } else {
    // If no segment is specified, send to all users
    usersToSend = await db.select().from(users);
  }
  
  // Update communication status to sending
  await db.update(communications)
    .set({ status: 'sent', updatedAt: new Date() })
    .where(eq(communications.id, communicationId));
  
  // Send to each user based on the channel
  const sendPromises = usersToSend.map(async (user) => {
    try {
      let success = false;
      
      switch (communication.channel) {
        case 'email':
          if (user.email) {
            success = await sendEmail(user.email, communication.title, communication.content);
          }
          break;
        case 'push':
          if (user.fcmToken) {
            success = await sendPushNotification(user.fcmToken, communication.title, communication.content);
          }
          break;
        case 'sms':
          if (user.phone) {
            success = await sendSms(user.phone, communication.content);
          }
          break;
      }
      
      // Log the communication
      await db.insert(userCommunicationLogs)
        .values({
          userId: user.id,
          communicationId,
          status: success ? 'sent' : 'failed',
          sentAt: success ? new Date() : null,
        });
      
      return success;
    } catch (error) {
      console.error(`Failed to send communication to user ${user.id}:`, error);
      
      // Log the failure
      await db.insert(userCommunicationLogs)
        .values({
          userId: user.id,
          communicationId,
          status: 'failed',
          sentAt: null,
        });
      
      return false;
    }
  });
  
  await Promise.all(sendPromises);
  
  return true;
};

// Get logs for a communication
export const getCommunicationLogs = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [communication] = await db.select().from(communications).where(eq(communications.id, id));
    
    if (!communication) {
      return res.status(404).json({ message: 'Communication not found' });
    }
    
    const logs = await db.select()
      .from(userCommunicationLogs)
      .where(eq(userCommunicationLogs.communicationId, id))
      .orderBy(desc(userCommunicationLogs.sentAt));
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching communication logs:', error);
    res.status(500).json({ message: 'Failed to fetch communication logs', error: String(error) });
  }
};