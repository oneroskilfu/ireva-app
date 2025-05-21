/**
 * Tenant Table Factory
 * 
 * This module provides a factory function that creates tenant-scoped tables.
 * These tables automatically include a tenantId column that links to the tenant,
 * ensuring proper data isolation between organizations.
 */

import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { tenants } from './schema-tenants';

/**
 * Creates a tenant-scoped table with an automatic tenantId column
 * @param tableName The name of the table
 * @param columns The table columns (excluding tenantId which is added automatically)
 * @returns A pg table with a tenantId column
 */
export function tenantTable<T extends Record<string, any>>(
  tableName: string,
  columns: T
) {
  return pgTable(tableName, {
    // Add the tenant ID column as the first column
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    
    // Include all the other columns
    ...columns
  });
}