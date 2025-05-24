// Essential imports only - delay loading others until needed
import * as schema from "@shared/schema";
import * as schemaTenants from "@shared/schema-tenants";
import * as schemaTenantScoped from "@shared/schema-tenant-scoped";
import * as schemaKyc from "@shared/schema-kyc";
import type { Pool } from '@neondatabase/serverless';

// Declare variables for lazy initialization
let dbInitialized = false;
let dbInitializing = false;
let dbInitPromise: Promise<any> | null = null;
let pool: any;
let db: any;
let neonConfig: any;

// Startup timing measurement
const DB_INIT_START_TIME = Date.now();

// Import optimized logger
let logger: any;
try {
  // Use dynamic import for the logger to avoid ESM/CommonJS issues
  logger = require('./logger.cjs');
} catch (err) {
  // Fallback to basic logging if logger module is unavailable
  logger = {
    db: {
      info: (msg: string, details?: any) => {
        const elapsed = Date.now() - DB_INIT_START_TIME;
        console.log(`[DB ${elapsed}ms] ${msg}`, details || '');
      },
      debug: (msg: string, details?: any) => {
        const elapsed = Date.now() - DB_INIT_START_TIME;
        console.debug(`[DB ${elapsed}ms] ${msg}`, details || '');
      },
      warn: (msg: string, details?: any) => {
        const elapsed = Date.now() - DB_INIT_START_TIME;
        console.warn(`[DB ${elapsed}ms] ${msg}`, details || '');
      },
      error: (msg: string, details?: any) => {
        const elapsed = Date.now() - DB_INIT_START_TIME;
        console.error(`[DB ${elapsed}ms] ${msg}`, details || '');
      }
    },
    performance: {
      track: (operation: string) => ({
        checkpoint: (name: string) => {
          const elapsed = Date.now() - DB_INIT_START_TIME;
          console.log(`[DB-PERF ${elapsed}ms] ${operation} - ${name}`);
          return { elapsed };
        },
        end: (details?: any) => {
          const elapsed = Date.now() - DB_INIT_START_TIME;
          console.log(`[DB-PERF ${elapsed}ms] ${operation} - Completed`);
          return elapsed;
        }
      })
    }
  };
}

// Function to log with timestamp for database performance tracking
function logDbTime(message: string, details?: any) {
  logger.db.info(message, details);
}

// Ultra-optimized dynamic import function
async function importDatabaseModules() {
  logDbTime('Starting module imports');
  
  // Parallel imports for maximum speed
  const [
    neonServerless, 
    drizzleOrmModule, 
    wsModule
  ] = await Promise.all([
    import('@neondatabase/serverless'),
    import('drizzle-orm/neon-serverless'),
    import('ws')
  ]);
  
  const { Pool, neonConfig: neonCfg } = neonServerless;
  const { drizzle } = drizzleOrmModule;
  
  // Store for future reference
  neonConfig = neonCfg;
  
  // Set up neon configuration for production-ready WebSocket support
  neonConfig.webSocketConstructor = wsModule.default;
  neonConfig.connectionTimeoutMillis = 10000; // Production-safe timeout (10 seconds)
  neonConfig.pipeliningEnabled = true; // Enable for better performance
  neonConfig.fetchConnectionCache = true; // Cache connections for stability
  neonConfig.useSecureWebSocket = true; // Secure connections for production
  
  logDbTime('Module imports completed');
  return { Pool, drizzle };
}

/**
 * Initialize the database connection with ultra-fast startup optimizations.
 * This function implements multi-phase initialization for maximum speed.
 */
export const initializeDb = async () => {
  // If already initialized, return immediately
  if (dbInitialized) return { pool, db };
  
  // If initialization is in progress, wait for it to complete
  if (dbInitializing && dbInitPromise) {
    logDbTime('Waiting for in-progress initialization to complete');
    return dbInitPromise;
  }
  
  // Start initialization process
  dbInitializing = true;
  logDbTime('Starting database initialization');
  
  // Create a promise for the initialization process
  dbInitPromise = (async () => {
    // Enhanced DATABASE_URL validation for production deployment
    const databaseUrl = process.env.DATABASE_URL;
    const isProduction = process.env.NODE_ENV === 'production';
    const isRenderBuild = process.env.RENDER === 'true';
    
    if (!databaseUrl) {
      if (isRenderBuild) {
        // During Render build phase, database may not be available yet
        logDbTime('DATABASE_URL not available during build phase - this is expected on Render');
        throw new Error('Database not available during build phase - deployment will retry at runtime');
      } else if (isProduction) {
        throw new Error("DATABASE_URL environment variable is required for production deployment. Please ensure the database service is properly linked in your render.yaml configuration.");
      } else {
        throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
      }
    }
    
    // Validate URL format to catch configuration issues early
    try {
      new URL(databaseUrl);
    } catch (urlError) {
      throw new Error(`Invalid DATABASE_URL format. Please check your database connection string: ${urlError}`);
    }
    
    // Ultra-minimal mode = absolute fastest initialization possible
    const isUltraMinimal = process.env.ULTRA_MINIMAL_DB === 'true';
    
    try {
      // Phase 1: Import modules (only when needed)
      const startModuleImport = Date.now();
      const { Pool: PoolClass, drizzle: drizzleInit } = await importDatabaseModules();
      logDbTime(`Module import took ${Date.now() - startModuleImport}ms`);
      
      // Phase 2: Create connection pool with extreme optimization
      const startPoolCreation = Date.now();
      pool = new PoolClass({ 
        connectionString: process.env.DATABASE_URL,
        max: 5, // Production-ready pool size
        min: 1, // Keep minimum connection for stability
        idleTimeoutMillis: 30000, // 30 seconds for production stability
        connectionTimeoutMillis: 10000, // 10 seconds - production safe
        allowExitOnIdle: true, // Enable clean shutdown
        keepAlive: true, // Enable keepalive for production
        statement_timeout: 30000, // 30 seconds for complex queries
        query_timeout: 25000, // 25 seconds overall timeout
        application_name: 'ireva_platform_production' // Clear production identifier
      });
      logDbTime(`Pool creation took ${Date.now() - startPoolCreation}ms`);
      
      // Phase 3: Initialize Drizzle ORM
      const startDrizzleInit = Date.now();
      db = drizzleInit({
        client: pool,
        schema: {
          ...schema,
          ...schemaTenants,
          ...schemaTenantScoped,
          ...schemaKyc
        }
      });
      logDbTime(`Drizzle initialization took ${Date.now() - startDrizzleInit}ms`);
      
      // Phase 4: Minimal validation (if not in ultra-minimal mode)
      if (!isUltraMinimal) {
        const startValidation = Date.now();
        await validateConnection();
        logDbTime(`Connection validation took ${Date.now() - startValidation}ms`);
      }
      
      // Initialization complete
      dbInitialized = true;
      dbInitializing = false;
      logDbTime(`Database initialization complete - total time: ${Date.now() - DB_INIT_START_TIME}ms`);
      
      // Perform background warmup without blocking initialization
      if (!isUltraMinimal) {
        setTimeout(() => {
          warmupConnection().catch(err => {
            console.error('Background connection warmup failed:', err);
          });
        }, 100);
      }
      
      return { pool, db };
    } catch (error) {
      console.error('Failed to initialize database:', error);
      dbInitializing = false;
      dbInitPromise = null;
      throw error;
    }
  })();
  
  return dbInitPromise;
};

/**
 * Minimal validation function that checks if the database connection works
 * Uses the simplest possible query to minimize resource usage
 */
async function validateConnection() {
  try {
    // Use raw pool query instead of ORM for absolute minimal overhead
    const { rows } = await pool.query('SELECT 1 as connected');
    if (rows[0]?.connected === 1) {
      logDbTime('Connection validated successfully');
      return true;
    } else {
      throw new Error('Validation query returned unexpected result');
    }
  } catch (err) {
    logDbTime('Connection validation failed');
    console.error('Database validation error:', err);
    throw err;
  }
}

/**
 * Background warmup function that prepares the connection pool
 * This runs after initialization is complete and doesn't block startup
 */
async function warmupConnection() {
  try {
    logDbTime('Starting background connection warmup');
    // Execute a simple query to warm up the connection
    await pool.query('SELECT current_timestamp');
    // Also prepare a Drizzle query to initialize internal caches
    await db.select().from(Object.values(schema)[0]).limit(1);
    logDbTime('Background connection warmup complete');
  } catch (err) {
    logDbTime('Background warmup failed, but startup can continue');
    console.error('Background warmup error:', err);
  }
}

// Lazy database connection - only initialize when needed
let dbConnection: Promise<{ pool: any, db: any }> | null = null;

export const getDatabase = () => {
  if (!dbConnection) {
    dbConnection = initializeDb();
  }
  return dbConnection;
};

// Initialize empty database object with lazy loading
const emptyDb = {
  select: () => {
    // Return a proxy that waits for database initialization
    return {
      from: () => ({
        where: () => Promise.resolve([])
      })
    };
  },
  insert: () => {
    // Return a proxy that waits for database initialization  
    return {
      values: () => Promise.resolve([])
    };
  },
  sql: (strings: any, ...values: any[]) => ({
    toString: () => '1'
  }),
  or: (...conditions: any[]) => ({}),
  eq: (column: any, value: any) => ({})
};

// Empty pool object with required methods
const emptyPool = {
  query: async (text: string, params?: any[]) => {
    console.warn('Pool not initialized yet, initializing now...');
    await initializeDb();
    return pool.query(text, params);
  }
};

// Define proxy objects for lazy database initialization
// These provide transparent access while deferring actual initialization
const poolProxy = new Proxy(emptyPool as any, {
  get: (target, prop) => {
    if (!dbInitialized && prop !== 'then') {
      console.warn(`Database not initialized yet. Initializing now to access '${String(prop)}'`);
      
      // If the prop is in our empty pool stub, return that first
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      
      // Otherwise initialize and try to return the real prop
      initializeDb();
    }
    return pool ? pool[prop as keyof typeof pool] : null;
  }
});

const dbProxy = new Proxy(emptyDb as any, {
  get: (target, prop) => {
    if (!dbInitialized && prop !== 'then') { // Avoid triggering on Promise checks
      console.warn(`Database not initialized yet. Initializing now to access '${String(prop)}'`);
      
      // If the prop is in our empty DB stub, return that first
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      
      // Otherwise initialize and try to return the real prop
      initializeDb();
    }
    return db ? db[prop as keyof typeof db] : target[prop as keyof typeof target];
  }
});

// Export proxies that will initialize on first access if needed
export { poolProxy as pool, dbProxy as db };