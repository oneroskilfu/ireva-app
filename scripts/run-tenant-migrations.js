/**
 * Tenant Migration Runner
 * 
 * This script runs the tenant-specific SQL migrations in order.
 * It tracks executed migrations to avoid running them multiple times.
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../migrations/tenant');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Ensure the migrations table exists
async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "tenant_migrations" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "applied_at" TIMESTAMP NOT NULL DEFAULT now()
    );
  `);
}

// Get list of applied migrations
async function getAppliedMigrations() {
  const result = await pool.query('SELECT name FROM tenant_migrations ORDER BY id');
  return result.rows.map(row => row.name);
}

// Apply a migration file
async function applyMigration(migrationFile) {
  console.log(`Applying migration: ${migrationFile}`);
  const filePath = path.join(migrationsDir, migrationFile);
  const sql = fs.readFileSync(filePath, 'utf-8');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Execute the migration
    await client.query(sql);
    
    // Record the migration
    await client.query(
      'INSERT INTO tenant_migrations (name) VALUES ($1)',
      [migrationFile]
    );
    
    await client.query('COMMIT');
    console.log(`Migration ${migrationFile} applied successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error applying migration ${migrationFile}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Rollback a migration
async function rollbackMigration(migrationFile) {
  // Skip if not a forward migration file (i.e., if it's already a rollback file)
  if (migrationFile.includes('_rollback')) {
    console.log(`Skipping rollback file: ${migrationFile}`);
    return;
  }
  
  const rollbackFile = migrationFile.replace('.sql', '_rollback.sql');
  const rollbackPath = path.join(migrationsDir, rollbackFile);
  
  // Check if rollback file exists
  if (!fs.existsSync(rollbackPath)) {
    console.warn(`No rollback file found for ${migrationFile}`);
    return;
  }
  
  console.log(`Rolling back migration: ${migrationFile}`);
  const sql = fs.readFileSync(rollbackPath, 'utf-8');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Execute the rollback
    await client.query(sql);
    
    // Remove the migration record
    await client.query(
      'DELETE FROM tenant_migrations WHERE name = $1',
      [migrationFile]
    );
    
    await client.query('COMMIT');
    console.log(`Migration ${migrationFile} rolled back successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error rolling back migration ${migrationFile}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Get list of migration files in order
function getMigrationFiles() {
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && !file.includes('_rollback'))
    .sort(); // Ensure migrations run in order based on filename
}

// Main function to run migrations
async function runMigrations() {
  try {
    await ensureMigrationsTable();
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log('Applied migrations:', appliedMigrations);
    
    // Get all migration files
    const migrationFiles = getMigrationFiles();
    console.log('Available migrations:', migrationFiles);
    
    // Apply migrations that haven't been applied yet
    for (const migrationFile of migrationFiles) {
      if (!appliedMigrations.includes(migrationFile)) {
        await applyMigration(migrationFile);
      } else {
        console.log(`Migration ${migrationFile} already applied, skipping`);
      }
    }
    
    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Main function to rollback migrations
async function rollbackMigrations(migrationName) {
  try {
    await ensureMigrationsTable();
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log('Applied migrations:', appliedMigrations);
    
    if (migrationName === 'all') {
      // Rollback all migrations in reverse order
      const reversedMigrations = [...appliedMigrations].reverse();
      
      for (const migration of reversedMigrations) {
        await rollbackMigration(migration);
      }
      
      console.log('All migrations rolled back successfully');
    } else if (migrationName) {
      // Rollback a specific migration
      if (appliedMigrations.includes(migrationName)) {
        await rollbackMigration(migrationName);
      } else {
        console.warn(`Migration ${migrationName} not found or not applied`);
      }
    } else {
      // Rollback the last migration
      if (appliedMigrations.length > 0) {
        const lastMigration = appliedMigrations[appliedMigrations.length - 1];
        await rollbackMigration(lastMigration);
        console.log('Last migration rolled back successfully');
      } else {
        console.log('No migrations to roll back');
      }
    }
  } catch (error) {
    console.error('Rollback error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Command line execution
const command = process.argv[2] || 'run';
const migrationName = process.argv[3];

if (command === 'run') {
  runMigrations();
} else if (command === 'rollback') {
  rollbackMigrations(migrationName);
} else {
  console.error('Unknown command, use "run" or "rollback"');
  process.exit(1);
}