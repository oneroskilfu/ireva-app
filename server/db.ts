import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Set up neon configuration for WebSocket support
neonConfig.webSocketConstructor = ws;

// Declare variables for lazy initialization
let dbInitialized = false;
let pool: Pool;
let db: any;

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
    // Optimize pooled connections for faster startup
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 10, // Reduced maximum clients for startup efficiency
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 1000, // Faster timeout for startup
      allowExitOnIdle: true // Allow clean shutdown
    });
    
    // Initialize Drizzle ORM with our schema
    db = drizzle({ client: pool, schema });
    
    // Test the connection with a simple query
    await pool.query('SELECT 1');
    
    dbInitialized = true;
    console.log('Database connection established successfully');
    
    return { pool, db };
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Define proxy objects for lazy database initialization
// These provide transparent access while deferring actual initialization
const poolProxy = new Proxy({} as Pool, {
  get: (target, prop) => {
    if (!dbInitialized) {
      console.warn(`Database not initialized yet. Initializing now to access '${String(prop)}'`);
      initializeDb();
    }
    return pool[prop as keyof Pool];
  }
});

const dbProxy = new Proxy({} as typeof db, {
  get: (target, prop) => {
    if (!dbInitialized) {
      console.warn(`Database not initialized yet. Initializing now to access '${String(prop)}'`);
      initializeDb();
    }
    return db[prop as keyof typeof db];
  }
});

// Export proxies that will initialize on first access if needed
export { poolProxy as pool, dbProxy as db };