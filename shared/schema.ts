import { relations, sql } from 'drizzle-orm';
import { 
  integer, 
  pgTable, 
  serial, 
  text, 
  varchar, 
  timestamp, 
  boolean,
  numeric,
  uuid,
  foreignKey,
  uniqueIndex,
  primaryKey,
  json
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('investor'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isVerified: boolean('is_verified').default(false),
  profileImage: varchar('profile_image', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  kycStatus: varchar('kyc_status', { length: 20 }).default('pending'),
  dateOfBirth: timestamp('date_of_birth'),
  preferences: json('preferences').$type<{
    notifications: {
      email: boolean;
      sms: boolean;
      inApp: boolean;
    };
    investmentPreferences: string[];
    theme: 'light' | 'dark' | 'system';
  }>()
});

// Properties table
export const properties = pgTable('properties', {
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

// Investments table
export const investments = pgTable('investments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  amount: numeric('amount').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  paymentId: varchar('payment_id', { length: 100 }),
  contractId: varchar('contract_id', { length: 100 }),
  sharesCount: numeric('shares_count'),
  investmentDate: timestamp('investment_date').defaultNow().notNull(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  investmentId: integer('investment_id').references(() => investments.id),
  type: varchar('type', { length: 20 }).notNull(), // deposit, withdrawal, dividend, investment
  amount: numeric('amount').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  description: text('description'),
  reference: varchar('reference', { length: 100 }),
});

// KYC table
export const kyc = pgTable('kyc', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id).unique(),
  documentType: varchar('document_type', { length: 50 }).notNull(),
  documentNumber: varchar('document_number', { length: 100 }).notNull(),
  documentFront: varchar('document_front', { length: 255 }).notNull(),
  documentBack: varchar('document_back', { length: 255 }),
  selfieImage: varchar('selfie_image', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewDate: timestamp('review_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 100 }).notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  link: varchar('link', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Documents table
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  propertyId: integer('property_id').references(() => properties.id),
  investmentId: integer('investment_id').references(() => investments.id),
  title: varchar('title', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  isPrivate: boolean('is_private').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Property updates/news
export const propertyUpdates = pgTable('property_updates', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  title: varchar('title', { length: 100 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: integer('created_by').references(() => users.id),
  images: json('images').$type<string[]>().default([]),
});

// ROI payments/dividends
export const roiPayments = pgTable('roi_payments', {
  id: serial('id').primaryKey(),
  investmentId: integer('investment_id').notNull().references(() => investments.id),
  userId: integer('user_id').notNull().references(() => users.id),
  propertyId: integer('property_id').notNull().references(() => properties.id),
  amount: numeric('amount').notNull(),
  paymentDate: timestamp('payment_date').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  transactionId: integer('transaction_id').references(() => transactions.id),
  notes: text('notes'),
});

// Wallet table
export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id).unique(),
  balance: numeric('balance').notNull().default('0'),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// Relation definitions
export const usersRelations = relations(users, ({ many, one }) => ({
  investments: many(investments),
  transactions: many(transactions),
  kyc: one(kyc),
  notifications: many(notifications),
  documents: many(documents),
  wallet: one(wallets),
}));

export const propertiesRelations = relations(properties, ({ many }) => ({
  investments: many(investments),
  documents: many(documents),
  updates: many(propertyUpdates),
}));

export const investmentsRelations = relations(investments, ({ one, many }) => ({
  user: one(users, {
    fields: [investments.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [investments.propertyId],
    references: [properties.id],
  }),
  transactions: many(transactions),
  roiPayments: many(roiPayments),
  documents: many(documents),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(50),
  name: z.string().min(2).max(100),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertPropertySchema = createInsertSchema(properties).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  fundingProgress: true
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true
});

export const insertKycSchema = createInsertSchema(kyc).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true,
  reviewedBy: true,
  reviewDate: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type KYC = typeof kyc.$inferSelect;
export type InsertKYC = z.infer<typeof insertKycSchema>;

export type Notification = typeof notifications.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type PropertyUpdate = typeof propertyUpdates.$inferSelect;
export type ROIPayment = typeof roiPayments.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;