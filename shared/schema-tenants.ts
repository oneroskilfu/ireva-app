import { pgTable, text, boolean, timestamp, integer, json, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { users } from './schema';

/**
 * Multi-Tenant Architecture Schema
 * 
 * Core tables and relationships for implementing multi-tenancy in iREVA,
 * allowing for multiple client companies or project creators to use the platform
 * with proper data isolation.
 */

// Tenant Status Enum
export const TenantStatusEnum = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  ONBOARDING: 'onboarding',
  ARCHIVED: 'archived',
} as const;

// Tenant Tier Enum
export const TenantTierEnum = {
  BASIC: 'basic',      // Limited features and properties
  STANDARD: 'standard', // Standard feature set
  PREMIUM: 'premium',   // Full feature access
  ENTERPRISE: 'enterprise', // Custom features and dedicated support
} as const;

// Tenants Table - Master table of organizations/companies using the platform
export const tenants = pgTable('tenants', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // URL-friendly identifier
  domain: text('domain').unique(), // Custom domain for white-label access
  status: text('status').$type<keyof typeof TenantStatusEnum>().notNull().default(TenantStatusEnum.ACTIVE),
  tier: text('tier').$type<keyof typeof TenantTierEnum>().notNull().default(TenantTierEnum.STANDARD),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color'),
  secondaryColor: text('secondary_color'),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  address: text('address'),
  maxUsers: integer('max_users'),
  maxProperties: integer('max_properties'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  settings: json('settings'), // JSON blob for tenant-specific settings
  metadata: json('metadata'), // Additional metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => {
  return {
    slugIdx: uniqueIndex('tenant_slug_idx').on(table.slug),
    domainIdx: uniqueIndex('tenant_domain_idx').on(table.domain),
  };
});

// Tenant Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  tenantUsers: many(tenantUsers),
  tenantProperties: many(tenantProperties),
}));

// Tenant Users (Junction table between users and tenants)
export const tenantUsers = pgTable('tenant_users', {
  id: integer('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('user'), // Role within this tenant: admin, manager, user, etc.
  isDefault: boolean('is_default').notNull().default(false), // Is this the user's default tenant
  permissions: json('permissions'), // Tenant-specific permissions
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    // Ensure each user is only connected to each tenant once
    uniqueUserTenant: uniqueIndex('unique_user_tenant_idx').on(table.userId, table.tenantId),
  };
});

// Tenant Users Relations
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

// Tenant Properties (Properties managed by specific tenants)
export const tenantProperties = pgTable('tenant_properties', {
  id: integer('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  propertyId: integer('property_id').notNull(), // References properties table
  isActive: boolean('is_active').notNull().default(true),
  customSettings: json('custom_settings'), // Tenant-specific property settings
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    // Ensure each property is only connected to each tenant once
    uniqueTenantProperty: uniqueIndex('unique_tenant_property_idx').on(table.tenantId, table.propertyId),
  };
});

// Tenant Invitations (For inviting users to a tenant)
export const tenantInvitations = pgTable('tenant_invitations', {
  id: integer('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull().default('user'),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => {
  return {
    // Ensure each email only has one active invitation per tenant
    uniqueEmailTenant: uniqueIndex('unique_email_tenant_idx').on(table.email, table.tenantId),
    tokenIdx: uniqueIndex('token_idx').on(table.token),
  };
});

// Tenant Subscription Plans
export const tenantSubscriptionPlans = pgTable('tenant_subscription_plans', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  tier: text('tier').$type<keyof typeof TenantTierEnum>().notNull(),
  price: integer('price').notNull(), // Stored in cents
  billingCycle: text('billing_cycle').notNull().default('monthly'), // monthly, annual, etc.
  features: json('features').notNull(), // JSON array of included features
  maxUsers: integer('max_users').notNull(),
  maxProperties: integer('max_properties').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tenant Subscriptions
export const tenantSubscriptions = pgTable('tenant_subscriptions', {
  id: integer('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  planId: integer('plan_id').notNull().references(() => tenantSubscriptionPlans.id),
  status: text('status').notNull().default('active'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  renewalDate: timestamp('renewal_date'),
  cancelledAt: timestamp('cancelled_at'),
  paymentMethod: text('payment_method'),
  paymentDetails: json('payment_details'),
  lastBilledAt: timestamp('last_billed_at'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Insert schemas using drizzle-zod
export const insertTenantSchema = createInsertSchema(tenants, {
  settings: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertTenantUserSchema = createInsertSchema(tenantUsers, {
  permissions: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true });

export const insertTenantPropertySchema = createInsertSchema(tenantProperties, {
  customSettings: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true });

export const insertTenantInvitationSchema = createInsertSchema(tenantInvitations).omit({
  id: true, createdAt: true, acceptedAt: true
});

export const insertTenantSubscriptionPlanSchema = createInsertSchema(tenantSubscriptionPlans, {
  features: z.array(z.string()).or(z.record(z.any())),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertTenantSubscriptionSchema = createInsertSchema(tenantSubscriptions, {
  paymentDetails: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

// Export types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = z.infer<typeof insertTenantUserSchema>;

export type TenantProperty = typeof tenantProperties.$inferSelect;
export type InsertTenantProperty = z.infer<typeof insertTenantPropertySchema>;

export type TenantInvitation = typeof tenantInvitations.$inferSelect;
export type InsertTenantInvitation = z.infer<typeof insertTenantInvitationSchema>;

export type TenantSubscriptionPlan = typeof tenantSubscriptionPlans.$inferSelect;
export type InsertTenantSubscriptionPlan = z.infer<typeof insertTenantSubscriptionPlanSchema>;

export type TenantSubscription = typeof tenantSubscriptions.$inferSelect;
export type InsertTenantSubscription = z.infer<typeof insertTenantSubscriptionSchema>;