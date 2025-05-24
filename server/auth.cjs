/**
 * Authentication Module (CommonJS version)
 * 
 * Provides authentication services with optimized initialization
 * Compatible with both CommonJS and ES Modules
 */

// Import required modules
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const crypto = require('crypto');
const util = require('util');

// Promisify scrypt
const scryptAsync = util.promisify(crypto.scrypt);

// Create session store module dynamically (avoid direct imports)
let sessionStore;
try {
  // Try to use PostgreSQL session store with database
  const { pool } = require('./db.cjs');
  const connectPg = require('connect-pg-simple');
  const PostgresSessionStore = connectPg(session);
  
  sessionStore = new PostgresSessionStore({ 
    pool, 
    createTableIfMissing: true,
    pruneSessionInterval: 60 // Clean up every minute
  });
  
  console.log('[AUTH] Using PostgreSQL session store');
} catch (error) {
  // Fall back to memory store if database not available
  console.log('[AUTH] Failed to initialize PostgreSQL session store, using in-memory store');
  
  const createMemoryStore = require('memorystore');
  const MemoryStore = createMemoryStore(session);
  
  sessionStore = new MemoryStore({
    checkPeriod: 86400000 // Prune expired entries every 24h
  });
}

// Authentication utility functions
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return crypto.timingSafeEqual(hashedBuf, suppliedBuf);
}

// Track initialization state
let authInitialized = false;

// Setup authentication middleware and routes
function setupAuth(app, storage) {
  if (authInitialized) {
    console.log('[AUTH] Auth already initialized, skipping');
    return;
  }
  
  // Configure session
  const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
  
  const sessionSettings = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    name: 'ireva.sid',
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    }
  };

  // Set up middleware
  app.set('trust proxy', 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Find user by username
        const user = await storage.getUserByUsername(username);
        
        // Check if user exists
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        
        // Check password
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        
        // Success
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // User serialization for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // User deserialization from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      
      if (!user) {
        return done(null, false);
      }
      
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint
  app.post('/api/register', async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Username already exists' 
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Create user
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // Log user in
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  // Login endpoint
  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ 
          error: info?.message || 'Invalid username or password' 
        });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post('/api/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // User info endpoint
  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.json(req.user);
  });
  
  // Health check endpoint
  app.get('/api/auth/health', (req, res) => {
    res.json({
      status: 'ok',
      authenticated: req.isAuthenticated(),
      user: req.isAuthenticated() ? req.user.id : null,
    });
  });
  
  authInitialized = true;
  console.log('[AUTH] Authentication setup complete');
}

module.exports = {
  setupAuth,
  hashPassword,
  comparePasswords,
  sessionStore
};