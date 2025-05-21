/**
 * Application Bootstrap Module (CommonJS)
 * 
 * This module initializes the full application server in a staged approach:
 * 1. Sets up minimal Express server for API endpoints
 * 2. Configures middleware and routes
 * 3. Initializes background processes
 */

// Record startup time for performance tracking
const START_TIME = Date.now();

// Utility function for logging with elapsed time
function logWithTime(message) {
  const elapsed = Date.now() - START_TIME;
  console.log(`[${elapsed}ms] ${message}`);
}

logWithTime('Starting bootstrap process...');

// Load required modules
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create Express application
const app = express();
logWithTime('Express application created');

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
logWithTime('Basic middleware configured');

// Configure static file serving
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
logWithTime('Static file serving configured');

// Load storage module
let storage;
try {
  const { DatabaseStorage } = require('./storage.cjs');
  storage = new DatabaseStorage();
  logWithTime('Database storage initialized');
} catch (storageError) {
  // Fall back to memory storage if database not available
  logWithTime(`Database storage failed, using in-memory storage: ${storageError.message}`);
  
  // Create minimal in-memory storage
  const MemStorage = {
    users: {
      admin: {
        id: 1,
        username: 'admin',
        password: 'adminpassword', // This would be hashed in a real application
        role: 'admin',
        name: 'Admin User',
        email: 'admin@ireva.com'
      },
      testuser: {
        id: 2,
        username: 'testuser',
        password: 'password', // This would be hashed in a real application
        role: 'investor',
        name: 'Test Investor',
        email: 'investor@ireva.com'
      }
    },
    
    async getUser(id) {
      return Object.values(this.users).find(user => user.id === id);
    },
    
    async getUserByUsername(username) {
      return this.users[username];
    },
    
    async createUser(userData) {
      const id = Object.keys(this.users).length + 1;
      const newUser = { ...userData, id };
      this.users[userData.username] = newUser;
      return newUser;
    }
  };
  
  storage = MemStorage;
}

// Set up authentication
try {
  const { setupAuth } = require('./auth.cjs');
  setupAuth(app, storage);
  logWithTime('Authentication setup complete');
} catch (authError) {
  logWithTime(`Authentication setup failed: ${authError.message}`);
  
  // Set up minimal authentication if full auth fails
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Get user from storage
    const user = storage.users[username];
    
    if (user && user.password === password) {
      // Strip password from response
      const { password, ...userData } = user;
      res.json(userData);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
  
  app.get('/api/user', (req, res) => {
    // This is a stub - in a real app we would check session
    res.status(401).json({ error: 'Not authenticated' });
  });
  
  logWithTime('Minimal authentication configured');
}

// Set up API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

logWithTime('API routes configured');

// Set up catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'direct-login.html'));
});

logWithTime('Catch-all route configured');

// Start server on port 5001 (main app logic port)
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, '0.0.0.0', () => {
  const bootTime = Date.now() - START_TIME;
  logWithTime(`Full application server running on port ${PORT} (boot: ${bootTime}ms)`);
});

// Start background processes
setTimeout(() => {
  try {
    const { initializeBackground } = require('./background-init.cjs');
    initializeBackground().catch(err => {
      console.error('Background initialization error:', err);
    });
    logWithTime('Background initialization started');
  } catch (err) {
    console.error('Failed to start background processes:', err);
  }
}, 100);

// Graceful shutdown
process.on('SIGTERM', () => {
  logWithTime('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logWithTime('HTTP server closed');
    process.exit(0);
  });
});

// Export app for potential testing
module.exports = app;