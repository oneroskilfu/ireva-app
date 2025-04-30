import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// Debug login route - ONLY FOR DEVELOPMENT
// This route should be disabled in production
router.post('/debug-login', async (req, res) => {
  try {
    const { role = 'admin' } = req.body;
    
    // For JWT-based auth also create a JWT token
    const jwt = require('jsonwebtoken');
    
    const user = {
      id: 'debug-user-id',
      email: 'debug@example.com',
      username: 'debug_admin',
      role: role,
      status: 'active'
    };
    
    // Create JWT token for APIs that use JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'debug-secret-key',
      { expiresIn: '24h' }
    );
    
    // Create a debug session with admin privileges for session-based auth
    req.session.user = user;
    
    // Log both authentication methods
    console.log('Debug login created - Session user:', user);
    console.log('Debug login created - JWT token generated');
    
    // Save the session
    req.session.save((err) => {
      if (err) {
        console.error('Error saving debug session:', err);
        return res.status(500).json({ error: 'Failed to create debug session' });
      }
      
      console.log('Debug session created with role:', role);
      return res.status(200).json({ 
        message: 'Debug login successful',
        user: req.session.user,
        token // Include the JWT token in the response
      });
    });
    
  } catch (error) {
    console.error('Error in debug login:', error);
    res.status(500).json({ error: 'Internal server error during debug login' });
  }
});

// Check current authenticated user (or debug session)
router.get('/current-user', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({
      user: req.session.user
    });
  }
  
  return res.status(401).json({ error: 'Not authenticated' });
});

// Debug logout
router.post('/debug-logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying debug session:', err);
      return res.status(500).json({ error: 'Failed to destroy debug session' });
    }
    
    res.status(200).json({ message: 'Debug logout successful' });
  });
});

export default router;