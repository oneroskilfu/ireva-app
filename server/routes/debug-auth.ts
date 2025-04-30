import express from 'express';
import { storage } from '../storage';

const router = express.Router();

// Debug login route - ONLY FOR DEVELOPMENT
// This route should be disabled in production
router.post('/debug-login', async (req, res) => {
  try {
    const { role = 'admin' } = req.body;
    
    // Create a debug session with admin privileges
    req.session.user = {
      id: 'debug-user-id',
      email: 'debug@example.com',
      username: 'debug_admin',
      role: role,
      status: 'active'
    };
    
    // Save the session
    req.session.save((err) => {
      if (err) {
        console.error('Error saving debug session:', err);
        return res.status(500).json({ error: 'Failed to create debug session' });
      }
      
      console.log('Debug session created with role:', role);
      return res.status(200).json({ 
        message: 'Debug login successful',
        user: req.session.user
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