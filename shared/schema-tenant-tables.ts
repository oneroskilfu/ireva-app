/**
 * Tenant-Scoped Tables
 * 
 * This file defines tenant-scoped versions of our existing tables
 * for complete data isolation between tenants.
 */

import { 
  integer, 
  text, 
  varchar, 
  timestamp, 
  boolean,
  numeric,
  json,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';
import { tenantTable, TenantScoped } from './schema-tenant-scoped';
import { users } from './schema';
import { tenants } from './schema-tenants';

/**
 * Tenant-scoped Properties table
 */
export const tenantProperties = tenantTable('tenant_properties', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  propertyType: varchar('property_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  price: numeric('price').notNull(),
  size: numeric('size').notNull(),
  roi: numeric('roi').notNull(),
  fundingGoal: numeric('funding_goal').notNull(),
  fundingProgress: numeric('funding_progress').default('0').notNull(),
  minInvestment: numeric('min_investment').notNull(),
  maxInvestment: numeric('max_investment'),
  duration: integer('duration').notNull(), // in months
  images: json('images').$type<string[]>().default([]),
  features: json('features').$type<string[]>().default([]),
  documents: json('documents').$type<{name: string, url: string}[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  latitude: numeric('latitude'),
  longitude: numeric('longitude'),
  isActive: boolean('is_active').default(true).notNull(),
});

/**
 * Tenant-scoped Investments table
 */
export const tenantInvestments = tenantTable('tenant_investments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  propertyId: integer('property_id').notNull().references(() => tenantProperties.id),
  amount: numeric('amount').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  paymentId: varchar('payment_id', { length: 100 }),
  contractId: varchar('contract_id', { length: 100 }),
  sharesCount: numeric('shares_count'),
  investmentDate: timestamp('investment_date').defaultNow().notNull(),
});

/**
 * Tenant-scoped Transactions table
 */
export const tenantTransactions = tenantTable('tenant_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  investmentId: integer('investment_id').references(() => tenantInvestments.id),
  type: varchar('type', { length: 20 }).notNull(), // deposit, withdrawal, dividend, investment
  amount: numeric('amount').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  description: text('description'),
  reference: varchar('reference', { length: 100 }),
});

/**
 * Tenant-scoped Documents table
 */
export const tenantDocuments = tenantTable('tenant_documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  propertyId: integer('property_id').references(() => tenantProperties.id),
  investmentId: integer('investment_id').references(() => tenantInvestments.id),
  title: varchar('title', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  isPrivate: boolean('is_private').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Tenant-scoped Property Updates table
 */
export const tenantPropertyUpdates = tenantTable('tenant_property_updates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  propertyId: integer('property_id').notNull().references(() => tenantProperties.id),
  title: varchar('title', { length: 100 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id),
  images: json('images').$type<string[]>().default([]),
});

/**
 * Tenant-scoped ROI Payments table
 */
export const tenantRoiPayments = tenantTable('tenant_roi_payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  investmentId: integer('investment_id').notNull().references(() => tenantInvestments.id),
  userId: integer('user_id').notNull().references(() => users.id),
  propertyId: integer('property_id').notNull().references(() => tenantProperties.id),
  amount: numeric('amount').notNull(),
  paymentDate: timestamp('payment_date').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  transactionId: integer('transaction_id').references(() => tenantTransactions.id),
  notes: text('notes'),
});

/**
 * Relations
 */
export const tenantPropertiesRelations = relations(tenantProperties, ({ many, one }) => ({
  tenant: one(tenants, {
    fields: [tenantProperties.tenantId],
    references: [tenants.id],
  }),
  investments: many(tenantInvestments),
  documents: many(tenantDocuments),
  updates: many(tenantPropertyUpdates),
}));

export const tenantInvestmentsRelations = relations(tenantInvestments, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [tenantInvestments.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantInvestments.userId],
    references: [users.id],
  }),
  property: one(tenantProperties, {
    fields: [tenantInvestments.propertyId],
    references: [tenantProperties.id],
  }),
  transactions: many(tenantTransactions),
  roiPayments: many(tenantRoiPayments),
  documents: many(tenantDocuments),
}));

/**
 * Schemas for validation
 */
export const insertTenantPropertySchema = createInsertSchema(tenantProperties, {
  name: z.string().min(3).max(100),
  description: z.string().min(10),
  location: z.string().min(3).max(255),
  propertyType: z.string().min(2).max(50),
  price: z.coerce.number().positive(),
  size: z.coerce.number().positive(),
  roi: z.coerce.number().positive(),
  fundingGoal: z.coerce.number().positive(),
  minInvestment: z.coerce.number().positive(),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  fundingProgress: true,
  tenantId: true
});

export const insertTenantInvestmentSchema = createInsertSchema(tenantInvestments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true,
  tenantId: true
});

export const insertTenantTransactionSchema = createInsertSchema(tenantTransactions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  tenantId: true
});

/**
 * Types
 */
export type TenantProperty = TenantScoped<typeof tenantProperties.$inferSelect>;
export type InsertTenantProperty = z.infer<typeof insertTenantPropertySchema>;

export type TenantInvestment = TenantScoped<typeof tenantInvestments.$inferSelect>;
export type InsertTenantInvestment = z.infer<typeof insertTenantInvestmentSchema>;

export type TenantTransaction = TenantScoped<typeof tenantTransactions.$inferSelect>;
export type InsertTenantTransaction = z.infer<typeof insertTenantTransactionSchema>;

export type TenantDocument = TenantScoped<typeof tenantDocuments.$inferSelect>;
export type TenantPropertyUpdate = TenantScoped<typeof tenantPropertyUpdates.$inferSelect>;
export type TenantRoiPayment = TenantScoped<typeof tenantRoiPayments.$inferSelect>;