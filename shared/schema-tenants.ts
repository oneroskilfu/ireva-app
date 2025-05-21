/**
 * Tenant Schema Definitions
 * 
 * This file defines the core multi-tenant tables for the iREVA platform.
 */

import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Tenants table - Core entity for multi-tenant functionality
 */
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Zod schema for tenant validation
export const insertTenantSchema = createInsertSchema(tenants)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Export types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;