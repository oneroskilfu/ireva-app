/**
 * Tenant Database Client
 * 
 * This module provides a tenant-scoped database client that automatically
 * filters queries by tenant ID to ensure proper data isolation.
 */

import { db } from '../db';
import { eq, and, or, SQL } from 'drizzle-orm';
import { PgSelect, PgInsert, PgUpdate, PgDelete } from 'drizzle-orm/pg-core';

/**
 * A proxy handler that intercepts database operations to enforce tenant isolation
 */
function createTenantDbProxy(tenantId: string) {
  return {
    get(target: any, prop: string | symbol) {
      // Get the original property value
      const originalValue = target[prop];
      
      // If it's not a function or a special property, return it as is
      if (typeof originalValue !== 'function' || prop === 'then' || prop === 'catch') {
        return originalValue;
      }
      
      // Proxy for select operations
      if (prop === 'select') {
        return function(...args: any[]) {
          // Call the original select method
          const query = originalValue.apply(target, args);
          
          // Add tenant filtering capability to the query
          const originalFrom = query.from;
          query.from = function(...fromArgs: any[]) {
            const fromQuery = originalFrom.apply(query, fromArgs);
            
            // Check if the table has a tenantId column
            const table = fromArgs[0];
            if (table && 'tenantId' in table) {
              // Store the original where method
              const originalWhere = fromQuery.where;
              
              // Override the where method to add tenant ID filter
              fromQuery.where = function(...whereArgs: any[]) {
                if (whereArgs.length > 0) {
                  // Add tenantId filter to existing conditions
                  return originalWhere.call(
                    fromQuery, 
                    and(eq(table.tenantId, tenantId), ...whereArgs)
                  );
                } else {
                  // If no conditions, just add tenantId filter
                  return originalWhere.call(fromQuery, eq(table.tenantId, tenantId));
                }
              };
              
              // If there's no where call, add tenant filter by default
              const originalExecute = fromQuery.execute;
              fromQuery.execute = function() {
                // Add the where clause with tenant filter if not already added
                if (!fromQuery._hasWhere) {
                  fromQuery.where(eq(table.tenantId, tenantId));
                }
                return originalExecute.apply(fromQuery, arguments);
              };
            }
            
            return fromQuery;
          };
          
          return query;
        };
      }
      
      // Proxy for insert operations
      if (prop === 'insert') {
        return function(...args: any[]) {
          // Call the original insert method
          const query = originalValue.apply(target, args);
          
          // Add tenant ID to values
          const originalValues = query.values;
          query.values = function(values: any) {
            if (Array.isArray(values)) {
              // Handle array of values
              const valuesWithTenant = values.map(record => ({
                ...record,
                tenantId
              }));
              return originalValues.call(query, valuesWithTenant);
            } else {
              // Handle single record
              return originalValues.call(query, {
                ...values,
                tenantId
              });
            }
          };
          
          return query;
        };
      }
      
      // Proxy for update operations
      if (prop === 'update') {
        return function(...args: any[]) {
          // Call the original update method
          const query = originalValue.apply(target, args);
          
          // Store the original where method
          const originalWhere = query.where;
          
          // Override the where method to add tenant ID filter
          query.where = function(...whereArgs: any[]) {
            const table = args[0];
            if (table && 'tenantId' in table) {
              // Add tenantId filter to existing conditions
              return originalWhere.call(
                query, 
                and(eq(table.tenantId, tenantId), ...whereArgs)
              );
            } else {
              return originalWhere.apply(query, whereArgs);
            }
          };
          
          return query;
        };
      }
      
      // Proxy for delete operations
      if (prop === 'delete') {
        return function(...args: any[]) {
          // Call the original delete method
          const query = originalValue.apply(target, args);
          
          // Store the original where method
          const originalWhere = query.where;
          
          // Override the where method to add tenant ID filter
          query.where = function(...whereArgs: any[]) {
            const table = args[0];
            if (table && 'tenantId' in table) {
              // Add tenantId filter to existing conditions
              return originalWhere.call(
                query, 
                and(eq(table.tenantId, tenantId), ...whereArgs)
              );
            } else {
              return originalWhere.apply(query, whereArgs);
            }
          };
          
          return query;
        };
      }
      
      // Return original method for other operations
      return originalValue;
    }
  };
}

/**
 * Returns a tenant-scoped database client
 * 
 * @param tenantId The ID of the current tenant
 * @returns A Drizzle ORM client that automatically filters by tenant ID
 */
export function getTenantDbClient(tenantId: string) {
  if (!tenantId) {
    throw new Error('Tenant ID is required for tenant-scoped database operations');
  }
  
  // Create a proxy for the database client
  const tenantDb = new Proxy(db, createTenantDbProxy(tenantId));
  
  return tenantDb;
}

/**
 * Create a tenant-aware filter to use in Drizzle queries
 * 
 * @param tenantId The ID of the current tenant
 * @param table The database table
 * @param condition Optional additional condition to combine with tenant filter
 * @returns SQL condition combining tenant filter with optional condition
 */
export function withTenantFilter(
  tenantId: string,
  table: { tenantId: any },
  condition?: SQL
) {
  if (condition) {
    return and(eq(table.tenantId, tenantId), condition);
  }
  return eq(table.tenantId, tenantId);
}

export default getTenantDbClient;