/**
 * Tenant-Scoped Tables Schema
 * 
 * This file defines the database schema for tenant-scoped tables.
 * All tables defined here have an automatic tenantId column
 * that ensures complete data isolation between organizations.
 */

import { integer, json, numeric, pgTable, serial, text, timestamp, uuid, varchar, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { tenantTable } from './schema-tenant-scoped';
import { tenants } from './schema-tenants';
import { users } from './schema';
import { z } from 'zod';

// List of tenant-scoped table names for automatic filtering
export const tenantTables = [
  'tenant_properties',
  'tenant_investments',
  'tenant_transactions',
  'tenant_documents',
  'tenant_property_updates',
  'tenant_roi_payments',
];

// =================== Tenant Properties ===================
export const tenantProperties = tenantTable('tenant_properties', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  propertyType: varchar('property_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  price: numeric('price').notNull(),
  size: numeric('size').notNull(),
  roi: numeric('roi').notNull(),
  fundingGoal: numeric('funding_goal').notNull(),
  fundingProgress: numeric('funding_progress').notNull().default('0'),
  minInvestment: numeric('min_investment').notNull(),
  maxInvestment: numeric('max_investment'),
  duration: integer('duration').notNull(),
  images: json('images').$type<string[]>().default([]),
  features: json('features').$type<string[]>().default([]),
  documents: json('documents').$type<string[]>().default([]),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  latitude: numeric('latitude'),
  longitude: numeric('longitude'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertTenantPropertySchema = createInsertSchema(tenantProperties, {
  description: z.string().min(10, "Description must be at least 10 characters"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  propertyType: z.string().min(3, "Property type must be at least 3 characters"),
  price: z.number().positive("Price must be positive"),
  size: z.number().positive("Size must be positive"),
  roi: z.number().positive("ROI must be positive"),
  fundingGoal: z.number().positive("Funding goal must be positive"),
  minInvestment: z.number().positive("Minimum investment must be positive"),
}).omit({ 
  id: true, 
  tenantId: true,
  createdAt: true,
  updatedAt: true
});

export type TenantProperty = typeof tenantProperties.$inferSelect;
export type InsertTenantProperty = z.infer<typeof insertTenantPropertySchema>;

// =================== Tenant Investments ===================
export const tenantInvestments = tenantTable('tenant_investments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  propertyId: integer('property_id').notNull().references(() => tenantProperties.id),
  amount: numeric('amount').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  paymentId: varchar('payment_id', { length: 100 }),
  contractId: varchar('contract_id', { length: 100 }),
  sharesCount: numeric('shares_count'),
  investmentDate: timestamp('investment_date').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertTenantInvestmentSchema = createInsertSchema(tenantInvestments, {
  amount: z.number().positive("Amount must be positive"),
  userId: z.number().int().positive(),
  propertyId: z.number().int().positive(),
}).omit({
  id: true,
  tenantId: true,
  investmentDate: true,
  createdAt: true,
  updatedAt: true
});

export type TenantInvestment = typeof tenantInvestments.$inferSelect;
export type InsertTenantInvestment = z.infer<typeof insertTenantInvestmentSchema>;

// =================== Tenant Transactions ===================
export const tenantTransactions = tenantTable('tenant_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  investmentId: integer('investment_id').references(() => tenantInvestments.id),
  type: varchar('type', { length: 20 }).notNull(),
  amount: numeric('amount').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  description: text('description'),
  reference: varchar('reference', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const insertTenantTransactionSchema = createInsertSchema(tenantTransactions, {
  userId: z.number().int().positive(),
  type: z.string(),
  amount: z.number(),
}).omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true
});

export type TenantTransaction = typeof tenantTransactions.$inferSelect;
export type InsertTenantTransaction = z.infer<typeof insertTenantTransactionSchema>;

// =================== Tenant Documents ===================
export const tenantDocuments = tenantTable('tenant_documents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  propertyId: integer('property_id').references(() => tenantProperties.id),
  investmentId: integer('investment_id').references(() => tenantInvestments.id),
  title: varchar('title', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  isPrivate: boolean('is_private').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type TenantDocument = typeof tenantDocuments.$inferSelect;

// =================== Tenant Property Updates ===================
export const tenantPropertyUpdates = tenantTable('tenant_property_updates', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').notNull().references(() => tenantProperties.id),
  title: varchar('title', { length: 100 }).notNull(),
  content: text('content').notNull(),
  createdBy: integer('created_by').references(() => users.id),
  images: json('images').$type<string[]>().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type TenantPropertyUpdate = typeof tenantPropertyUpdates.$inferSelect;

// =================== Tenant ROI Payments ===================
export const tenantRoiPayments = tenantTable('tenant_roi_payments', {
  id: serial('id').primaryKey(),
  investmentId: integer('investment_id').notNull().references(() => tenantInvestments.id),
  userId: integer('user_id').notNull().references(() => users.id),
  propertyId: integer('property_id').notNull().references(() => tenantProperties.id),
  amount: numeric('amount').notNull(),
  paymentDate: timestamp('payment_date').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  transactionId: integer('transaction_id').references(() => tenantTransactions.id),
  notes: text('notes'),
});

export type TenantRoiPayment = typeof tenantRoiPayments.$inferSelect;

// =================== Tenant Users ===================
export const tenantUsers = pgTable('tenant_users', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  isOwner: boolean('is_owner').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  lastActiveAt: timestamp('last_active_at'),
  metadata: json('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type TenantUser = typeof tenantUsers.$inferSelect;
export type InsertTenantUser = typeof tenantUsers.$inferInsert;

// =================== Tenant Invitations ===================
export const tenantInvitations = pgTable('tenant_invitations', {
  id: serial('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('user'),
  token: varchar('token', { length: 100 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdByUserId: integer('created_by_user_id').references(() => users.id),
  acceptedByUserId: integer('accepted_by_user_id').references(() => users.id),
  acceptedAt: timestamp('accepted_at'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type TenantInvitation = typeof tenantInvitations.$inferSelect;
export type InsertTenantInvitation = typeof tenantInvitations.$inferInsert;