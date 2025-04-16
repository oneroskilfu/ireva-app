const express = require('express');
const { db } = require('../db');
const { users } = require('../../shared/schema');
const { eq } = require('drizzle-orm');
const { comparePasswords, hashPassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phoneNumber } = req.body;
    
    // Check if username or email already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { or, eq }) => or(
        eq(users.username, username),
        eq(users.email, email)
      )
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user
    const [newUser] = await db.insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        role: 'user',
        createdAt: new Date(),
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      });
    
    // Generate JWT token
    const token = generateToken(newUser);
    
    res.status(201).json({
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await comparePasswords(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    // User is already attached to req by verifyToken middleware
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id)
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user (client-side only operation in JWT)
 * @access Public
 */
router.post('/logout', (req, res) => {
  // JWT logout happens on the client-side by removing the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;