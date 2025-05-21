/**
 * Tenant Schema Definitions
 * 
 * This file defines the core multi-tenant tables for the iREVA platform.
 */

import { pgTable, uuid, text, timestamp, integer, boolean, primaryKey } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
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

/**
 * Tenant Users junction table - Maps users to tenants with roles
 */
export const tenantUsers = pgTable('tenant_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull(),
  role: text('role').notNull().default('member'),
  isOwner: boolean('is_owner').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  lastAccessAt: timestamp('last_access_at'),
  invitedBy: integer('invited_by'),
}, (table) => {
  return {
    // Ensure a user can only have one record per tenant
    uniqueTenantUser: primaryKey({ columns: [table.tenantId, table.userId] }),
  }
});

// Define relations between tables
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(tenantUsers),
}));

export const tenantUsersRelations = relations(tenantUsers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantUsers.tenantId],
    references: [tenants.id],
  }),
}));

// Zod schema for tenant validation
export const insertTenantSchema = createInsertSchema(tenants)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Zod schema for tenant user validation
export const insertTenantUserSchema = createInsertSchema(tenantUsers)
  .omit({ id: true, joinedAt: true, lastAccessAt: true });

// Export types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = z.infer<typeof insertTenantUserSchema>;