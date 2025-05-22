/**
 * Tenant-Scoped Tables Schema
 * 
 * This file defines tables that belong to a specific tenant.
 * All these tables include a tenantId field and are automatically
 * filtered by the tenant-db utility.
 */

import { pgTable, text, timestamp, boolean, integer, uuid, primaryKey } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';
import { tenants } from './schema-tenants';

// Set of tenant-scoped table names for automatic filtering
export const tenantTables = new Set([
  'tenant_users',
  'tenant_invitations',
  'properties',
  'investments',
  'transactions',
  'documents',
  'notifications',
]);

// Tenant Users table - links users to tenants with roles
export const tenantUsers = pgTable('tenant_users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: integer('user_id').notNull().references(() => users.id),
  role: text('role').notNull().default('user'),
  isOwner: boolean('is_owner').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  lastActiveAt: timestamp('last_active_at'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tenant Invitations table - for inviting users to tenants
export const tenantInvitations = pgTable('tenant_invitations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  email: text('email').notNull(),
  role: text('role').notNull().default('user'),
  token: text('token').notNull().unique(),
  status: text('status').notNull().default('pending'),
  expiresAt: timestamp('expires_at').notNull(),
  createdByUserId: integer('created_by_user_id').notNull().references(() => users.id),
  acceptedByUserId: integer('accepted_by_user_id').references(() => users.id),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Types
export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = typeof tenantUsers.$inferInsert;
export type TenantInvitation = typeof tenantInvitations.$inferSelect;
export type InsertTenantInvitation = typeof tenantInvitations.$inferInsert;