// Essential imports only - delay loading others until needed
import * as schema from "@shared/schema";
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

// Function to log with timestamp for database performance tracking
function logDbTime(message: string) {
  const elapsed = Date.now() - DB_INIT_START_TIME;
  console.log(`[DB ${elapsed}ms] ${message}`);
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
  
  // Set up neon configuration for WebSocket support with aggressive timeouts
  neonConfig.webSocketConstructor = wsModule.default;
  neonConfig.connectionTimeoutMillis = 400; // Ultra-aggressive timeout
  neonConfig.pipeliningEnabled = false; // Disable pipelining for faster initial connection
  
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
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
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
        max: 2, // Absolute minimum for basic operation
        min: 0, // Create connections only when needed
        idleTimeoutMillis: 5000, // Super aggressive idle timeout
        connectionTimeoutMillis: 300, // Ultra-fast timeout
        allowExitOnIdle: true, // Enable clean shutdown
        keepAlive: false, // Disable for faster startup
        statement_timeout: 2000, // Tight query timeout
        query_timeout: 1500, // Even tighter overall timeout
        application_name: 'ireva_fast_init' // For monitoring
        // Note: We're not using skipValidation as it's not part of standard PoolConfig
        // Instead we handle validation separately for ultra-minimal mode
      });
      logDbTime(`Pool creation took ${Date.now() - startPoolCreation}ms`);
      
      // Phase 3: Initialize Drizzle ORM
      const startDrizzleInit = Date.now();
      db = drizzleInit({ client: pool, schema });
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

// Initialize empty database object with required methods
const emptyDb = {
  select: () => {
    console.warn('Database not initialized yet, initializing now...');
    initializeDb();
    return db.select();
  },
  insert: () => {
    console.warn('Database not initialized yet, initializing now...');
    initializeDb();
    return db.insert();
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