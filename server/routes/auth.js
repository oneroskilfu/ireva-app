const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { 
  register, 
  login, 
  getCurrentUser 
} = require('../controllers/authController');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', register);

/**
 * @route POST /api/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post('/login', login);

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', verifyToken, getCurrentUser);

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