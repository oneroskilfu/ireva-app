const express = require('express');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');
const { verifyAdmin, verifyRole } = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * @route GET /api/users
 * @desc Get all users (admin only)
 * @access Admin
 */
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private - only admin or the user themselves
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    // Allow access if admin or if user is requesting their own data
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/users/:id
 * @desc Update user profile
 * @access Private - only admin or the user themselves
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Allow access if admin or if user is updating their own data
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow role changes unless admin
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot change role without admin privileges' });
    }

    // Remove password field if present (password should be changed through a dedicated endpoint)
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Admin only
 */
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/users/profile/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/users/role/:id
 * @desc Change user role (admin only)
 * @access Admin only
 */
router.put('/role/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    
    // Validate role
    const validRoles = ['admin', 'investor', 'developer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;