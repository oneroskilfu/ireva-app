/**
 * Tenant Management Schema
 * 
 * This file defines the schema for the tenants table and related
 * utilities for managing multi-tenant functionality in the iREVA platform.
 */

import { pgTable, uuid, text, boolean, timestamp, integer, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Tenant status options
 */
export enum TenantStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  TRIAL = 'trial',
}

/**
 * Tenant subscription tiers
 */
export enum TenantTierEnum {
  FREE = 'free',
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

/**
 * Tenant table schema
 */
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  status: text('status')
    .notNull()
    .default(TenantStatusEnum.ACTIVE),
  tier: text('tier')
    .notNull()
    .default(TenantTierEnum.BASIC),
  primaryContactEmail: text('primary_contact_email').notNull(),
  primaryContactName: text('primary_contact_name').notNull(),
  primaryContactPhone: text('primary_contact_phone'),
  billingEmail: text('billing_email'),
  billingAddress: text('billing_address'),
  subscriptionId: text('subscription_id'),
  subscriptionStatus: text('subscription_status'),
  subscriptionStartDate: timestamp('subscription_start_date'),
  subscriptionEndDate: timestamp('subscription_end_date'),
  logoUrl: text('logo_url'),
  customDomain: text('custom_domain'),
  theme: json('theme'),
  maxUsers: integer('max_users'),
  userCount: integer('user_count').notNull().default(0),
  features: json('features'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Tenant users junction table schema
 * This table maps users to tenants for many-to-many relationship
 */
export const tenantUsers = pgTable('tenant_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  userId: integer('user_id').notNull(), // References users.id
  role: text('role').notNull().default('member'), // admin, member, viewer, etc.
  isOwner: boolean('is_owner').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  lastAccessAt: timestamp('last_access_at'),
  invitedBy: integer('invited_by'), // References users.id
  metadata: json('metadata'),
});

/**
 * Tenant invitations schema
 */
export const tenantInvitations = pgTable('tenant_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  email: text('email').notNull(),
  invitedByUserId: integer('invited_by_user_id').notNull(), // References users.id
  role: text('role').notNull().default('member'),
  status: text('status').notNull().default('pending'), // pending, accepted, declined, expired
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Tenant theme options schema
 */
export const themeSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  logoUrl: z.string().optional(),
  font: z.string().optional(),
  isDarkMode: z.boolean().optional(),
  customCss: z.string().optional(),
});

/**
 * Tenant features schema
 */
export const featuresSchema = z.object({
  kycVerification: z.boolean().default(true),
  investorDashboard: z.boolean().default(true),
  adminDashboard: z.boolean().default(true),
  walletManagement: z.boolean().default(true),
  documentManagement: z.boolean().default(true),
  multiCurrency: z.boolean().default(false),
  apiAccess: z.boolean().default(false),
  whiteLabel: z.boolean().default(false),
  advancedAnalytics: z.boolean().default(false),
  customIntegrations: z.boolean().default(false),
});

/**
 * Insert schema validation for tenants
 */
export const insertTenantSchema = createInsertSchema(tenants, {
  theme: themeSchema.optional(),
  features: featuresSchema.optional(),
  metadata: z.record(z.any()).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userCount: true,
});

/**
 * Insert schema validation for tenant users
 */
export const insertTenantUserSchema = createInsertSchema(tenantUsers, {
  metadata: z.record(z.any()).optional(),
}).omit({
  id: true,
  joinedAt: true,
  lastAccessAt: true,
});

/**
 * Insert schema validation for tenant invitations
 */
export const insertTenantInvitationSchema = createInsertSchema(tenantInvitations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  token: true, // Generated automatically
  expiresAt: true, // Generated automatically
});

/**
 * Export types
 */
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = z.infer<typeof insertTenantUserSchema>;

export type TenantInvitation = typeof tenantInvitations.$inferSelect;
export type InsertTenantInvitation = z.infer<typeof insertTenantInvitationSchema>;