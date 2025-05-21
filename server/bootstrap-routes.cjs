/**
 * Bootstrap Routes Module (CommonJS)
 * 
 * This module provides the minimal essential routes needed for
 * the application to function during the bootstrap phase.
 */

// Utility for logging
function logWithTime(message) {
  console.log(`[ROUTES] ${message}`);
}

/**
 * Register only the essential routes needed for minimal functionality
 * @param {Object} app - Express application
 */
function registerBootstrapRoutes(app) {
  logWithTime('Registering essential bootstrap routes');
  
  // Create an Express router instance
  const express = require('express');
  const router = express.Router();
  
  // Configure body parser middleware
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));
  
  // --- API Routes ---
  
  // Health check endpoint
  router.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'iREVA Platform is running',
      mode: 'bootstrap',
      timestamp: new Date().toISOString()
    });
  });
  
  // Simple login endpoint
  router.post('/api/login', (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Simple authentication logic for bootstrap phase
      if (username === 'admin' && password === 'adminpassword') {
        // Create user session
        req.session.user = {
          id: 1,
          username: 'admin',
          role: 'admin',
          name: 'Admin User',
          email: 'admin@ireva.com'
        };
        
        return res.status(200).json(req.session.user);
      } else if (username === 'testuser' && password === 'password') {
        // Create user session
        req.session.user = {
          id: 2,
          username: 'testuser',
          role: 'investor',
          name: 'Test Investor',
          email: 'investor@ireva.com'
        };
        
        return res.status(200).json(req.session.user);
      }
      
      // Invalid credentials
      res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Logout endpoint
  router.post('/api/logout', (req, res) => {
    // Clear the user session
    if (req.session) {
      req.session.destroy(() => {
        res.status(200).json({ message: 'Logged out successfully' });
      });
    } else {
      res.status(200).json({ message: 'Already logged out' });
    }
  });
  
  // Get current user information
  router.get('/api/user', (req, res) => {
    // Check if user is authenticated
    if (req.session && req.session.user) {
      return res.status(200).json(req.session.user);
    }
    
    // Not authenticated
    res.status(401).json({ error: 'Not authenticated' });
  });
  
  // --- Apply the router to the Express app ---
  app.use('/', router);
  
  logWithTime('Bootstrap routes registered successfully');
}

module.exports = {
  registerBootstrapRoutes
};