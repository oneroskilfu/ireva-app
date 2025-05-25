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

// Users table with enhanced security  
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
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
  lastLoginAt: timestamp('last_login_at'),
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

// Refresh tokens table for secure token management
export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  userId: integer('user_id').references(() => users.id).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  revokedAt: timestamp('revoked_at'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent')
});

// Email verification tokens table
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  userId: integer('user_id').references(() => users.id).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  usedAt: timestamp('used_at')
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



// Sessions table
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 36 }).primaryKey(), // UUID
  userId: integer('user_id').notNull().references(() => users.id),
  fingerprint: varchar('fingerprint', { length: 255 }),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastActivity: timestamp('last_activity').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  deviceInfo: json('device_info').$type<{
    ipAddress?: string;
    userAgent?: string;
    os?: string;
    browser?: string;
  }>(),
});

// Audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 255 }),
  method: varchar('method', { length: 10 }),
  statusCode: integer('status_code'),
  requestBody: json('request_body'),
  responseTime: integer('response_time'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: varchar('user_agent', { length: 255 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  additionalInfo: json('additional_info'),
});

// Security settings
export const securitySettings = pgTable('security_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).unique(),
  mfaEnabled: boolean('mfa_enabled').default(false).notNull(),
  mfaSecret: varchar('mfa_secret', { length: 255 }),
  trustedDevices: json('trusted_devices').$type<{deviceId: string, name: string, lastUsed: string}[]>(),
  loginAttempts: integer('login_attempts').default(0).notNull(),
  lastFailedLogin: timestamp('last_failed_login'),
  passwordChangedAt: timestamp('password_changed_at'),
  securityQuestions: json('security_questions').$type<{question: string, answer: string}[]>(),
  accountLocked: boolean('account_locked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_date').defaultNow().notNull(),
});

// User consents table for Terms of Service and Privacy Policy
export const userConsents = pgTable('user_consents', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  consentType: varchar('consent_type', { length: 50 }).notNull(), // 'terms', 'privacy', 'marketing'
  version: varchar('version', { length: 20 }).notNull(),
  accepted: boolean('accepted').notNull(),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: varchar('user_agent', { length: 255 }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
  userConsentIdx: uniqueIndex('user_consent_idx').on(table.userId, table.consentType, table.version),
}));

// Stripe payments table
export const stripePayments = pgTable('stripe_payments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  amount: numeric('amount').notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // succeeded, failed, pending, canceled
  paymentType: varchar('payment_type', { length: 20 }).notNull(), // deposit, withdrawal, investment
  transactionId: integer('transaction_id').references(() => transactions.id),
  investmentId: integer('investment_id').references(() => investments.id),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Firebase Cloud Messaging tokens
export const fcmTokens = pgTable('fcm_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  token: varchar('token', { length: 255 }).notNull(),
  deviceType: varchar('device_type', { length: 20 }).notNull(), // ios, android, web
  deviceId: varchar('device_id', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  lastUsed: timestamp('last_used').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userTokenIdx: uniqueIndex('user_token_idx').on(table.userId, table.token),
}));

// Plugin registry and tenant configuration
export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }).unique(),
  logo: varchar('logo', { length: 255 }),
  config: json('config').$type<{
    theme: {
      primaryColor: string;
      secondaryColor: string;
      logoUrl?: string;
    };
    features: {
      multiCurrency: boolean;
      aiAnalytics: boolean;
      advancedReporting: boolean;
      customBranding: boolean;
    };
    limits: {
      maxUsers: number;
      maxProperties: number;
      storageLimit: number; // in MB
    };
  }>(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const plugins = pgTable('plugins', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  version: varchar('version', { length: 20 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(), // 'investment', 'analytics', 'payment', 'notification'
  entryPoint: varchar('entry_point', { length: 255 }).notNull(), // JS module path
  dependencies: json('dependencies').$type<string[]>().default([]),
  config: json('config').$type<{
    permissions: string[];
    routes: string[];
    components: string[];
    hooks: string[];
    apis: string[];
  }>(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tenantPlugins = pgTable('tenant_plugins', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  pluginId: integer('plugin_id').notNull().references(() => plugins.id),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  config: json('config'), // Plugin-specific configuration for this tenant
  enabledAt: timestamp('enabled_at').defaultNow().notNull(),
  enabledBy: integer('enabled_by').references(() => users.id),
}, (table) => ({
  tenantPluginIdx: uniqueIndex('tenant_plugin_idx').on(table.tenantId, table.pluginId),
}));

// Update users table to include tenantId for multi-tenancy
// Note: This would require a migration to add tenantId to existing users table

// Investment module configurations
export const investmentModules = pgTable('investment_modules', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'reit', 'crowdfunding', 'private_equity', 'crypto'
  description: text('description'),
  minInvestment: numeric('min_investment').notNull(),
  maxInvestment: numeric('max_investment'),
  expectedROI: numeric('expected_roi'),
  riskLevel: varchar('risk_level', { length: 20 }).notNull(), // 'low', 'medium', 'high'
  duration: integer('duration'), // in months
  features: json('features').$type<{
    autoReinvest: boolean;
    partialLiquidation: boolean;
    dividendReinvestment: boolean;
    fractionalOwnership: boolean;
  }>(),
  fees: json('fees').$type<{
    managementFee: number; // percentage
    performanceFee: number; // percentage
    exitFee: number; // percentage
  }>(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tenantInvestmentModules = pgTable('tenant_investment_modules', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').notNull().references(() => tenants.id),
  moduleId: integer('module_id').notNull().references(() => investmentModules.id),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  customConfig: json('custom_config'), // Tenant-specific overrides
  enabledAt: timestamp('enabled_at').defaultNow().notNull(),
}, (table) => ({
  tenantModuleIdx: uniqueIndex('tenant_module_idx').on(table.tenantId, table.moduleId),
}));

// Zod schemas for new tables
export const insertUserConsentSchema = createInsertSchema(userConsents).omit({ 
  id: true, 
  timestamp: true 
});

export const insertStripePaymentSchema = createInsertSchema(stripePayments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertFcmTokenSchema = createInsertSchema(fcmTokens).omit({ 
  id: true, 
  createdAt: true, 
  lastUsed: true 
});

export const insertTenantSchema = createInsertSchema(tenants).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertPluginSchema = createInsertSchema(plugins).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTenantPluginSchema = createInsertSchema(tenantPlugins).omit({ 
  id: true, 
  enabledAt: true 
});

export const insertInvestmentModuleSchema = createInsertSchema(investmentModules).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// Relations are already defined above

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
export type Session = typeof sessions.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type SecuritySetting = typeof securitySettings.$inferSelect;
export type UserConsent = typeof userConsents.$inferSelect;
export type InsertUserConsent = z.infer<typeof insertUserConsentSchema>;
export type StripePayment = typeof stripePayments.$inferSelect;
export type InsertStripePayment = z.infer<typeof insertStripePaymentSchema>;
export type FcmToken = typeof fcmTokens.$inferSelect;
export type InsertFcmToken = z.infer<typeof insertFcmTokenSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Plugin = typeof plugins.$inferSelect;
export type InsertPlugin = z.infer<typeof insertPluginSchema>;
export type TenantPlugin = typeof tenantPlugins.$inferSelect;
export type InsertTenantPlugin = z.infer<typeof insertTenantPluginSchema>;
export type InvestmentModule = typeof investmentModules.$inferSelect;
export type InsertInvestmentModule = z.infer<typeof insertInvestmentModuleSchema>;