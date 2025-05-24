import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { db } from '../db';
import { messages, users } from '@shared/schema';
import { eq, desc, and, or } from 'drizzle-orm';

const router = express.Router();

// Send a message
router.post('/send', authMiddleware, async (req: Request, res: Response) => {
  try {
    const senderId = req.user!.id;
    const { receiverId, content, subject } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify the receiver exists
    const receiver = await db.select().from(users).where(eq(users.id, receiverId)).limit(1);
    if (!receiver || receiver.length === 0) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create the message
    const newMessage = await db.insert(messages).values({
      senderId,
      receiverId,
      content,
      subject: subject || '',
    }).returning();

    res.status(201).json({ 
      status: 'Message sent',
      message: newMessage[0]
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get user's message threads (inbox)
router.get('/inbox', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Find all messages where the user is either sender or receiver
    const userMessages = await db.select().from(messages).where(
      or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      )
    ).orderBy(desc(messages.createdAt));

    // Extract unique user IDs from conversations
    const contactIds: number[] = [];
    userMessages.forEach(msg => {
      const contactId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!contactIds.includes(contactId)) {
        contactIds.push(contactId);
      }
    });

    // Get user details for each contact
    const threadSummaries = await Promise.all(contactIds.map(async (contactId) => {
      const contact = await db.select().from(users).where(eq(users.id, contactId)).limit(1);
      
      // Get latest message
      const latestMessage = userMessages.find(msg => 
        (msg.senderId === contactId && msg.receiverId === userId) || 
        (msg.senderId === userId && msg.receiverId === contactId)
      );

      // Count unread messages
      const unreadCount = userMessages.filter(msg => 
        msg.senderId === contactId && 
        msg.receiverId === userId && 
        msg.status === 'unread'
      ).length;

      return {
        userId: contactId,
        username: contact && contact[0] ? contact[0].username : 'Unknown User',
        fullName: contact && contact[0] ? `${contact[0].firstName || ''} ${contact[0].lastName || ''}`.trim() : '',
        profileImage: contact && contact[0] ? contact[0].profileImage : null,
        lastMessage: latestMessage?.content,
        lastMessageDate: latestMessage?.createdAt,
        unreadCount
      };
    }));

    // Sort threads by latest message date
    threadSummaries.sort((a, b) => {
      if (!a.lastMessageDate) return 1;
      if (!b.lastMessageDate) return -1;
      return new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime();
    });

    res.json(threadSummaries);
  } catch (error) {
    console.error('Error fetching inbox:', error);
    res.status(500).json({ message: 'Failed to fetch inbox' });
  }
});

// Get conversation thread with a specific user
router.get('/thread/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.id;
    const otherUserId = parseInt(req.params.userId);

    if (isNaN(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Get messages between the two users
    const thread = await db.select().from(messages).where(
      or(
        and(
          eq(messages.senderId, currentUserId),
          eq(messages.receiverId, otherUserId)
        ),
        and(
          eq(messages.senderId, otherUserId),
          eq(messages.receiverId, currentUserId)
        )
      )
    ).orderBy(messages.createdAt);

    // Mark unread messages as read
    const unreadMessages = thread.filter(
      msg => msg.senderId === otherUserId && 
             msg.receiverId === currentUserId && 
             msg.status === 'unread'
    );

    if (unreadMessages.length > 0) {
      await Promise.all(unreadMessages.map(msg => 
        db.update(messages)
          .set({ 
            status: 'read',
            readAt: new Date()
          })
          .where(eq(messages.id, msg.id))
      ));
    }

    // Get other user's details
    const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
    
    // Format the response
    const threadWithUserInfo = {
      messages: thread.map(msg => ({
        id: msg.id,
        content: msg.content,
        subject: msg.subject,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        createdAt: msg.createdAt,
        status: msg.status,
        readAt: msg.readAt,
        isFromMe: msg.senderId === currentUserId
      })),
      user: otherUser ? {
        id: otherUser.id,
        username: otherUser.username,
        fullName: `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim(),
        profileImage: otherUser.profileImage
      } : null
    };

    res.json(threadWithUserInfo);
  } catch (error) {
    console.error('Error fetching message thread:', error);
    res.status(500).json({ message: 'Failed to fetch message thread' });
  }
});

export default router;