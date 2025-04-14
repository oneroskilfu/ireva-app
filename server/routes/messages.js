const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

// Middleware to authenticate JWT token
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
  next();
};

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
          { sender: req.user.id },
          { receiver: req.user.id }
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
      return res.status(404).json({ msg: 'Message not found' });
    }
    
    // Check if user is sender, receiver, or admin
    if (
      message.sender._id.toString() !== req.user.id &&
      message.receiver._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // If user is the receiver, mark as read
    if (message.receiver._id.toString() === req.user.id && !message.isRead) {
      message.isRead = true;
      await message.save();
    }
    
    res.json(message);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Message not found' });
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
      attachments
    } = req.body;
    
    // Validate input
    if (!receiverId || !content) {
      return res.status(400).json({ msg: 'Receiver and content are required' });
    }
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    
    if (!receiver) {
      return res.status(404).json({ msg: 'Receiver not found' });
    }
    
    // Create new message
    const newMessage = new Message({
      sender: req.user.id,
      receiver: receiverId,
      subject,
      content,
      relatedProperty: relatedPropertyId,
      relatedInvestment: relatedInvestmentId,
      attachments
    });
    
    const message = await newMessage.save();
    
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
      return res.status(404).json({ msg: 'Message not found' });
    }
    
    // Check if user is receiver or admin
    if (message.receiver.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    message.isRead = true;
    await message.save();
    
    res.json(message);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Message not found' });
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
      return res.status(404).json({ msg: 'Message not found' });
    }
    
    // Check if user is sender, receiver, or admin
    if (
      message.sender.toString() !== req.user.id &&
      message.receiver.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    await message.remove();
    
    res.json({ msg: 'Message removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Message not found' });
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
      receiver: req.user.id,
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
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
      .populate('sender', 'username')
      .populate('receiver', 'username')
      .sort({ createdAt: 1 });
    
    // Mark all received messages as read
    const unreadMessages = messages.filter(
      msg => msg.receiver._id.toString() === req.user.id && !msg.isRead
    );
    
    if (unreadMessages.length > 0) {
      await Message.updateMany(
        {
          _id: { $in: unreadMessages.map(msg => msg._id) }
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

module.exports = router;