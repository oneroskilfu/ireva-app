/**
 * Authentication Module (TypeScript Compatible)
 * 
 * This module provides authentication services for the iREVA platform.
 * It's written in JavaScript with JSDoc for TypeScript compatibility.
 */

const logger = require('./logger.cjs');
const sessionManager = require('./session-manager.cjs');
const { scrypt, randomBytes, timingSafeEqual } = require('crypto');
const { promisify } = require('util');

// Promisify scrypt for async usage
const scryptAsync = promisify(scrypt);

/**
 * @typedef {Object} User
 * @property {number} id - User ID
 * @property {string} username - Username
 * @property {string} password - Hashed password
 * @property {string} email - Email address
 * @property {string} role - User role (admin, investor, etc.)
 * @property {string|null} firstName - First name
 * @property {string|null} lastName - Last name
 * @property {string|null} phoneNumber - Phone number
 * @property {string|null} profileImage - Profile image URL
 */

/**
 * Hash a password using scrypt with salt
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password with salt
 */
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Compare a password with a hashed password
 * @param {string} supplied - The supplied password
 * @param {string} stored - The stored hashed password
 * @returns {Promise<boolean>} - Whether the passwords match
 */
async function comparePasswords(supplied, stored) {
  // Handle SHA-256 hashed passwords (for legacy compatibility)
  if (stored.length === 64 && /^[0-9a-f]+$/.test(stored)) {
    // Use SHA-256 comparison for legacy hashed passwords
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(supplied).digest('hex');
    return hash === stored;
  }
  
  // Regular scrypt comparison
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    logger.auth.error('Password comparison error', { error });
    return false;
  }
}

/**
 * Initialize the authentication system
 * @param {Object} app - Express application instance
 * @param {Object} options - Authentication options
 * @returns {Object} - Authentication components
 */
function initializeAuth(app, options = {}) {
  const performanceTracker = logger.performance.track('Auth Initialization');
  logger.auth.info('Initializing authentication system');
  
  // Set up session management if not already initialized
  if (!app.get('session')) {
    performanceTracker.checkpoint('Setting up session management');
    if (sessionManager && sessionManager.initializeSession) {
      sessionManager.initializeSession(app);
      logger.auth.info('Session management initialized');
    } else {
      logger.auth.warn('Session manager not available, using basic session config');
      // Fallback to basic session (implementation would go here)
    }
  }
  
  // Set up authentication routes
  performanceTracker.checkpoint('Setting up auth routes');
  setupAuthRoutes(app);
  
  // Set up authorization middleware
  performanceTracker.checkpoint('Setting up authorization middleware');
  setupAuthorizationMiddleware(app);
  
  performanceTracker.end();
  logger.auth.info('Authentication system initialized successfully');
  
  return {
    hashPassword,
    comparePasswords
  };
}

/**
 * Set up authentication routes
 * @param {Object} app - Express application instance
 */
function setupAuthRoutes(app) {
  // Login route
  app.post('/api/login', async (req, res) => {
    try {
      logger.auth.debug('Login attempt', { username: req.body.username });
      
      // Get storage interface - either from a storage module or as passed to init
      const storage = getStorageInterface();
      
      // Find user by username
      const user = await storage.getUserByUsername(req.body.username);
      
      if (!user) {
        logger.auth.debug('Login failed: user not found', { username: req.body.username });
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Verify password
      const passwordValid = await comparePasswords(req.body.password, user.password);
      
      if (!passwordValid) {
        logger.auth.debug('Login failed: invalid password', { username: req.body.username });
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Create session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };
      
      // Save session
      await new Promise((resolve) => {
        req.session.save(resolve);
      });
      
      logger.auth.info('User logged in successfully', { username: user.username, role: user.role });
      
      // Return user info (excluding password)
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      logger.auth.error('Login error', { error });
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Logout route
  app.post('/api/logout', (req, res) => {
    if (req.session && req.session.user) {
      const username = req.session.user.username;
      
      req.session.destroy((err) => {
        if (err) {
          logger.auth.error('Logout error', { error: err, username });
          return res.status(500).json({ error: 'Logout failed' });
        }
        
        logger.auth.info('User logged out', { username });
        res.status(200).json({ message: 'Logged out successfully' });
      });
    } else {
      logger.auth.debug('Logout attempted without active session');
      res.status(200).json({ message: 'Already logged out' });
    }
  });
  
  // User info route
  app.get('/api/user', (req, res) => {
    if (req.session && req.session.user) {
      res.status(200).json(req.session.user);
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
  
  // Register route
  app.post('/api/register', async (req, res) => {
    try {
      logger.auth.debug('Registration attempt', { username: req.body.username });
      
      // Get storage interface
      const storage = getStorageInterface();
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      
      if (existingUser) {
        logger.auth.debug('Registration failed: username exists', { username: req.body.username });
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Create user
      const newUser = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });
      
      // Create session
      req.session.user = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      };
      
      // Save session
      await new Promise((resolve) => {
        req.session.save(resolve);
      });
      
      logger.auth.info('User registered successfully', {
        username: newUser.username,
        role: newUser.role
      });
      
      // Return user info (excluding password)
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      logger.auth.error('Registration error', { error });
      res.status(500).json({ error: 'Server error' });
    }
  });
}

/**
 * Set up authorization middleware
 * @param {Object} app - Express application instance
 */
function setupAuthorizationMiddleware(app) {
  try {
    // Load authorization middleware
    const authMiddleware = require('./middleware/auth-middleware.cjs');
    
    if (authMiddleware && authMiddleware.authMiddleware) {
      // Apply the middleware
      app.use(authMiddleware.authMiddleware);
      logger.auth.info('Authorization middleware set up successfully');
    } else {
      logger.auth.warn('Authorization middleware not properly defined');
    }
  } catch (error) {
    logger.auth.error('Failed to set up authorization middleware', { error });
  }
}

/**
 * Get the storage interface for authentication operations
 * @returns {Object} - Storage interface
 */
function getStorageInterface() {
  try {
    // Try to get storage from module
    return require('./storage.js').storage;
  } catch (error) {
    // Fallback to in-memory storage
    logger.auth.warn('Failed to load storage module, using fallback in-memory storage', { error });
    return getInMemoryStorage();
  }
}

/**
 * Get a basic in-memory storage for testing
 * @returns {Object} - In-memory storage interface
 */
function getInMemoryStorage() {
  const users = new Map();
  let nextId = 1;
  
  // Add test users - only if environment variables are provided
  const adminPassword = process.env.TEST_ADMIN_PASSWORD_HASH;
  const testUserPassword = process.env.TEST_USER_PASSWORD_HASH;
  
  if (adminPassword) {
    users.set(1, {
      id: 1,
      username: 'admin',
      password: adminPassword,
      email: 'admin@ireva.com',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '08012345678'
    });
  }
  
  if (testUserPassword) {
    users.set(2, {
      id: 2,
      username: 'testuser',
      password: testUserPassword,
      email: 'test@example.com',
      role: 'investor',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '08012345678'
    });
  }
  
  nextId = 3;
  
  return {
    async getUser(id) {
      return users.get(id);
    },
    
    async getUserByUsername(username) {
      return Array.from(users.values()).find(user => user.username === username);
    },
    
    async createUser(userData) {
      const id = nextId++;
      const user = { id, ...userData };
      users.set(id, user);
      return user;
    }
  };
}

// Export for both ESM and CommonJS compatibility
module.exports = {
  initializeAuth,
  hashPassword,
  comparePasswords
};

// Enable dual module usage
if (typeof exports !== 'undefined') {
  exports.initializeAuth = initializeAuth;
  exports.hashPassword = hashPassword;
  exports.comparePasswords = comparePasswords;
}