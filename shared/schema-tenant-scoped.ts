/**
 * Tenant-Scoped Table Generator
 * 
 * This utility generates tenant-scoped tables for the multi-tenant architecture.
 * It ensures all tenant-specific tables include a tenantId field and appropriate constraints.
 */

import { pgTable, uuid, Table, TableConfig, Column } from 'drizzle-orm/pg-core';
import { tenants } from './schema-tenants';

/**
 * Creates a tenant-scoped table with a tenantId column
 * 
 * @param name - The name of the table
 * @param columns - Object with column definitions
 * @param extraConfig - Extra configuration for the table
 * @returns A pgTable instance with tenant ID column
 */
export function tenantTable(
  name: string,
  columns: Record<string, any>,
  extraConfig?: Parameters<typeof pgTable>[2]
) {
  // Add tenantId column
  const columnsWithTenant = {
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    ...columns,
  };
  
  // Create table
  return pgTable(name, columnsWithTenant, extraConfig);
}

/**
 * Type helper for tenant-scoped tables
 */
export type TenantScoped<T> = T & {
  tenantId: string;
};

/**
 * Filter helper for tenant-scoped queries
 * 
 * @param tenantId - The ID of the current tenant
 * @returns A function that returns a WHERE condition for the tenant ID
 */
export function tenantFilter(tenantId: string) {
  return <T extends { tenantId: unknown }>(table: T) => ({ tenantId: table.tenantId });
}