import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';

// Connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Initialize the connection pool for session store and other direct pool needs
export const pool = new Pool({ connectionString });

// Create a postgres client with default settings for Drizzle
const queryClient = postgres(connectionString);

// Create the Drizzle ORM instance
export const db = drizzle(queryClient, { schema });

// Some performance optimizations
let isWarmedUp = false;

// Function to warm up the database connection
export async function warmupDatabase() {
  if (isWarmedUp) return;
  
  console.log('Warming up database connection...');
  const startTime = Date.now();
  
  try {
    // Run a simple query to establish the connection
    await db.execute(sql`SELECT 1 AS result`);
    
    isWarmedUp = true;
    console.log(`Database connection warmed up in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error('Failed to warm up database connection:', error);
    throw error;
  }
}

