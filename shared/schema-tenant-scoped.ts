/**
 * Tenant-Scoped Table Utility
 * 
 * This module provides utilities for creating tenant-scoped tables
 * that automatically include a tenant ID field and appropriate constraints.
 */

import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { tenants } from './schema-tenants';
import { InferSelectModel } from 'drizzle-orm';

/**
 * The simplest implementation of a tenant-scoped table
 * This avoids TypeScript errors while maintaining functionality
 */
export function tenantScopedTable(tableName: string, columns: Record<string, any>) {
  return pgTable(tableName, {
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    ...columns
  });
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
export type TenantScopedSelect<T> = InferSelectModel<T>;

export default tenantScopedTable;