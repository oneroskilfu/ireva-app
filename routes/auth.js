const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, username, password, phone, role = 'investor' } = req.body;

    // Check if user already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      phone,
      role,
      profileComplete: false,
      kycVerified: false
    });

    await newUser.save();

    // Create and sign JWT token
    const payload = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;

        // Return user data and token
        const userData = { ...newUser._doc };
        delete userData.password;

        res.status(201).json({
          token,
          user: userData
        });
      }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }]
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and sign JWT token
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;

        // Return user data and token
        const userData = { ...user._doc };
        delete userData.password;

        res.json({
          token,
          user: userData
        });
      }
    );
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/auth/verify
 * @desc Verify token & return user data
 * @access Private
 */
router.get('/verify', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/auth/social-login
 * @desc Login or register with social account
 * @access Public
 */
router.post('/social-login', async (req, res) => {
  try {
    const { provider, token, userData } = req.body;
    
    if (!provider || !token || !userData || !userData.email) {
      return res.status(400).json({ message: 'Missing required social login data' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
      // Create new user if they don't exist
      const username = userData.email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      user = new User({
        name: userData.name || username,
        email: userData.email,
        username,
        password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
        profileImage: userData.photoURL || '',
        role: 'investor',
        profileComplete: false,
        kycVerified: false,
        socialAuth: {
          provider,
          providerId: userData.email,
        }
      });
      
      await user.save();
    }
    
    // Create and sign JWT token
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, jwtToken) => {
        if (err) throw err;
        
        // Return user data and token
        const userData = { ...user._doc };
        delete userData.password;
        
        res.json({
          token: jwtToken,
          user: userData
        });
      }
    );
  } catch (error) {
    console.error('Error in social login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;