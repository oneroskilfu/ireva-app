/**
 * Apply Tenant Migrations
 * 
 * This script creates and applies the necessary database migrations 
 * for the multi-tenant functionality in the iREVA platform.
 */

require('dotenv').config();
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const fs = require('fs');
const path = require('path');

// Create PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Database client
const db = drizzle(pool);

// Migration path
const migrationsFolder = path.join(__dirname, '../migrations/tenant');

async function main() {
  console.log('Starting tenant migrations...');
  
  try {
    // Create migrations folder if it doesn't exist
    if (!fs.existsSync(migrationsFolder)) {
      fs.mkdirSync(migrationsFolder, { recursive: true });
      console.log(`Created migrations folder at ${migrationsFolder}`);
    }
    
    // Check if we have any migration files
    const existingMigrationFiles = fs.readdirSync(migrationsFolder);
    if (existingMigrationFiles.length === 0) {
      console.log('No migration files found. Writing initial migration files...');
      
      // Create initial migration for tenants table
      const tenantsMigration = `
-- Migration: Create tenant tables
-- Description: Sets up the core tenant tables for multi-tenant functionality

-- Create tenants table
CREATE TABLE IF NOT EXISTS "tenants" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tenant_users junction table
CREATE TABLE IF NOT EXISTS "tenant_users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "is_owner" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "last_access_at" TIMESTAMP WITH TIME ZONE,
  "invited_by" INTEGER,
  UNIQUE("tenant_id", "user_id")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_tenant_users_tenant_id" ON "tenant_users"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_users_user_id" ON "tenant_users"("user_id");
CREATE INDEX IF NOT EXISTS "idx_tenants_slug" ON "tenants"("slug");
`;
      
      // Create migration rollback
      const tenantsMigrationRollback = `
-- Rollback: Drop tenant tables
-- Description: Removes all tenant-related tables

-- Drop indexes
DROP INDEX IF EXISTS "idx_tenant_users_tenant_id";
DROP INDEX IF EXISTS "idx_tenant_users_user_id";
DROP INDEX IF EXISTS "idx_tenants_slug";

-- Drop tables (reverse order to handle foreign keys)
DROP TABLE IF EXISTS "tenant_users";
DROP TABLE IF EXISTS "tenants";
`;
      
      // Write migration files
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
      fs.writeFileSync(
        path.join(migrationsFolder, `${timestamp}_create_tenant_tables.sql`),
        tenantsMigration
      );
      fs.writeFileSync(
        path.join(migrationsFolder, `${timestamp}_create_tenant_tables.rollback.sql`),
        tenantsMigrationRollback
      );
      
      console.log('Migration files created successfully.');
    }
    
    // Apply migrations
    console.log('Applying migrations...');
    
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at timestamp with time zone DEFAULT now()
      );
    `);
    
    // Execute each migration file in order
    const migrationFiles = fs.readdirSync(migrationsFolder)
      .filter(file => !file.includes('.rollback.') && file.endsWith('.sql'))
      .sort();
    
    // Get already applied migrations
    const { rows: appliedMigrations } = await pool.query(
      'SELECT hash FROM drizzle_migrations'
    );
    const appliedHashes = new Set(appliedMigrations.map(m => m.hash));
    
    // Apply each migration if not already applied
    for (const file of migrationFiles) {
      if (!appliedHashes.has(file)) {
        console.log(`Applying migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsFolder, file), 'utf8');
        
        // Start a transaction for this migration
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query(
            'INSERT INTO drizzle_migrations (hash) VALUES ($1)',
            [file]
          );
          await client.query('COMMIT');
          console.log(`Migration ${file} applied successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Error applying migration ${file}:`, error);
          throw error;
        } finally {
          client.release();
        }
      } else {
        console.log(`Migration ${file} already applied, skipping`);
      }
    }
    
    console.log('All migrations applied successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);