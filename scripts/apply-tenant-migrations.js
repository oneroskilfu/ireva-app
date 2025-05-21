/**
 * Tenant Migration Script
 * 
 * This script applies the tenant-related database migrations.
 */

const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Get database connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

// Create database pool
const pool = new Pool({ connectionString: databaseUrl });

async function runMigration(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`Running migration: ${path.basename(filePath)}`);
  
  try {
    await pool.query(sql);
    console.log(`✅ Successfully applied migration: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying migration ${path.basename(filePath)}:`, error.message);
    return false;
  }
}

async function applyMigrations() {
  console.log('Starting tenant database migrations...');
  
  // Get migration files
  const migrationsDir = path.resolve(__dirname, '../migrations/tenant');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  if (migrationFiles.length === 0) {
    console.log('No migration files found');
    return;
  }
  
  console.log(`Found ${migrationFiles.length} migration files`);
  
  // Apply migrations in a transaction
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Run migrations in order
    let success = true;
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const result = await runMigration(filePath);
      if (!result) {
        success = false;
        break;
      }
    }
    
    if (success) {
      await client.query('COMMIT');
      console.log('✅ All tenant migrations applied successfully');
    } else {
      await client.query('ROLLBACK');
      console.error('❌ Migration failed, rolled back changes');
      process.exit(1);
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error applying migrations:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations
applyMigrations();