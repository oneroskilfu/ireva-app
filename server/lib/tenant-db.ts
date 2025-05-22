/**
 * Tenant Database Utility
 * 
 * This utility creates a tenant-scoped database client that automatically
 * applies tenant filtering to all database operations on tenant-scoped tables.
 */

import { eq } from 'drizzle-orm';
import { db } from '../db';
import { tenantTables } from '@shared/schema-tenant-tables';

/**
 * Creates a tenant-scoped database client that automatically
 * applies tenant filtering to all operations on tenant-scoped tables.
 * 
 * Usage:
 * const tenantDb = createTenantDb(tenantId);
 * const users = await tenantDb.select().from(tenantUsers);
 * 
 * Note: This will automatically filter by tenantId for all tenant-scoped tables.
 */
export function createTenantDb(tenantId: string) {
  // Create a new db instance with the same connection but with tenant context
  const tenantDb = db.withTenantContext(tenantId);
  return tenantDb;
}

// Add tenant context extension to the drizzle instance
declare module 'drizzle-orm/pg-core' {
  interface PgDatabase {
    withTenantContext(tenantId: string): typeof db;
  }
}

// Implement the tenant context extension
db.withTenantContext = function(tenantId: string) {
  // Clone the database instance
  const tenantDb = Object.create(this);
  
  // Override the query methods to apply tenant filtering
  const originalSelect = tenantDb.select.bind(tenantDb);
  const originalUpdate = tenantDb.update.bind(tenantDb);
  const originalInsert = tenantDb.insert.bind(tenantDb);
  const originalDelete = tenantDb.delete.bind(tenantDb);
  
  // Override select method to add tenant filter
  tenantDb.select = function(...args: any[]) {
    const query = originalSelect(...args);
    const originalFrom = query.from.bind(query);
    
    query.from = function(table: any) {
      const result = originalFrom(table);
      
      // If this is a tenant-scoped table, add tenant filter
      if (tenantTables.has(table.name)) {
        return result.where(eq(table.tenantId, tenantId));
      }
      
      return result;
    };
    
    return query;
  };
  
  // Override update method to add tenant filter
  tenantDb.update = function(table: any) {
    const query = originalUpdate(table);
    
    // If this is a tenant-scoped table, add tenant filter
    if (tenantTables.has(table.name)) {
      const originalWhere = query.where.bind(query);
      
      query.where = function(...args: any[]) {
        return originalWhere(eq(table.tenantId, tenantId), ...args);
      };
    }
    
    return query;
  };
  
  // Override insert method to add tenant ID
  tenantDb.insert = function(table: any) {
    const query = originalInsert(table);
    
    // If this is a tenant-scoped table, add tenant ID to values
    if (tenantTables.has(table.name)) {
      const originalValues = query.values.bind(query);
      
      query.values = function(values: any) {
        // Add tenantId to each value
        if (Array.isArray(values)) {
          values = values.map((v) => ({ ...v, tenantId }));
        } else {
          values = { ...values, tenantId };
        }
        
        return originalValues(values);
      };
    }
    
    return query;
  };
  
  // Override delete method to add tenant filter
  tenantDb.delete = function(table: any) {
    const query = originalDelete(table);
    
    // If this is a tenant-scoped table, add tenant filter
    if (tenantTables.has(table.name)) {
      const originalWhere = query.where.bind(query);
      
      query.where = function(...args: any[]) {
        return originalWhere(eq(table.tenantId, tenantId), ...args);
      };
    }
    
    return query;
  };
  
  return tenantDb;
};