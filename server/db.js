/**
 * Database Module (TypeScript Compatible)
 * 
 * This module provides database connectivity and operations
 * with optimized performance for the iREVA platform.
 */

// Startup timing measurement
const DB_INIT_START_TIME = Date.now();

// Import enhanced logger if available
let logger;
try {
  logger = require('./logger.cjs');
} catch (err) {
  // Fallback to basic logging if logger not available
  logger = {
    db: {
      info: (msg, details) => {
        const elapsed = Date.now() - DB_INIT_START_TIME;
        console.log(`[DB ${elapsed}ms] ${msg}`, details || '');
      },
      debug: (msg, details) => {
        const elapsed = Date.now() - DB_INIT_START_TIME;
        console.debug(`[DB ${elapsed}ms] ${msg}`, details || '');
      },
      warn: (msg, details) => {
        const elapsed = Date.now() - DB_INIT_START_TIME;
        console.warn(`[DB ${elapsed}ms] ${msg}`, details || '');
      },
      error: (msg, details) => {
        const elapsed = Date.now() - DB_INIT_START_TIME;
        console.error(`[DB ${elapsed}ms] ${msg}`, details || '');
      }
    },
    performance: {
      track: (operation) => ({
        checkpoint: (name) => {
          const elapsed = Date.now() - DB_INIT_START_TIME;
          console.log(`[DB-PERF ${elapsed}ms] ${operation} - ${name}`);
          return { elapsed };
        },
        end: () => {
          const elapsed = Date.now() - DB_INIT_START_TIME;
          console.log(`[DB-PERF ${elapsed}ms] ${operation} - Completed`);
          return elapsed;
        }
      })
    }
  };
}

// Create performance tracker for DB initialization
const perfTracker = logger.performance.track('DB Initialization');

// Create module variables
let dbInitialized = false;
let dbInitializing = false;
let dbInitPromise = null;
let pool = null;
let db = null;
let neonConfig = null;

/**
 * Import database modules dynamically
 * @returns {Promise<Object>} - Database modules
 */
async function importDatabaseModules() {
  logger.db.info('Loading database modules');
  perfTracker.checkpoint('Module Import Start');
  
  try {
    // Dynamic import with destructuring assignment
    const neonServerless = await import('@neondatabase/serverless');
    const drizzleOrmModule = await import('drizzle-orm/neon-serverless');
    const wsModule = await import('ws');
    
    // Extract needed components
    const { Pool, neonConfig: neonCfg } = neonServerless;
    const { drizzle } = drizzleOrmModule;
    
    // Store neonConfig for later use
    neonConfig = neonCfg;
    
    // Configure neon
    neonConfig.webSocketConstructor = wsModule.default;
    neonConfig.connectionTimeoutMillis = 400;
    neonConfig.pipeliningEnabled = false;
    
    perfTracker.checkpoint('Module Import Complete');
    return { Pool, drizzle };
  } catch (error) {
    logger.db.error('Failed to import database modules', { error });
    throw error;
  }
}

/**
 * Initialize the database with optimized performance
 * @param {Object} options - Database options
 * @returns {Promise<Object>} - Database connection
 */
async function initializeDb(options = {}) {
  // If already initialized, return immediately
  if (dbInitialized) {
    logger.db.debug('Database already initialized, returning existing connection');
    return { pool, db };
  }
  
  // If initialization is in progress, wait for it to complete
  if (dbInitializing && dbInitPromise) {
    logger.db.debug('Database initialization in progress, waiting for completion');
    return dbInitPromise;
  }
  
  // Start initialization process
  dbInitializing = true;
  perfTracker.checkpoint('Initialization Start');
  logger.db.info('Starting database initialization');
  
  // Create initialization promise
  dbInitPromise = (async () => {
    try {
      // Check for database URL
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable not set');
      }
      
      // Option flags for initialization behavior
      const isUltraMinimal = process.env.ULTRA_MINIMAL_DB === 'true';
      
      // Phase 1: Import modules
      const { Pool: PoolClass, drizzle: drizzleInit } = await importDatabaseModules();
      
      // Phase 2: Create connection pool
      perfTracker.checkpoint('Pool Creation Start');
      
      pool = new PoolClass({
        connectionString: process.env.DATABASE_URL,
        max: 2, // Minimal number of connections for performance
        min: 0, // Create connections on demand
        idleTimeoutMillis: 5000, // Close idle connections quickly
        connectionTimeoutMillis: 300, // Fast connection timeout
        allowExitOnIdle: true,
        keepAlive: false,
        statement_timeout: 2000,
        query_timeout: 1500,
        application_name: 'ireva_platform'
      });
      
      perfTracker.checkpoint('Pool Creation Complete');
      
      // Phase 3: Initialize Drizzle ORM
      perfTracker.checkpoint('Drizzle Init Start');
      
      // Get schema from a dynamic import or provide a minimal schema
      let schema;
      try {
        schema = await import('@shared/schema');
      } catch (schemaError) {
        logger.db.warn('Failed to import schema, using minimal schema', { error: schemaError });
        // Minimal schema for testing
        schema = getMinimalSchema();
      }
      
      // Initialize Drizzle with schema
      db = drizzleInit({ client: pool, schema });
      
      perfTracker.checkpoint('Drizzle Init Complete');
      
      // Phase 4: Minimal validation (if not in ultra-minimal mode)
      if (!isUltraMinimal) {
        perfTracker.checkpoint('Validation Start');
        await validateConnection();
        perfTracker.checkpoint('Validation Complete');
      }
      
      // Initialization complete
      dbInitialized = true;
      dbInitializing = false;
      
      const elapsedTime = Date.now() - DB_INIT_START_TIME;
      logger.db.info(`Database initialization complete in ${elapsedTime}ms`);
      perfTracker.end({ connectionTime: elapsedTime });
      
      // Perform background warmup without blocking initialization
      if (!isUltraMinimal) {
        setTimeout(warmupConnection, 100);
      }
      
      return { pool, db };
    } catch (error) {
      logger.db.error('Database initialization failed', { error });
      dbInitializing = false;
      dbInitPromise = null;
      throw error;
    }
  })();
  
  return dbInitPromise;
}

/**
 * Validate database connection
 * @returns {Promise<boolean>} - Whether connection is valid
 */
async function validateConnection() {
  try {
    // Use raw pool query for minimal overhead
    const { rows } = await pool.query('SELECT 1 as connected');
    
    if (rows[0]?.connected === 1) {
      logger.db.info('Database connection validated successfully');
      return true;
    } else {
      throw new Error('Validation query returned unexpected result');
    }
  } catch (error) {
    logger.db.error('Database connection validation failed', { error });
    throw error;
  }
}

/**
 * Warm up the connection pool in the background
 * @returns {Promise<void>}
 */
async function warmupConnection() {
  try {
    logger.db.debug('Starting background connection warmup');
    
    // Execute simple query to warm up connection
    await pool.query('SELECT current_timestamp');
    
    // Try a simple table query if schema is available
    try {
      // Find a table to query
      const tables = Object.values(db);
      if (tables.length > 0) {
        await db.select().from(tables[0]).limit(1);
        logger.db.debug('Schema query warmup complete');
      }
    } catch (schemaError) {
      logger.db.debug('Schema warmup skipped', { error: schemaError });
    }
    
    logger.db.info('Background connection warmup complete');
  } catch (error) {
    logger.db.warn('Background warmup failed, but continuing operation', { error });
  }
}

/**
 * Create minimal schema for testing when main schema unavailable
 * @returns {Object} - Minimal schema
 */
function getMinimalSchema() {
  // Create a minimal schema object
  return {
    users: {
      name: 'users',
      columns: {
        id: { name: 'id' },
        username: { name: 'username' },
        password: { name: 'password' },
        email: { name: 'email' },
        role: { name: 'role' }
      }
    }
  };
}

// Create proxy objects for lazy initialization
const poolProxy = new Proxy({}, {
  get: function(target, prop) {
    if (!dbInitialized && prop !== 'then') {
      logger.db.debug(`Lazy initialization triggered by pool.${String(prop)}`);
      initializeDb();
    }
    return pool ? pool[prop] : null;
  }
});

const dbProxy = new Proxy({}, {
  get: function(target, prop) {
    if (!dbInitialized && prop !== 'then') {
      logger.db.debug(`Lazy initialization triggered by db.${String(prop)}`);
      initializeDb();
    }
    return db ? db[prop] : null;
  }
});

// Export functions and proxies for compatibility
module.exports = {
  initializeDb,
  pool: poolProxy,
  db: dbProxy
};

// Enable dual module usage
if (typeof exports !== 'undefined') {
  exports.initializeDb = initializeDb;
  exports.pool = poolProxy;
  exports.db = dbProxy;
}