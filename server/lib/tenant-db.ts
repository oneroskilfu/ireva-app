/**
 * Tenant Database Client
 * 
 * This module creates a tenant-scoped database client that automatically
 * applies tenant filtering to all database queries. This ensures complete
 * tenant isolation when accessing tenant-scoped tables.
 */

import { and, eq, SQL } from 'drizzle-orm';
import { db } from '../db';
import { tenantTables } from '@shared/schema-tenant-tables';

/**
 * Creates a tenant-scoped database client
 * @param tenantId The tenant ID to scope queries to
 * @returns A database client with tenant filtering
 */
export function createTenantDb(tenantId: string) {
  // Function to add tenant filter to queries
  function addTenantFilter<T extends Record<string, any>>(
    query: SQL<T>,
    tableName: string
  ): SQL<T> {
    // Check if this is a tenant-scoped table
    if (tenantTables.includes(tableName)) {
      // Get the table object
      const table = db._.schema[tableName];
      
      // Add tenant filter if table has tenantId column
      if (table && 'tenantId' in table) {
        return and(query, eq(table.tenantId, tenantId)) as SQL<T>;
      }
    }
    
    return query;
  }
  
  // Create a proxy to intercept database queries
  const tenantDb = new Proxy(db, {
    get(target, prop, receiver) {
      // Get the original property
      const originalProp = Reflect.get(target, prop, receiver);
      
      // If it's not a function, return it as is
      if (typeof originalProp !== 'function') {
        return originalProp;
      }
      
      // If it's a query function, intercept it
      if (['select', 'insert', 'update', 'delete'].includes(prop as string)) {
        // Return a wrapped function that adds tenant filtering
        return function(...args: any[]) {
          // Call the original function to get the query builder
          const queryBuilder = originalProp.apply(target, args);
          
          // Add tenant filtering
          const originalFrom = queryBuilder.from;
          queryBuilder.from = function(table: any) {
            // Get the table name
            const tableName = typeof table === 'string' ? table : table.name;
            
            // Add tenant filter to the query
            if (tenantTables.includes(tableName)) {
              const originalWhere = queryBuilder.where;
              queryBuilder.where = function(query: SQL<any>) {
                return originalWhere.call(this, addTenantFilter(query, tableName));
              };
            }
            
            // Call the original from function
            return originalFrom.call(this, table);
          };
          
          return queryBuilder;
        };
      }
      
      // For other functions, return them as is
      return originalProp;
    }
  });
  
  return tenantDb;
}

/**
 * Get the current tenant ID from the request context
 */
export function getCurrentTenantId(): string | undefined {
  // This will be set by the tenant context middleware
  if (typeof window !== 'undefined') {
    // Client-side: Get from localStorage
    return localStorage.getItem('selectedTenantId') || undefined;
  }
  
  // Server-side: Get from request context (set by middleware)
  return undefined; // Will be set by middleware for each request
}