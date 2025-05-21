/**
 * Multi-tenant Table Schemas
 * 
 * This file contains tenant-scoped table definitions for the iREVA platform.
 * These tables include the tenantId discriminator field for data isolation.
 */

import { pgTable, uuid, text, boolean, timestamp, integer, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { tenantDiscriminator, tenantScopedTable } from './schema-tenant-scoped';
import { users } from './schema'; // Import existing user schema

// Tenant-scoped user profiles table
export const userProfiles = tenantScopedTable('user_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phoneNumber: text('phone_number'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  postalCode: text('postal_code'),
  country: text('country'),
  dateOfBirth: timestamp('date_of_birth'),
  profilePictureUrl: text('profile_picture_url'),
  preferences: json('preferences'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tenant-scoped properties table
export const properties = tenantScopedTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  propertyType: text('property_type').notNull(), // residential, commercial, mixed-use
  status: text('status').notNull().default('active'), // active, pending, sold, etc.
  purchasePrice: integer('purchase_price').notNull(),
  currentValue: integer('current_value'),
  rentalIncome: integer('rental_income'),
  expenses: integer('expenses'),
  imageUrls: text('image_urls').array(),
  latitude: text('latitude'),
  longitude: text('longitude'),
  squareFeet: integer('square_feet'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  yearBuilt: integer('year_built'),
  features: json('features'),
  documents: json('documents'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tenant-scoped investments table
export const investments = tenantScopedTable('investments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  propertyId: uuid('property_id').references(() => properties.id),
  amount: integer('amount').notNull(),
  shares: integer('shares'),
  status: text('status').notNull().default('pending'), // pending, active, completed, cancelled
  investmentDate: timestamp('investment_date').notNull().defaultNow(),
  maturityDate: timestamp('maturity_date'),
  expectedRoi: integer('expected_roi'),
  actualRoi: integer('actual_roi'),
  transactionId: text('transaction_id'),
  paymentMethod: text('payment_method'),
  documents: json('documents'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tenant-scoped wallets table
export const wallets = tenantScopedTable('wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  balance: integer('balance').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  isActive: boolean('is_active').notNull().default(true),
  lastUpdated: timestamp('last_updated').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Tenant-scoped transactions table
export const transactions = tenantScopedTable('transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  walletId: uuid('wallet_id').references(() => wallets.id),
  type: text('type').notNull(), // deposit, withdrawal, investment, roi_payment
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('pending'), // pending, completed, failed, refunded
  externalReferenceId: text('external_reference_id'),
  notes: text('notes'),
  metadata: json('metadata'),
  investmentId: uuid('investment_id').references(() => investments.id),
  propertyId: uuid('property_id').references(() => properties.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Tenant-scoped ROI payments table
export const roiPayments = tenantScopedTable('roi_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  investmentId: uuid('investment_id').notNull().references(() => investments.id),
  userId: integer('user_id').notNull().references(() => users.id),
  propertyId: uuid('property_id').references(() => properties.id),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  paymentDate: timestamp('payment_date').notNull(),
  paymentMethod: text('payment_method'),
  status: text('status').notNull().default('pending'), // pending, paid, failed
  transactionId: uuid('transaction_id').references(() => transactions.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Tenant-scoped project table
export const projects = tenantScopedTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'), // active, completed, cancelled, etc.
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  targetAmount: integer('target_amount'),
  raisedAmount: integer('raised_amount').default(0),
  minInvestment: integer('min_investment'),
  maxInvestment: integer('max_investment'),
  roi: integer('roi'),
  duration: integer('duration'), // in months
  propertyId: uuid('property_id').references(() => properties.id),
  documents: json('documents'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tenant-scoped notifications table
export const notifications = tenantScopedTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // system, investment, roi, kyc, wallet
  isRead: boolean('is_read').notNull().default(false),
  data: json('data'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Establish relations
export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  user: one(users, {
    fields: [investments.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [investments.propertyId],
    references: [properties.id],
  }),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
  investment: one(investments, {
    fields: [transactions.investmentId],
    references: [investments.id],
  }),
  property: one(properties, {
    fields: [transactions.propertyId],
    references: [properties.id],
  }),
}));

export const roiPaymentsRelations = relations(roiPayments, ({ one }) => ({
  investment: one(investments, {
    fields: [roiPayments.investmentId],
    references: [investments.id],
  }),
  user: one(users, {
    fields: [roiPayments.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [roiPayments.propertyId],
    references: [properties.id],
  }),
  transaction: one(transactions, {
    fields: [roiPayments.transactionId],
    references: [transactions.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  property: one(properties, {
    fields: [projects.propertyId],
    references: [properties.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Create insert schemas using drizzle-zod
export const insertUserProfileSchema = createInsertSchema(userProfiles, {
  preferences: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  tenantId: true, // Omit tenantId as it will be added by middleware
});

export const insertPropertySchema = createInsertSchema(properties, {
  imageUrls: z.array(z.string()).optional(),
  features: z.record(z.any()).optional(),
  documents: z.record(z.any()).optional(),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  tenantId: true, // Omit tenantId as it will be added by middleware
});

export const insertInvestmentSchema = createInsertSchema(investments, {
  documents: z.record(z.any()).optional(),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  tenantId: true, // Omit tenantId as it will be added by middleware
});

export const insertWalletSchema = createInsertSchema(wallets).omit({ 
  id: true, 
  createdAt: true,
  tenantId: true, // Omit tenantId as it will be added by middleware
});

export const insertTransactionSchema = createInsertSchema(transactions, {
  metadata: z.record(z.any()).optional(),
}).omit({ 
  id: true, 
  createdAt: true,
  tenantId: true, // Omit tenantId as it will be added by middleware
});

export const insertRoiPaymentSchema = createInsertSchema(roiPayments).omit({ 
  id: true, 
  createdAt: true,
  tenantId: true, // Omit tenantId as it will be added by middleware
});

export const insertProjectSchema = createInsertSchema(projects, {
  documents: z.record(z.any()).optional(),
}).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  tenantId: true, // Omit tenantId as it will be added by middleware
});

export const insertNotificationSchema = createInsertSchema(notifications, {
  data: z.record(z.any()).optional(),
}).omit({ 
  id: true, 
  createdAt: true,
  tenantId: true, // Omit tenantId as it will be added by middleware
});

// Export types
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type RoiPayment = typeof roiPayments.$inferSelect;
export type InsertRoiPayment = z.infer<typeof insertRoiPaymentSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;