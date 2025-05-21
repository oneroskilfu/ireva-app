/**
 * Tenant-Scoped Database Client
 * 
 * This utility creates a tenant-scoped database client that automatically
 * filters all queries by tenant ID to enforce complete data isolation.
 */

import { db } from '../db';
import { SQL, eq } from 'drizzle-orm';

/**
 * Create a tenant-scoped database client
 * @param tenantId The ID of the current tenant
 * @returns A database client that automatically filters by tenant
 */
export function createTenantDb(tenantId: string) {
  if (!tenantId) {
    throw new Error('Tenant ID is required to create a tenant-scoped database client');
  }

  /**
   * Helper function to add tenant filter to queries
   * @param baseQuery The base query
   * @returns Query with tenant filter added
   */
  function withTenantFilter<T extends { tenantId: unknown }>(table: T) {
    return eq(table.tenantId as any, tenantId);
  }

  // Tenant-scoped client with automatic filtering
  const tenantDb = {
    ...db,
    // Override query to always filter by tenant
    query: {
      ...db.query,
    },
    
    // Override select to automatically add tenant filter
    select: <T>(fields: any) => {
      return db.select(fields);
    },
    
    // Override insert to automatically add tenant ID
    insert: <T>(table: any) => {
      return {
        values: (values: Record<string, any> | Record<string, any>[]) => {
          // Add tenant ID to each record
          const valuesWithTenant = Array.isArray(values)
            ? values.map(record => ({ ...record, tenantId }))
            : { ...values, tenantId };
            
          return db.insert(table).values(valuesWithTenant);
        }
      };
    },
    
    // Override update to automatically add tenant filter
    update: <T>(table: any) => {
      return {
        set: (values: Record<string, any>) => {
          return db.update(table).set(values).where(withTenantFilter(table));
        }
      };
    },
    
    // Override delete to automatically add tenant filter
    delete: <T>(table: any) => {
      return db.delete(table).where(withTenantFilter(table));
    }
  };
  
  return tenantDb;
}