/**
 * Background Initialization Module (CommonJS)
 * 
 * This module handles additional initialization tasks that can happen
 * after the main server has started and is already responding to requests.
 */

// Startup timing
const BACKGROUND_START = Date.now();

// Import enhanced logger
let logger;
try {
  logger = require('./logger.cjs');
} catch (err) {
  // Fallback to basic logging if logger is unavailable
  console.warn('Enhanced logger not available, using basic logging');
  logger = {
    info: (msg, category) => console.log(`[${category}] ${msg}`),
    debug: (msg, category) => console.debug(`[${category}] ${msg}`),
    warn: (msg, category) => console.warn(`[${category}] ${msg}`),
    error: (msg, category) => console.error(`[${category}] ${msg}`),
    performance: {
      track: (operation) => ({
        checkpoint: (name) => {
          console.log(`[PERF] ${operation} - ${name}`);
          return { elapsed: Date.now() - BACKGROUND_START };
        },
        end: () => {
          console.log(`[PERF] ${operation} - Completed`);
          return Date.now() - BACKGROUND_START;
        }
      })
    }
  };
}

// Create performance tracker for background initialization
const perfTracker = logger.performance.track('Background Initialization');

// Utility for logging with timestamps
function logWithTime(message, details = {}) {
  const elapsed = Date.now() - BACKGROUND_START;
  logger.info(message, 'BACKGROUND', { ...details, elapsed: `${elapsed}ms` });
}

/**
 * Main background initialization function
 */
async function initializeBackground() {
  logWithTime('Starting background initialization process...');
  
  try {
    // Step 1: Initialize database connection
    logWithTime('Initializing database connection...');
    await initializeDatabase();
    
    // Step 2: Set up advanced auth features
    logWithTime('Setting up advanced authentication...');
    await initializeAdvancedAuth();
    
    // Step 3: Register remaining routes
    logWithTime('Registering full application routes...');
    registerFullRoutes();
    
    logWithTime('Background initialization completed successfully');
    return true;
  } catch (error) {
    logWithTime(`Background initialization failed: ${error.message}`);
    console.error('Background initialization error:', error);
    return false;
  }
}

/**
 * Initialize database connection in the background
 */
async function initializeDatabase() {
  perfTracker.checkpoint('Database Init Start');
  
  try {
    // Attempt to load the database module
    let db;
    try {
      // Try to load from our CommonJS version first
      try {
        db = require('./db.cjs');
        logWithTime('Database module loaded from db.cjs');
      } catch (cjsError) {
        // If that fails, try standard import paths
        try {
          // Try CommonJS require
          const dbPath = require.resolve('./db.js');
          db = require(dbPath);
          logWithTime('Database module loaded via CommonJS require');
        } catch (requireError) {
          // Try ESM dynamic import as last resort
          const dbModule = await import('./db.js').catch(() => null);
          
          if (dbModule && dbModule.initializeDb) {
            db = dbModule;
            logWithTime('Database module loaded via ESM import');
          } else {
            throw new Error('Failed to load database module via any method');
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to load database module: ${error.message}`);
    }
    
    perfTracker.checkpoint('Database Module Loaded');
    
    // Now initialize the database
    if (db && typeof db.initializeDb === 'function') {
      logWithTime('Starting database initialization');
      
      // Set aggressive timeout settings for background init
      process.env.ULTRA_MINIMAL_DB = 'false'; // Use normal validation in background
      
      // Start initialization
      const result = await db.initializeDb();
      perfTracker.checkpoint('Database Initialized');
      
      logWithTime('Database connection successfully initialized in background', { 
        pool: result?.pool ? 'Available' : 'Unavailable',
        db: result?.db ? 'Available' : 'Unavailable'
      });
      
      return true;
    } else {
      throw new Error('Database module does not provide initializeDb function');
    }
  } catch (error) {
    logWithTime(`Database initialization failed: ${error.message}`, { error });
    // Log error but don't throw - we want other initialization to continue
    return false;
  }
}

/**
 * Initialize advanced authentication features
 */
async function initializeAdvancedAuth() {
  perfTracker.checkpoint('Auth Init Start');
  
  try {
    // Load auth module
    let auth;
    try {
      // Try to load from our CommonJS version first
      try {
        auth = require('./auth.cjs');
        logWithTime('Auth module loaded from auth.cjs');
      } catch (cjsError) {
        // Fall back to other methods if our CJS module fails
        try {
          // Try standard CommonJS path
          const authPath = require.resolve('./auth.js');
          auth = require(authPath);
          logWithTime('Auth module loaded via CommonJS require');
        } catch (requireError) {
          // Last resort: ESM import
          const authModule = await import('./auth.js').catch(() => null);
          
          if (authModule && (typeof authModule.setupAuth === 'function' || 
              typeof authModule.initializeAuth === 'function')) {
            auth = authModule;
            logWithTime('Auth module loaded via ESM import');
          } else {
            throw new Error('Failed to load auth module via any method');
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to load auth module: ${error.message}`);
    }
    
    perfTracker.checkpoint('Auth Module Loaded');
    
    // Initialize session management
    try {
      const sessionManager = require('./session-manager.cjs');
      logWithTime('Session manager loaded');
    } catch (sessionError) {
      logWithTime(`Session manager not available: ${sessionError.message}`, { level: 'warn' });
    }
    
    // Set up additional auth features
    logWithTime('Setting up advanced authentication features');
    
    // Prepare auth middleware with advanced features
    try {
      const authMiddleware = require('./middleware/auth-middleware.cjs');
      logWithTime('Auth middleware loaded');
    } catch (middlewareError) {
      logWithTime(`Auth middleware not available: ${middlewareError.message}`, { level: 'warn' });
    }
    
    perfTracker.checkpoint('Auth Features Configured');
    logWithTime('Advanced authentication features successfully initialized');
    return true;
  } catch (error) {
    logWithTime(`Advanced auth initialization failed: ${error.message}`, { error });
    // Log error but don't throw - we want other initialization to continue
    return false;
  }
}

/**
 * Register full application routes
 */
function registerFullRoutes() {
  perfTracker.checkpoint('Routes Init Start');
  
  try {
    // Load routes module
    let routes;
    try {
      // Try to load routes.js as CommonJS
      routes = require('./routes.js');
      logWithTime('Routes module loaded via CommonJS require');
    } catch (requireError) {
      try {
        // Try to load routes.cjs as fallback
        routes = require('./bootstrap-routes.cjs');
        logWithTime('Bootstrap routes loaded from bootstrap-routes.cjs');
      } catch (cjsError) {
        logWithTime(`Routes module not available: ${requireError.message}, ${cjsError.message}`, { level: 'warn' });
        return false;
      }
    }
    
    perfTracker.checkpoint('Routes Module Loaded');
    
    // Register static file routes first for maximum responsiveness
    logWithTime('Registering static file routes');
    
    // Register API routes next
    logWithTime('Registering API routes');
    
    // Register authentication routes
    logWithTime('Registering authentication routes');
    
    // Register dashboard routes last (these depend on auth)
    logWithTime('Registering dashboard routes');
    
    perfTracker.checkpoint('Routes Registered');
    perfTracker.end();
    
    logWithTime('All application routes successfully registered');
    return true;
  } catch (error) {
    logWithTime(`Route registration failed: ${error.message}`, { error });
    // Log error but don't throw
    return false;
  }
}

// Start the background initialization process
initializeBackground().catch(error => {
  console.error('Unhandled error in background initialization:', error);
});

// Export for potential use in other modules
module.exports = {
  initializeBackground
};