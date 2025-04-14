import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { auth, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Admin only
router.get('/', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Admin or own user
router.get('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin or requesting own info
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).send('Access denied');
    }

    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    
    // Check if ID is not valid
    if (err.kind === 'ObjectId') {
      return res.status(404).send('User not found');
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Admin or own user
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin or updating own info
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).send('Access denied');
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    // Update fields
    const { username, role, password } = req.body;
    
    if (username) user.username = username;
    
    // Only admin can change role
    if (role && req.user.role === 'admin') {
      user.role = role;
    }
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).send('User not found');
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    await user.deleteOne();
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).send('User not found');
    }
    
    res.status(500).send('Server Error');
  }
});

export default router;