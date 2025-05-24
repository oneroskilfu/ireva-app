/**
 * Database Module (CommonJS version)
 * 
 * Provides database connectivity and operations with optimized performance.
 * This module is compatible with both CommonJS and ES Modules.
 */

// Startup timing measurement
const DB_INIT_START_TIME = Date.now();

// Utility for logging
function logDbTime(message, details) {
  const elapsed = Date.now() - DB_INIT_START_TIME;
  console.log(`[DB ${elapsed}ms] ${message}`, details || '');
}

// Initial state
let dbInitialized = false;
let dbInitializing = false;
let dbInitPromise = null;
let pool = null;
let db = null;

/**
 * Initialize the database connection with optimized startup
 */
async function initializeDb(options = {}) {
  // If already initialized, return immediately
  if (dbInitialized) {
    return { pool, db };
  }
  
  // If initialization is in progress, wait for it to complete
  if (dbInitializing && dbInitPromise) {
    logDbTime('Waiting for in-progress initialization to complete');
    return dbInitPromise;
  }
  
  // Start initialization
  dbInitializing = true;
  logDbTime('Starting database initialization');
  
  // Create promise for initialization
  dbInitPromise = (async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable not set');
    }
    
    try {
      // Load required modules
      logDbTime('Loading database modules');
      
      // Dynamic import with destructuring not supported in CommonJS
      // Use separate imports
      const { Pool, neonConfig } = require('@neondatabase/serverless');
      const { drizzle } = require('drizzle-orm/neon-serverless');
      const ws = require('ws');
      
      // Configure neon
      neonConfig.webSocketConstructor = ws;
      neonConfig.pipeliningEnabled = false;
      
      logDbTime('Modules loaded successfully');
      
      // Create connection pool with optimized settings
      logDbTime('Creating connection pool');
      
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 2, // Minimal connections
        min: 0, // Create on demand
        idleTimeoutMillis: 5000, // Close idle connections quickly
        connectionTimeoutMillis: 300, // Fast connection timeout
        allowExitOnIdle: true,
        keepAlive: false,
        statement_timeout: 2000,
        query_timeout: 1500,
        application_name: 'ireva_fast_init'
      });
      
      logDbTime('Connection pool created');
      
      // Try to load schema from shared location
      let schema;
      try {
        // In CommonJS, we can't directly import from @shared
        // Use a relative path instead
        schema = require('../shared/schema');
        logDbTime('Schema loaded successfully');
      } catch (schemaError) {
        // Create minimal schema if import fails
        logDbTime('Failed to load schema, using minimal schema', { error: schemaError.message });
        
        // Minimal schema definition
        schema = {
          users: {
            name: 'users'
          }
        };
      }
      
      // Initialize Drizzle with schema
      db = drizzle({ client: pool, schema });
      logDbTime('Drizzle ORM initialized');
      
      // Validation (if not in ultra-minimal mode)
      if (process.env.ULTRA_MINIMAL_DB !== 'true') {
        logDbTime('Validating database connection');
        
        try {
          const { rows } = await pool.query('SELECT 1 as connected');
          if (rows[0]?.connected === 1) {
            logDbTime('Database connection validated successfully');
          } else {
            throw new Error('Validation query returned unexpected result');
          }
        } catch (error) {
          logDbTime('Connection validation failed');
          throw error;
        }
      }
      
      // Initialization complete
      dbInitialized = true;
      dbInitializing = false;
      
      logDbTime('Database initialization complete');
      
      // Background warmup (non-blocking)
      if (process.env.ULTRA_MINIMAL_DB !== 'true') {
        setTimeout(async () => {
          try {
            // Execute a simple query to warm up the connection
            await pool.query('SELECT current_timestamp');
            logDbTime('Background connection warmup complete');
          } catch (error) {
            logDbTime('Background warmup failed, but continuing operation');
          }
        }, 100);
      }
      
      return { pool, db };
    } catch (error) {
      logDbTime(`Database initialization failed: ${error.message}`);
      dbInitializing = false;
      dbInitPromise = null;
      throw error;
    }
  })();
  
  return dbInitPromise;
}

// Create empty stubs for lazy initialization
const emptyDb = {
  select: () => {
    console.warn('Database not initialized yet, initializing now...');
    initializeDb();
    return db ? db.select() : null;
  },
  insert: () => {
    console.warn('Database not initialized yet, initializing now...');
    initializeDb();
    return db ? db.insert() : null;
  }
};

const emptyPool = {
  query: async () => {
    console.warn('Pool not initialized yet, initializing now...');
    await initializeDb();
    return pool ? pool.query(...arguments) : null;
  }
};

// Create proxies for lazy initialization
const dbProxy = new Proxy(emptyDb, {
  get: (target, prop) => {
    if (!dbInitialized && prop !== 'then') {
      console.warn(`Database not initialized yet. Initializing now to access '${String(prop)}'`);
      initializeDb();
    }
    return db ? db[prop] : target[prop];
  }
});

const poolProxy = new Proxy(emptyPool, {
  get: (target, prop) => {
    if (!dbInitialized && prop !== 'then') {
      console.warn(`Pool not initialized yet. Initializing now to access '${String(prop)}'`);
      initializeDb();
    }
    return pool ? pool[prop] : target[prop];
  }
});

// Export for CommonJS
module.exports = {
  initializeDb,
  db: dbProxy,
  pool: poolProxy
};