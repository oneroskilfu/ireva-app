// Essential imports only - delay loading others until needed
import * as schema from "@shared/schema";
import type { Pool } from '@neondatabase/serverless';

// Declare variables for lazy initialization
let dbInitialized = false;
let pool: any;
let db: any;
let neonConfig: any;

// Dynamic import function that can be deferred
async function importDatabaseModules() {
  // Only import these modules when actually needed
  const { Pool, neonConfig: neonCfg } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');
  const ws = await import("ws");
  
  // Store for future reference
  neonConfig = neonCfg;
  
  // Set up neon configuration for WebSocket support
  neonConfig.webSocketConstructor = ws.default;
  
  return { Pool, drizzle };
}

/**
 * Initialize the database connection.
 * This function can be called after the server has started to delay DB connection.
 */
export const initializeDb = async () => {
  if (dbInitialized) return { pool, db };
  
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  console.log('Initializing database connection...');
  
  try {
    // Dynamically import database modules when needed
    const { Pool: PoolClass, drizzle: drizzleInit } = await importDatabaseModules();
    
    // Optimize pooled connections for faster startup
    pool = new PoolClass({ 
      connectionString: process.env.DATABASE_URL,
      max: 10, // Reduced maximum clients for startup efficiency
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 1000, // Faster timeout for startup
      allowExitOnIdle: true, // Allow clean shutdown
      keepAlive: false // Disable keepalive for faster startup
    });
    
    // Initialize Drizzle ORM with our schema
    db = drizzleInit({ client: pool, schema });
    
    // Use a lightweight connection test
    await pool.query('SELECT 1');
    
    dbInitialized = true;
    console.log('Database connection established successfully');
    
    return { pool, db };
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

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
  sql: {},
  or: () => {},
  eq: () => {}
};

// Define proxy objects for lazy database initialization
// These provide transparent access while deferring actual initialization
const poolProxy = new Proxy({} as any, {
  get: (target, prop) => {
    if (!dbInitialized) {
      console.warn(`Database not initialized yet. Initializing now to access '${String(prop)}'`);
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