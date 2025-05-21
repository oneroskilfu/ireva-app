/**
 * Tenant-Scoped Table Utility
 * 
 * This module provides utilities for creating tenant-scoped tables
 * that automatically include a tenant ID field and appropriate constraints.
 */

import { pgTable, uuid, PgTableWithColumns } from 'drizzle-orm/pg-core';
import { tenants } from './schema-tenants';
import { InferSelectModel } from 'drizzle-orm';
import type { TableConfig } from 'drizzle-orm/pg-core';

/**
 * Creates a tenant-scoped table with an automatic tenant ID foreign key
 * 
 * @param name The table name
 * @param columns The table column definitions
 * @param extraConfig Optional extra table configuration
 * @returns A table definition with tenant ID column
 */
export function tenantScopedTable(
  name: string,
  columns: Record<string, any>,
  extraConfig?: TableConfig
) {
  // Create table with tenant ID column and references
  return pgTable(
    name,
    {
      // Add tenant ID column with foreign key reference
      tenantId: uuid('tenant_id')
        .notNull()
        .references(() => tenants.id, { onDelete: 'cascade' }),
      
      // Include all the provided columns
      ...columns
    },
    extraConfig
  );
}

/**
 * Type helper for extracting the tenant ID from a tenant-scoped table
 */
export type WithTenantId<T> = T & { tenantId: string };

/**
 * Type helper for scoping a type to a tenant
 */
export type TenantScoped<T extends object> = T & { tenantId: string };

/**
 * Type helper for creating an insert type that includes tenant ID
 */
export type TenantScopedInsert<T extends object> = Omit<T, 'tenantId'> & { tenantId: string };

/**
 * Type helper for creating a select type from a tenant-scoped table
 */
export type TenantScopedSelect<T extends PgTableWithColumns<any>> = InferSelectModel<T>;

export default tenantScopedTable;