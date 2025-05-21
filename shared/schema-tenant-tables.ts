/**
 * Tenant-Scoped Tables
 * 
 * This file contains common tenant-scoped table definitions for the iREVA platform.
 * These tables automatically include tenant isolation.
 */

import { pgTable, uuid, text, integer, timestamp, boolean, json } from 'drizzle-orm/pg-core';
import { tenants } from './schema-tenants';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Create tenant-scoped tables directly with pgTable for better type safety
// This avoids TypeScript errors with the helper function approach

/**
 * Properties - Real estate properties available for investment
 */
export const properties = tenantScopedTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull().default('US'),
  propertyType: text('property_type').notNull(),
  status: text('status').notNull().default('active'),
  purchasePrice: integer('purchase_price').notNull(),
  currentValue: integer('current_value'),
  rentalIncome: integer('rental_income'),
  expenses: integer('expenses'),
  imageUrls: text('image_urls').array(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Projects - Investment opportunities that may be tied to properties
 */
export const projects = tenantScopedTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  targetAmount: integer('target_amount'),
  raisedAmount: integer('raised_amount').default(0),
  minInvestment: integer('min_investment'),
  maxInvestment: integer('max_investment'),
  roi: integer('roi'),
  duration: integer('duration'),
  propertyId: uuid('property_id').references(() => properties.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Investments - User investments in projects or properties
 */
export const investments = tenantScopedTable('investments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull(),
  projectId: uuid('project_id').references(() => projects.id),
  propertyId: uuid('property_id').references(() => properties.id),
  amount: integer('amount').notNull(),
  status: text('status').notNull().default('pending'),
  investmentDate: timestamp('investment_date').notNull().defaultNow(),
  maturityDate: timestamp('maturity_date'),
  expectedRoi: integer('expected_roi'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Notifications - User notifications with tenant isolation
 */
export const notifications = tenantScopedTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  data: json('data'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Define relations between tables
export const propertiesRelations = relations(properties, ({ many, one }) => ({
  projects: many(projects),
  investments: many(investments),
  tenant: one(tenants, {
    fields: [properties.tenantId],
    references: [tenants.id]
  })
}));

export const projectsRelations = relations(projects, ({ many, one }) => ({
  property: one(properties, {
    fields: [projects.propertyId],
    references: [properties.id]
  }),
  investments: many(investments),
  tenant: one(tenants, {
    fields: [projects.tenantId],
    references: [tenants.id]
  })
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  project: one(projects, {
    fields: [investments.projectId],
    references: [projects.id]
  }),
  property: one(properties, {
    fields: [investments.propertyId],
    references: [properties.id]
  }),
  tenant: one(tenants, {
    fields: [investments.tenantId],
    references: [tenants.id]
  })
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  tenant: one(tenants, {
    fields: [notifications.tenantId],
    references: [tenants.id]
  })
}));

// Define insert schemas
export const insertPropertySchema = createInsertSchema(properties)
  .omit({ id: true, tenantId: true, createdAt: true, updatedAt: true });

export const insertProjectSchema = createInsertSchema(projects)
  .omit({ id: true, tenantId: true, createdAt: true, updatedAt: true });

export const insertInvestmentSchema = createInsertSchema(investments)
  .omit({ id: true, tenantId: true, createdAt: true, updatedAt: true });

export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ id: true, tenantId: true, createdAt: true });

// Export types
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;