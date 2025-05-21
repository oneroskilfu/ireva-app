/**
 * Tenant Schema
 * 
 * This file defines the database schema for tenants and tenant users.
 */

import { pgTable, uuid, text, timestamp, boolean, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';
import { relations } from 'drizzle-orm';

/**
 * Tenants table
 * Stores organizations/companies in the multi-tenant architecture
 */
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  domain: text('domain'),
  logo: text('logo'),
  primaryColor: text('primary_color').default('#3B82F6'),
  subscriptionTier: text('subscription_tier').default('free').notNull(),
  subscriptionStatus: text('subscription_status').default('active').notNull(),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  maxUsers: integer('max_users').default(5).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => {
  return {
    slugIdx: uniqueIndex('tenant_slug_idx').on(table.slug)
  };
});

/**
 * Tenant-User relationships
 * Links users to tenants with roles and permissions
 */
export const tenantUsers = pgTable('tenant_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('user'),
  permissions: text('permissions').array(),
  isOwner: boolean('is_owner').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => {
  return {
    tenantUserIdx: uniqueIndex('tenant_user_idx').on(table.tenantId, table.userId)
  };
});

/**
 * Relations
 */
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(tenantUsers),
}));

export const tenantUsersRelations = relations(tenantUsers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantUsers.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantUsers.userId],
    references: [users.id],
  }),
}));

/**
 * Schemas for validation
 */
export const insertTenantSchema = createInsertSchema(tenants, {
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 
    'Slug must contain only lowercase letters, numbers, and hyphens'),
  name: z.string().min(2).max(100),
  domain: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color').optional(),
});

export const selectTenantSchema = createSelectSchema(tenants);

export const insertTenantUserSchema = createInsertSchema(tenantUsers, {
  role: z.enum(['admin', 'manager', 'user']),
  permissions: z.array(z.string()).optional(),
});

export const selectTenantUserSchema = createSelectSchema(tenantUsers);

/**
 * Types
 */
export type Tenant = z.infer<typeof selectTenantSchema>;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type TenantUser = z.infer<typeof selectTenantUserSchema>;
export type InsertTenantUser = z.infer<typeof insertTenantUserSchema>;