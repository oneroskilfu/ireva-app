import express from 'express';
import { messageController } from '../controllers/messageController';

const router = express.Router();

// Ensure user is authenticated for all message routes
router.use((req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
});

// Send a new message
router.post('/', messageController.sendMessage);

// Get inbox messages
router.get('/inbox', messageController.getInbox);

// Get sent messages
router.get('/sent', messageController.getSent);

// Get unread messages count
router.get('/unread/count', messageController.getUnreadCount);

// Reply to a message
router.post('/:id/reply', messageController.replyToMessage);

// Get a specific message
router.get('/:id', messageController.getMessage);

// Mark a message as read
router.patch('/:id/read', messageController.markAsRead);

// Update message status
router.patch('/:id/status', messageController.updateStatus);

// Get conversation thread
router.get('/:id/conversation', messageController.getConversation);

export default router;