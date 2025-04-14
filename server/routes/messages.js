import express from 'express';
import mongoose from 'mongoose';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { auth, admin } from '../middleware/auth.js';

const router = express.Router();

// Create a Notification schema to store user notifications
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'investment', 'property', 'system', 'announcement'],
    default: 'system'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel'
  },
  onModel: {
    type: String,
    enum: ['Message', 'Investment', 'Property', 'Project']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

// @route   GET /api/messages
// @desc    Get messages (admin gets all, user gets own)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let messages;
    
    // If admin, can get all messages or filter
    if (req.user.role === 'admin') {
      if (req.query.userId) {
        // Get messages for a specific user
        messages = await Message.find({
          $or: [
            { sender: req.query.userId },
            { receiver: req.query.userId }
          ]
        })
          .populate('sender', 'username')
          .populate('receiver', 'username')
          .sort({ createdAt: -1 });
      } else {
        // Get all messages
        messages = await Message.find()
          .populate('sender', 'username')
          .populate('receiver', 'username')
          .sort({ createdAt: -1 });
      }
    } else {
      // Regular user - get messages where user is sender or receiver
      messages = await Message.find({
        $or: [
          { sender: req.user._id },
          { receiver: req.user._id }
        ]
      })
        .populate('sender', 'username')
        .populate('receiver', 'username')
        .sort({ createdAt: -1 });
    }
    
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/messages/:id
// @desc    Get message by ID
// @access  Private (sender, receiver, or admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .populate('relatedProperty', 'name')
      .populate('relatedInvestment', 'amount status');
    
    if (!message) {
      return res.status(404).send('Message not found');
    }
    
    // Check if user is sender, receiver, or admin
    if (
      message.sender._id.toString() !== req.user._id.toString() &&
      message.receiver._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).send('Access denied');
    }
    
    // If user is the receiver, mark as read
    if (message.receiver._id.toString() === req.user._id.toString() && !message.isRead) {
      message.isRead = true;
      await message.save();
    }
    
    res.json(message);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).send('Message not found');
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      receiverId,
      subject,
      content,
      relatedPropertyId,
      relatedInvestmentId,
      attachments,
      sendNotification = true // Default to true - send notification
    } = req.body;
    
    // Validate input
    if (!receiverId || !content) {
      return res.status(400).send('Receiver and content are required');
    }
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    
    if (!receiver) {
      return res.status(404).send('Receiver not found');
    }
    
    // Create new message
    const newMessage = new Message({
      sender: req.user._id,
      receiver: receiverId,
      subject,
      content,
      relatedProperty: relatedPropertyId,
      relatedInvestment: relatedInvestmentId,
      attachments
    });
    
    const message = await newMessage.save();
    
    // Create notification for the receiver if requested
    if (sendNotification) {
      const notification = new Notification({
        user: receiverId,
        title: subject || 'New Message',
        message: content.length > 50 ? `${content.substring(0, 50)}...` : content,
        type: 'message',
        relatedId: message._id,
        onModel: 'Message'
      });
      
      await notification.save();
    }
    
    // Populate sender and receiver info
    await message.populate('sender', 'username');
    await message.populate('receiver', 'username');
    
    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private (receiver or admin)
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).send('Message not found');
    }
    
    // Check if user is receiver or admin
    if (message.receiver.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }
    
    message.isRead = true;
    await message.save();
    
    // Also mark associated notification as read
    await Notification.updateOne(
      {
        user: req.user._id,
        relatedId: message._id,
        onModel: 'Message'
      },
      { $set: { isRead: true } }
    );
    
    res.json(message);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).send('Message not found');
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private (sender, receiver, or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).send('Message not found');
    }
    
    // Check if user is sender, receiver, or admin
    if (
      message.sender.toString() !== req.user._id.toString() &&
      message.receiver.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).send('Access denied');
    }
    
    await message.deleteOne();
    
    // Also delete associated notification
    await Notification.deleteMany({
      relatedId: message._id,
      onModel: 'Message'
    });
    
    res.json({ message: 'Message removed successfully' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).send('Message not found');
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/messages/unread/count
// @desc    Get count of unread messages
// @access  Private
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false
    });
    
    res.json({ count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Get conversation with a user
// @access  Private
router.get('/conversation/:userId', auth, async (req, res) => {
  try {
    // Get messages between current user and specified user
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: 1 });
    
    // Mark all received messages as read
    const unreadMessages = messages.filter(
      msg => msg.receiver._id.toString() === req.user._id.toString() && !msg.isRead
    );
    
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg._id);
      
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { $set: { isRead: true } }
      );
      
      // Also mark associated notifications as read
      await Notification.updateMany(
        {
          user: req.user._id,
          relatedId: { $in: messageIds },
          onModel: 'Message'
        },
        { $set: { isRead: true } }
      );
    }
    
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// NOTIFICATION ROUTES

// @route   GET /api/messages/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    const { limit = 20, page = 1, unreadOnly = false } = req.query;
    
    // Build query
    const query = { user: req.user._id };
    
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedId', 'subject content amount name');
    
    // Get total count
    const total = await Notification.countDocuments(query);
    
    res.json({
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/messages/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).send('Notification not found');
    }
    
    // Check if user owns the notification
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).send('Access denied');
    }
    
    notification.isRead = true;
    await notification.save();
    
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).send('Notification not found');
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/messages/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/notifications/read-all', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    
    res.json({
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/messages/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/notifications/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).send('Notification not found');
    }
    
    // Check if user owns the notification
    if (notification.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).send('Access denied');
    }
    
    await notification.deleteOne();
    
    res.json({ message: 'Notification removed successfully' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).send('Notification not found');
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/messages/notifications/send
// @desc    Send a notification to users
// @access  Admin only
router.post('/notifications/send', auth, admin, async (req, res) => {
  try {
    const { 
      users, // array of user IDs or 'all'
      title,
      message,
      type = 'system',
      relatedId,
      onModel
    } = req.body;
    
    if (!title || !message) {
      return res.status(400).send('Title and message are required');
    }
    
    let userIds = [];
    
    // Get user IDs
    if (users === 'all') {
      // Send to all users
      const allUsers = await User.find().select('_id');
      userIds = allUsers.map(user => user._id);
    } else if (Array.isArray(users) && users.length > 0) {
      userIds = users;
    } else {
      return res.status(400).send('Invalid users parameter');
    }
    
    // Prepare notifications
    const notifications = userIds.map(userId => ({
      user: userId,
      title,
      message,
      type,
      relatedId,
      onModel
    }));
    
    // Insert all notifications at once
    const createdNotifications = await Notification.insertMany(notifications);
    
    res.status(201).json({
      message: `${createdNotifications.length} notifications sent successfully`,
      count: createdNotifications.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/messages/notifications/count
// @desc    Get count of unread notifications
// @access  Private
router.get('/notifications/count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });
    
    res.json({ count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;