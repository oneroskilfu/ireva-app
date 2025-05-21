/**
 * Tenants Schema
 * 
 * This file defines the database schema for tenant organizations.
 * Each tenant is a separate organization with its own users, properties, and data.
 */

import { pgTable, uuid, varchar, timestamp, text, boolean, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Base tenants table
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  logo: varchar('logo', { length: 255 }),
  website: varchar('website', { length: 255 }),
  industry: varchar('industry', { length: 100 }),
  size: varchar('size', { length: 50 }),
  address: varchar('address', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  country: varchar('country', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  taxId: varchar('tax_id', { length: 50 }),
  isActive: boolean('is_active').notNull().default(true),
  verificationStatus: varchar('verification_status', { length: 20 }).notNull().default('pending'),
  verifiedAt: timestamp('verified_at'),
  settings: json('settings').$type<Record<string, any>>().default({}),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Schema for inserting a new tenant
export const insertTenantSchema = createInsertSchema(tenants, {
  name: z.string().min(3, "Organization name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verifiedAt: true,
  verificationStatus: true,
  isActive: true
});

// Export types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;