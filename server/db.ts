import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';

// Optimized database connection using lazy loading
// Track initialization time
const dbInitStartTime = Date.now();
console.log(`[${new Date().toISOString()}] Initializing database module (t=0ms)`);

// Performance optimizations
let isWarmedUp = false;
let queryClient: postgres.Sql | null = null;
let poolInstance: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

// These getter functions ensure we only create connections when they're needed
// and not during the initial server startup

// Get the database connection URL
function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return connectionString;
}

// Get the connection pool, creating it if it doesn't exist
export function getPool(): Pool {
  if (!poolInstance) {
    console.log(`[${new Date().toISOString()}] Creating database pool (t=${Date.now() - dbInitStartTime}ms)`);
    poolInstance = new Pool({ connectionString: getConnectionString() });
  }
  return poolInstance;
}

// Get the postgres client, creating it if it doesn't exist
function getQueryClient(): postgres.Sql {
  if (!queryClient) {
    console.log(`[${new Date().toISOString()}] Creating postgres client (t=${Date.now() - dbInitStartTime}ms)`);
    queryClient = postgres(getConnectionString());
  }
  return queryClient;
}

// Get the Drizzle ORM instance, creating it if it doesn't exist
export function getDb(): ReturnType<typeof drizzle> {
  if (!dbInstance) {
    console.log(`[${new Date().toISOString()}] Creating Drizzle ORM instance (t=${Date.now() - dbInitStartTime}ms)`);
    dbInstance = drizzle(getQueryClient(), { schema });
  }
  return dbInstance;
}

// For compatibility with existing code
export const pool = new Proxy({} as Pool, {
  get: (target, prop) => {
    return getPool()[prop as keyof Pool];
  }
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get: (target, prop) => {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  }
});

// Function to warm up the database connection
// Only called when actually needed
export async function warmupDatabase() {
  if (isWarmedUp) return;
  
  console.log(`[${new Date().toISOString()}] Warming up database connection... (t=${Date.now() - dbInitStartTime}ms)`);
  const startTime = Date.now();
  
  try {
    // Run a simple query to establish the connection
    await getDb().execute(sql`SELECT 1 AS result`);
    
    isWarmedUp = true;
    console.log(`[${new Date().toISOString()}] Database connection warmed up in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error('Failed to warm up database connection:', error);
    throw error;
  }
}

console.log(`[${new Date().toISOString()}] Database module initialization complete (t=${Date.now() - dbInitStartTime}ms)`);

