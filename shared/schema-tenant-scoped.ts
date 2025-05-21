/**
 * Multi-tenant Schema Extensions
 * 
 * This file contains discriminator field definitions and utility types
 * for implementing multi-tenancy within the iREVA platform.
 */

import { uuid } from 'drizzle-orm/pg-core';
import { InferModel } from 'drizzle-orm';
import { pgTable } from 'drizzle-orm/pg-core';
import { z } from 'zod';

/**
 * Common discriminator field to be added to all tenant-scoped tables
 */
export const tenantDiscriminator = {
  tenantId: uuid('tenant_id').notNull(),
};

/**
 * Tenant header constant for identifying tenant in requests
 */
export const TENANT_HEADER = 'x-tenant-id';

/**
 * Type for a tenant-scoped request
 */
export interface TenantScopedRequest extends Request {
  tenantId: string;
}

/**
 * Utility type to add tenant ID to any type
 */
export type WithTenant<T> = T & {
  tenantId: string;
};

/**
 * Utility type for tenant-scoped model
 */
export type TenantScopedModel<T extends Record<string, any>> = T & {
  tenantId: string;
};

/**
 * Utility function to add tenant ID to a pgTable definition
 */
export function tenantScopedTable<T extends Record<string, any>>(
  name: string,
  columns: T
) {
  return pgTable(name, {
    ...columns,
    ...tenantDiscriminator,
  });
}

/**
 * Zod validator for tenant ID in UUID format
 */
export const tenantIdValidator = z.string().uuid({
  message: 'Tenant ID must be a valid UUID',
});

/**
 * Utility function to add tenant filter to a query
 */
export function withTenantFilter<T extends Record<string, any>>(
  query: T,
  tenantId: string
): T {
  return {
    ...query,
    where: {
      ...(query.where || {}),
      tenantId,
    },
  };
}