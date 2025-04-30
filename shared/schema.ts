import { pgTable, text, uuid, boolean, timestamp, numeric, integer, pgEnum, jsonb, serial, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Define all the enums that are needed in admin-routes.ts
export const userRoleEnum = pgEnum("user_role", ["investor", "admin", "super_admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "inactive", "suspended", "deactivated"]);
export const kycStatusEnum = pgEnum("kyc_status", ["not_started", "pending", "approved", "rejected"]);
export const kycTierEnum = pgEnum("kyc_tier", ["basic", "enhanced", "institutional"]);
export const propertyTypeEnum = pgEnum("property_type", ["residential", "commercial", "industrial", "mixed_use", "land"]);
export const investmentTierEnum = pgEnum("investment_tier", ["starter", "growth", "premium", "elite"]);
export const investmentStatusEnum = pgEnum("investment_status", ["active", "matured", "withdrawn", "defaulted", "completed", "refunded", "cancelled"]);
export const accreditationLevelEnum = pgEnum("accreditation_level", ["non_accredited", "accredited", "qualified_purchaser"]);
export const paymentMethodEnum = pgEnum("payment_method", ["wallet", "card", "bank_transfer", "crypto"]);
export const cryptoNetworkEnum = pgEnum("crypto_network", ["ethereum", "binance", "polygon", "solana", "avalanche"]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "approved", "rejected", "processed", "failed"]);
export const auditActionEnum = pgEnum("audit_action", [
  "USER_UPDATE", 
  "TRANSACTION_APPROVE", 
  "PAYOUT_TRIGGER", 
  "KYC_VERIFY", 
  "PROPERTY_CREATE", 
  "PROPERTY_UPDATE", 
  "INVESTMENT_APPROVE",
  "WITHDRAWAL_APPROVE",
  "SECURITY_UPDATE",
  "SETTINGS_UPDATE"
]);

// Property valuation methodology enum
export const valuationMethodologyEnum = pgEnum("valuation_methodology", ["comps", "income", "cost"]);

// Property valuation source enum
export const valuationSourceEnum = pgEnum("valuation_source", ["internal", "third-party", "zillow", "moodys"]);

// Secondary listing status enum
export const secondaryListingStatusEnum = pgEnum("secondary_listing_status", ["pending", "active", "sold", "expired", "cancelled"]);

// User schema
export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").default("investor"),
  status: userStatusEnum("status").default("active"),
  phoneNumber: text("phone_number"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  kycStatus: kycStatusEnum("kyc_status").default("not_started"),
  kycTier: kycTierEnum("kyc_tier").default("basic"),
  kycDocuments: jsonb("kyc_documents"),
  kycSubmittedAt: timestamp("kyc_submitted_at"),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  kycRejectionReason: text("kyc_rejection_reason"),
  isPhoneVerified: boolean("is_phone_verified"),
  accreditationLevel: accreditationLevelEnum("accreditation_level"),
  accreditationDocuments: jsonb("accreditation_documents"),
  accreditationVerifiedAt: timestamp("accreditation_verified_at"),
  investmentPreferences: jsonb("investment_preferences"),
  totalInvested: integer("total_invested"),
  totalEarnings: integer("total_earnings"),
  rewardsPoints: integer("rewards_points"),
  badges: jsonb("badges"),
  referredBy: integer("referred_by"),
  referralCode: text("referral_code").unique(),
  referralBonus: integer("referral_bonus"),
  referrals: jsonb("referrals"),
  referralRewards: integer("referral_rewards").default(0),
  notificationPreferences: jsonb("notification_preferences"),
  directMessageEnabled: boolean("direct_message_enabled"),
  lastLoginAt: timestamp("last_login_at"),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at")
});

// KYC Submissions schema
export const kycSubmissions = pgTable("kyc_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentType: text("document_type"),
  documentNumber: text("document_number"),
  documentUrl: text("document_url"),
  selfieUrl: text("selfie_url"),
  status: text("status").default("pending"), // pending, approved, rejected
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at")
});

// Properties schema (renamed to match database)
export const properties = pgTable("properties", {
  id: integer("id").primaryKey(),
  name: text("name"),
  location: text("location"),
  description: text("description"),
  type: propertyTypeEnum("type"),
  imageUrl: text("image_url"),
  imageGallery: jsonb("image_gallery"),
  videoUrl: text("video_url"),
  developer: text("developer"),
  developerProfile: text("developer_profile"),
  riskLevel: text("risk_level"),
  riskRating: integer("risk_rating"),
  targetReturn: numeric("target_return"),
  minimumInvestment: integer("minimum_investment"),
  term: integer("term"),
  totalFunding: integer("total_funding"),
  currentFunding: integer("current_funding"),
  numberOfInvestors: integer("number_of_investors"),
  daysLeft: integer("days_left"),
  size: text("size"),
  builtYear: text("built_year"),
  occupancy: text("occupancy"),
  cashFlow: text("cash_flow"),
  amenities: jsonb("amenities"),
  projectedCashflow: jsonb("projected_cashflow"),
  documents: jsonb("documents"),
  constructionUpdates: jsonb("construction_updates"),
  sustainabilityFeatures: jsonb("sustainability_features"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  accreditedOnly: boolean("accredited_only"),
  tier: investmentTierEnum("tier"),
  requiredKycTier: kycTierEnum("required_kyc_tier").default("basic"),
  completionDate: timestamp("completion_date")
});

// Investments schema
export const investments = pgTable("investments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  status: investmentStatusEnum("status").notNull().default("active"),
  projectedROI: numeric("projected_roi", { precision: 5, scale: 2 }).notNull(),
  actualROI: numeric("actual_roi", { precision: 5, scale: 2 }),
  investedAt: timestamp("invested_at").notNull().defaultNow(),
  maturityDate: timestamp("maturity_date"),
  withdrawnAt: timestamp("withdrawn_at")
});

// Wallet types enum
export const walletTypeEnum = pgEnum("wallet_type", ["main", "escrow", "investment", "rewards"]);

// Wallets schema
export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  type: walletTypeEnum("type").default("main"),
  balance: numeric("balance", { precision: 12, scale: 2 }).default("0"),
  availableBalance: numeric("available_balance", { precision: 12, scale: 2 }).default("0"),
  pendingDeposits: numeric("pending_deposits", { precision: 12, scale: 2 }).default("0"),
  pendingWithdrawals: numeric("pending_withdrawals", { precision: 12, scale: 2 }).default("0"),
  baseCurrency: text("base_currency").default("USD"),
  fxRates: jsonb("fx_rates").$type<Record<string, number>>(),
  conversionHistory: jsonb("conversion_history"),
  lastUpdated: timestamp("last_updated").defaultNow()
});

// Crypto Wallets schema
export const cryptoWallets = pgTable("crypto_wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  network: cryptoNetworkEnum("network").notNull(),
  address: text("address").notNull(),
  label: text("label"),
  isVerified: boolean("is_verified").default(false),
  isPrimary: boolean("is_primary").default(false),
  lastUsed: timestamp("last_used"),
  balance: text("balance"),
  createdAt: timestamp("created_at").defaultNow()
});

// Transactions schema
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  type: text("type"), // deposit, withdrawal, investment, roi_credit
  reference: text("reference"),
  referenceId: text("reference_id"),
  description: text("description"),
  status: text("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow()
});

// Crypto Transactions schema
export const cryptoTransactions = pgTable("crypto_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  cryptoWalletId: uuid("crypto_wallet_id").notNull().references(() => cryptoWallets.id, { onDelete: "cascade" }),
  txHash: text("tx_hash").notNull(),
  network: cryptoNetworkEnum("network").notNull(),
  amount: text("amount").notNull(),
  amountInFiat: numeric("amount_in_fiat", { precision: 12, scale: 2 }),
  type: text("type").notNull(), // deposit, withdrawal, investment, roi_credit
  status: text("status").default("pending"), // pending, completed, failed
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at")
});

// CoinGate Crypto Payments schema
export const cryptoPayments = pgTable("crypto_payments", {
  id: text("id").primaryKey(), // CoinGate payment ID
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: text("amount").notNull(), // Store as text to preserve precision for crypto amounts
  currency: text("currency").notNull(), // BTC, ETH, USDT, etc.
  status: text("status").notNull().default("new"), // new, pending, paid, confirmed, invalid, expired, canceled, etc.
  orderId: text("order_id").notNull(),
  paymentUrl: text("payment_url").notNull(),
  walletAddress: text("wallet_address"),
  txHash: text("tx_hash"),
  network: text("network"), // ethereum, bitcoin, polygon, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
  expiresAt: timestamp("expires_at"),
  propertyId: integer("property_id").references(() => properties.id),
});

// Withdrawal Requests schema
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 6 }).notNull(),
  currency: text("currency").notNull(), // BTC, ETH, USDT, etc.
  network: cryptoNetworkEnum("network").notNull(),
  walletAddress: text("wallet_address").notNull(),
  status: withdrawalStatusEnum("status").default("pending"),
  txHash: text("tx_hash"),
  processorNotes: text("processor_notes"),
  processedBy: integer("processed_by").references(() => users.id, { onDelete: "set null" }),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  feeAmount: numeric("fee_amount", { precision: 12, scale: 6 }),
  amountInFiat: numeric("amount_in_fiat", { precision: 12, scale: 2 }),
});

// Milestone status enum
export const milestoneStatusEnum = pgEnum("milestone_status", [
  "pending", 
  "in_progress", 
  "completed",
  "cancelled",
  "failed"
]);

// Milestones for escrow contracts
export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  escrowId: text("escrow_id").notNull(),
  milestoneIndex: integer("milestone_index").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: text("amount").notNull(),
  status: milestoneStatusEnum("status").notNull().default("pending"),
  completionDate: timestamp("completion_date").notNull(),
  completedAt: timestamp("completed_at"),
  network: cryptoNetworkEnum("network").notNull(),
  hash: text("hash"),
  proofData: text("proof_data"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Notifications schema
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("general"), // general, investment, system, etc.
  isRead: boolean("is_read").default(false),
  link: text("link"), // Optional link to relevant page
  createdAt: timestamp("created_at").defaultNow()
});

// Admin logs schema
export const adminLogs = pgTable("admin_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow()
});

// Audit logs schema with more detailed fields for compliance
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  action: auditActionEnum("action").notNull(),
  targetId: text("target_id"),
  entityType: text("entity_type").notNull(), // users, transactions, wallets, etc.
  adminId: uuid("admin_id").references(() => users.id, { onDelete: "set null" }),
  ip: text("ip"),
  metadata: jsonb("metadata"),
  details: text("details"),
  status: text("status").default("success"),
  timestamp: timestamp("timestamp").defaultNow()
});

// FAQs schema
export const faqs = pgTable("faqs", {
  id: integer("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// User Feedback schema
export const userFeedback = pgTable("user_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  status: text("status").default("new"), // new, in_progress, resolved, closed
  adminResponse: text("admin_response"),
  respondedBy: uuid("responded_by").references(() => users.id, { onDelete: "set null" }),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Issues schema (Issue Tracking System)
export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").default("open").notNull(), // open, in_progress, resolved, closed
  priority: text("priority").default("medium").notNull(), // low, medium, high, critical
  category: text("category").default("general").notNull(),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// Issue Comments schema
export const issueComments = pgTable("issue_comments", {
  id: serial("id").primaryKey(),
  issueId: integer("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Messages schema (Investor Messaging System)
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id").references(() => users.id, { onDelete: "set null" }),
  recipientId: uuid("recipient_id").references(() => users.id, { onDelete: "set null" }),
  subject: text("subject"),
  content: text("content"),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at").defaultNow()
});

// Push notification subscriptions schema
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  deviceType: text("device_type"),
  deviceName: text("device_name"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Document type enum for compliance logs
export const documentTypeEnum = pgEnum("document_type", [
  "terms_of_service", 
  "privacy_policy", 
  "investor_risk_disclosure", 
  "crypto_risk_disclosure",
  "aml_statement",
  "gdpr_commitment",
  "cookies_policy",
  "investment_contract",
  "property_disclosure",
  "escrow_agreement"
]);

// Document status enum
export const documentStatusEnum = pgEnum("document_status", [
  "pending", 
  "signed", 
  "expired", 
  "archived"
]);

// Legal versions schema to track document versions
export const legalVersions = pgTable("legal_versions", {
  id: serial("id").primaryKey(),
  documentType: documentTypeEnum("document_type").notNull(),
  version: integer("version").notNull(),
  notify_users: boolean("notify_users").default(false),
  releaseDate: timestamp("release_date").defaultNow()
});

// User legal acceptance schema to track user acceptance of legal documents
export const userLegalAcceptance = pgTable("user_legal_acceptance", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentType: documentTypeEnum("document_type").notNull(),
  version: integer("version").notNull(),
  acceptedAt: timestamp("accepted_at").defaultNow()
});

// Compliance logs schema
export const complianceLogs = pgTable("compliance_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  documentType: documentTypeEnum("document_type").notNull(),
  documentVersion: text("document_version").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  acceptedAt: timestamp("accepted_at").notNull().defaultNow()
});

// Notification channels enum
export const notificationChannelEnum = pgEnum("notification_channel", [
  "email", 
  "in_app", 
  "sms", 
  "push"
]);

// Notification templates for the smart notification system
export const notificationTemplates = pgTable("notification_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(), // investment_completed, kyc_approved, etc.
  subject: text("subject"),
  contentTemplate: text("content_template").notNull(),
  channels: notificationChannelEnum("channels").array(), // Which channels this template can be used for
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
});

// User notification preferences
export const userNotificationPreferences = pgTable("user_notification_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  notificationType: text("notification_type").notNull(), // matches template types
  channels: notificationChannelEnum("channels").array(),
  enabled: boolean("enabled").default(true),
  updatedAt: timestamp("updated_at")
});

// Document management system tables
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  type: documentTypeEnum("type").notNull(),
  status: documentStatusEnum("status").default("pending"),
  content: text("content"),
  fileUrl: text("file_url"),
  signUrl: text("sign_url"),
  parties: jsonb("parties").$type<Array<{ id: string; role: string; signed: boolean }>>(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  expiresAt: timestamp("expires_at")
});

// Notification queue for processing notifications asynchronously
export const notificationQueue = pgTable("notification_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventType: text("event_type").notNull(),
  eventData: jsonb("event_data").notNull(),
  status: text("status").default("pending"), // pending, processing, completed, failed
  attempts: integer("attempts").default(0),
  lastAttempt: timestamp("last_attempt"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow()
});

// AML risk level enum
export const amlRiskLevelEnum = pgEnum("aml_risk_level", [
  "low", 
  "medium", 
  "high", 
  "critical"
]);

// Webhook event types enum
export const webhookEventEnum = pgEnum("webhook_event", [
  // Investment events
  "investment_event",
  "investment_created", 
  "investment_completed",
  "investment_cancelled",
  "investment_approved",
  "investment_declined",
  "investment_refunded",
  
  // KYC events
  "kyc_event",
  "kyc_submitted",
  "kyc_approved",
  "kyc_rejected",
  "kyc_updated",
  
  // Property events
  "property_event",
  "property_created",
  "property_updated",
  "property_funding_milestone",
  "property_fully_funded",
  "property_construction_update",
  
  // ROI events
  "roi_event",
  "roi_calculated",
  "roi_distributed",
  "roi_payout_failed",
  
  // User events
  "user_event",
  "user_registered",
  "user_updated",
  "user_deleted",
  "user_login",
  "user_logout",
  "user_tier_changed",
  
  // Wallet/Transaction events
  "wallet_event",
  "wallet_created",
  "wallet_funded",
  "wallet_withdrawal",
  "wallet_transfer",
  "transaction_processed",
  
  // System events
  "system_event",
  "system_alert",
  "system_maintenance",
  
  // Security events
  "security_event",
  "security_alert",
  "suspicious_activity",
  
  // General event (catch-all)
  "general",
  "all"
]);

// AML screening results schema
export const amlScreenings = pgTable("aml_screenings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  transactionId: uuid("transaction_id").references(() => transactions.id, { onDelete: "set null" }),
  riskScore: integer("risk_score").notNull(),
  riskLevel: amlRiskLevelEnum("risk_level").notNull(),
  provider: text("provider").notNull(),
  rawResponse: jsonb("raw_response"),
  flaggedFields: jsonb("flagged_fields"),
  screenedAt: timestamp("screened_at").defaultNow(),
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewNotes: text("review_notes"),
  reviewedAt: timestamp("reviewed_at"),
  status: text("status").default("pending") // pending, approved, rejected
});

// Investor financial profile schema for calculating concentration metrics
export const investorProfiles = pgTable("investor_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  annualIncome: numeric("annual_income", { precision: 12, scale: 2 }),
  netWorth: numeric("net_worth", { precision: 12, scale: 2 }),
  liquidNetWorth: numeric("liquid_net_worth", { precision: 12, scale: 2 }),
  investmentExperience: text("investment_experience"),
  riskTolerance: text("risk_tolerance"),
  investmentObjectives: text("investment_objectives"),
  employmentStatus: text("employment_status"),
  sourceOfFunds: text("source_of_funds"),
  lastUpdated: timestamp("last_updated").defaultNow()
});

// Webhooks schema for developer integrations
export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  events: webhookEventEnum("events").array().notNull(),
  secret: text("secret").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastTriggeredAt: timestamp("last_triggered_at"),
  failureCount: integer("failure_count").default(0),
  lastError: text("last_error")
});

// Webhook delivery logs for auditing
export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: uuid("id").primaryKey().defaultRandom(),
  webhookId: uuid("webhook_id").notNull().references(() => webhooks.id, { onDelete: "cascade" }),
  eventType: webhookEventEnum("event_type").notNull(),
  requestPayload: jsonb("request_payload").notNull(),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  deliveredAt: timestamp("delivered_at").defaultNow(),
  duration: integer("duration"), // in milliseconds
  success: boolean("success").default(false),
  errorMessage: text("error_message")
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  kycSubmissions: many(kycSubmissions),
  investments: many(investments),
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId]
  }),
  cryptoWallets: many(cryptoWallets),
  cryptoPayments: many(cryptoPayments),
  withdrawalRequests: many(withdrawalRequests),
  processedWithdrawals: many(withdrawalRequests, { relationName: "processedWithdrawals" }),
  notifications: many(notifications),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  pushSubscriptions: many(pushSubscriptions),
  complianceLogs: many(complianceLogs),
  feedback: many(userFeedback),
  issues: many(issues),
  issueComments: many(issueComments),
  assignedIssues: many(issues, { relationName: "assignedIssues" }),
  amlScreenings: many(amlScreenings),
  amlReviews: many(amlScreenings, { relationName: "amlReviews" }),
  webhooks: many(webhooks),
  financialProfile: one(investorProfiles, {
    fields: [users.id],
    references: [investorProfiles.userId]
  }),
  createdDocuments: many(documents, { relationName: "createdDocuments" })
}));

export const kycSubmissionsRelations = relations(kycSubmissions, ({ one }) => ({
  user: one(users, {
    fields: [kycSubmissions.userId],
    references: [users.id]
  })
}));

export const propertiesRelations = relations(properties, ({ many }) => ({
  investments: many(investments)
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  user: one(users, {
    fields: [investments.userId],
    references: [users.id]
  }),
  property: one(properties, {
    fields: [investments.propertyId],
    references: [properties.id]
  })
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id]
  }),
  transactions: many(transactions)
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id]
  }),
  amlScreenings: many(amlScreenings)
}));

export const cryptoWalletsRelations = relations(cryptoWallets, ({ one, many }) => ({
  user: one(users, {
    fields: [cryptoWallets.userId],
    references: [users.id]
  }),
  transactions: many(cryptoTransactions)
}));

export const cryptoTransactionsRelations = relations(cryptoTransactions, ({ one }) => ({
  wallet: one(cryptoWallets, {
    fields: [cryptoTransactions.cryptoWalletId],
    references: [cryptoWallets.id]
  })
}));

export const cryptoPaymentsRelations = relations(cryptoPayments, ({ one }) => ({
  user: one(users, {
    fields: [cryptoPayments.userId],
    references: [users.id]
  }),
  property: one(properties, {
    fields: [cryptoPayments.propertyId],
    references: [properties.id]
  })
}));

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  user: one(users, {
    fields: [withdrawalRequests.userId],
    references: [users.id]
  }),
  processor: one(users, {
    fields: [withdrawalRequests.processedBy],
    references: [users.id],
    relationName: "processedWithdrawals"
  })
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages"
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "receivedMessages"
  })
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id]
  })
}));

export const faqsRelations = relations(faqs, ({ one }) => ({
  creator: one(users, {
    fields: [faqs.createdBy],
    references: [users.id]
  }),
  updater: one(users, {
    fields: [faqs.updatedBy],
    references: [users.id]
  })
}));

export const userFeedbackRelations = relations(userFeedback, ({ one }) => ({
  user: one(users, {
    fields: [userFeedback.userId],
    references: [users.id]
  }),
  responder: one(users, {
    fields: [userFeedback.respondedBy],
    references: [users.id]
  })
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
  user: one(users, {
    fields: [issues.userId],
    references: [users.id]
  }),
  assignee: one(users, {
    fields: [issues.assignedTo],
    references: [users.id],
    relationName: "assignedIssues"
  }),
  comments: many(issueComments)
}));

export const issueCommentsRelations = relations(issueComments, ({ one }) => ({
  issue: one(issues, {
    fields: [issueComments.issueId],
    references: [issues.id]
  }),
  user: one(users, {
    fields: [issueComments.userId],
    references: [users.id]
  })
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id]
  })
}));

export const amlScreeningsRelations = relations(amlScreenings, ({ one }) => ({
  user: one(users, {
    fields: [amlScreenings.userId],
    references: [users.id]
  }),
  transaction: one(transactions, {
    fields: [amlScreenings.transactionId],
    references: [transactions.id]
  }),
  reviewer: one(users, {
    fields: [amlScreenings.reviewedBy],
    references: [users.id],
    relationName: "amlReviews"
  })
}));

export const investorProfilesRelations = relations(investorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [investorProfiles.userId],
    references: [users.id]
  })
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  creator: one(users, {
    fields: [documents.createdBy],
    references: [users.id],
    relationName: "createdDocuments"
  })
}));

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  user: one(users, {
    fields: [webhooks.userId],
    references: [users.id]
  }),
  deliveries: many(webhookDeliveries)
}));

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookDeliveries.webhookId],
    references: [webhooks.id]
  })
}));

// Create schemas for insertions
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
  // Removed updatedAt as it doesn't exist in the schema anymore
});

export const insertKycSubmissionSchema = createInsertSchema(kycSubmissions).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true
});

export const insertProjectSchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  investedAt: true
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  lastUpdated: true
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true,
  isRead: true
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});

export const insertFaqSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  respondedAt: true
});

export const insertIssueSchema = createInsertSchema(issues).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertIssueCommentSchema = createInsertSchema(issueComments).omit({
  id: true,
  createdAt: true
});

// Create schemas for crypto tables
export const insertCryptoWalletSchema = createInsertSchema(cryptoWallets).omit({
  id: true,
  createdAt: true,
  lastUsed: true
});

export const insertCryptoTransactionSchema = createInsertSchema(cryptoTransactions).omit({
  id: true,
  createdAt: true,
  confirmedAt: true
});

export const insertCryptoPaymentSchema = createInsertSchema(cryptoPayments).omit({
  id: true,
  createdAt: true,
});

// Create schema for milestones
export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
  completedAt: true
});

// Create schema for withdrawal requests
export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({
  id: true,
  requestedAt: true,
  processedAt: true,
  processedBy: true,
  status: true
});

// Create schema for push subscriptions
export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Create schema for compliance logs
export const insertComplianceLogSchema = createInsertSchema(complianceLogs).omit({
  id: true,
  acceptedAt: true
});

// Create schema for webhook and webhook deliveries
export const insertWebhookSchema = createInsertSchema(webhooks).omit({
  id: true,
  createdAt: true,
  lastTriggeredAt: true,
  failureCount: true,
  lastError: true
});

export const insertWebhookDeliverySchema = createInsertSchema(webhookDeliveries).omit({
  id: true,
  deliveredAt: true
});

// Create schema for AML screenings
export const insertAmlScreeningSchema = createInsertSchema(amlScreenings).omit({
  id: true,
  screenedAt: true,
  reviewedAt: true
});

// Create schema for investor profiles
export const insertInvestorProfileSchema = createInsertSchema(investorProfiles).omit({
  id: true,
  lastUpdated: true
});

// Create schema for documents
export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  lastUpdated: true
});

// Export the property schema with a new name to match the import in admin-routes.ts
export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type KycSubmission = typeof kycSubmissions.$inferSelect;
export type InsertKycSubmission = z.infer<typeof insertKycSubmissionSchema>;

export type Project = typeof properties.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = z.infer<typeof insertFaqSchema>;

export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;

export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;

export type IssueComment = typeof issueComments.$inferSelect;
export type InsertIssueComment = z.infer<typeof insertIssueCommentSchema>;

export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type InsertCryptoWallet = z.infer<typeof insertCryptoWalletSchema>;

export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;
export type InsertCryptoTransaction = z.infer<typeof insertCryptoTransactionSchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

export type CryptoPayment = typeof cryptoPayments.$inferSelect;
export type InsertCryptoPayment = z.infer<typeof insertCryptoPaymentSchema>;

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;

export type ComplianceLog = typeof complianceLogs.$inferSelect;
export type InsertComplianceLog = z.infer<typeof insertComplianceLogSchema>;

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = z.infer<typeof insertWebhookSchema>;

export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type InsertWebhookDelivery = z.infer<typeof insertWebhookDeliverySchema>;

export type AmlScreening = typeof amlScreenings.$inferSelect;
export type InsertAmlScreening = z.infer<typeof insertAmlScreeningSchema>;

export type InvestorProfile = typeof investorProfiles.$inferSelect;
export type InsertInvestorProfile = z.infer<typeof insertInvestorProfileSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// -----------------------------------
// ROI Distribution and Payout Schemas
// -----------------------------------

// Define payouts related enums
export const payoutFrequencyEnum = pgEnum('payout_frequency', ['monthly', 'quarterly', 'annual', 'custom']);
export const payoutStatusEnum = pgEnum('payout_status', ['pending', 'processing', 'paid', 'failed']);

// Payout schedules table for property ROI distributions
export const payoutSchedules = pgTable('payout_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  frequency: payoutFrequencyEnum('frequency').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  amountType: text('amount_type').notNull(), // 'fixed' or 'percentage'
  amountValue: numeric('amount_value', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ROI distributions table to track payout batches
export const roiDistributions = pgTable('roi_distributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').references(() => properties.id).notNull(),
  payoutDate: timestamp('payout_date').notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  status: payoutStatusEnum('status').notNull().default('pending'),
  initiatedBy: uuid('initiated_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Individual investor payouts tracking
export const investorPayouts = pgTable('investor_payouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  distributionId: uuid('distribution_id').references(() => roiDistributions.id).notNull(),
  investorId: uuid('investor_id').references(() => users.id).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  status: payoutStatusEnum('status').notNull().default('pending'),
  paidAt: timestamp('paid_at'),
  transactionId: uuid('transaction_id').references(() => transactions.id),
});

// Create insert schemas for all payout tables
export const insertPayoutScheduleSchema = createInsertSchema(payoutSchedules).omit({
  id: true,
  createdAt: true
});

export const insertRoiDistributionSchema = createInsertSchema(roiDistributions).omit({
  id: true,
  createdAt: true
});

export const insertInvestorPayoutSchema = createInsertSchema(investorPayouts).omit({
  id: true
});

// Export types for all payout tables
export type PayoutSchedule = typeof payoutSchedules.$inferSelect;
export type InsertPayoutSchedule = z.infer<typeof insertPayoutScheduleSchema>;

export type RoiDistribution = typeof roiDistributions.$inferSelect;
export type InsertRoiDistribution = z.infer<typeof insertRoiDistributionSchema>;

export type InvestorPayout = typeof investorPayouts.$inferSelect;
export type InsertInvestorPayout = z.infer<typeof insertInvestorPayoutSchema>;

// Property Valuation Tracker
export const propertyValuations = pgTable("property_valuations", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  valuation: numeric("valuation", { precision: 15, scale: 2 }).notNull(),
  valuationDate: timestamp("valuation_date").notNull(),
  methodology: valuationMethodologyEnum("methodology"),
  source: valuationSourceEnum("source"),
  reportUrl: text("report_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  metadata: jsonb("metadata")
});

// Secondary Market Engine
export const secondaryListings = pgTable("secondary_listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  investmentId: uuid("investment_id").notNull().references(() => investments.id, { onDelete: "cascade" }),
  askingPrice: numeric("asking_price", { precision: 15, scale: 2 }).notNull(),
  minPrice: numeric("min_price", { precision: 15, scale: 2 }),
  status: secondaryListingStatusEnum("status").default("pending"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  soldAt: timestamp("sold_at"),
  soldTo: uuid("sold_to").references(() => users.id),
  soldPrice: numeric("sold_price", { precision: 15, scale: 2 }),
  description: text("description"),
  terms: jsonb("terms"),
  fees: numeric("fees", { precision: 10, scale: 2 }),
  adminApproved: boolean("admin_approved").default(false),
  adminApprovedBy: uuid("admin_approved_by").references(() => users.id),
  adminApprovedAt: timestamp("admin_approved_at")
});

// Secondary Market Bids
export const secondaryBids = pgTable("secondary_bids", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").notNull().references(() => secondaryListings.id, { onDelete: "cascade" }),
  bidderId: uuid("bidder_id").notNull().references(() => users.id),
  bidPrice: numeric("bid_price", { precision: 15, scale: 2 }).notNull(),
  status: text("status").default("pending"), // pending, accepted, rejected, expired, withdrawn
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  responseAt: timestamp("response_at"),
  notes: text("notes")
});

// Create insert schema for Property Valuations
export const insertPropertyValuationSchema = createInsertSchema(propertyValuations).omit({
  id: true,
  createdAt: true
});

// Create insert schema for Secondary Listings
export const insertSecondaryListingSchema = createInsertSchema(secondaryListings).omit({
  id: true,
  createdAt: true,
  soldAt: true,
  soldTo: true,
  soldPrice: true,
  adminApproved: true,
  adminApprovedBy: true,
  adminApprovedAt: true
});

// Create insert schema for Secondary Bids
export const insertSecondaryBidSchema = createInsertSchema(secondaryBids).omit({
  id: true,
  createdAt: true,
  responseAt: true
});

// Export types for new tables
export type PropertyValuation = typeof propertyValuations.$inferSelect;
export type InsertPropertyValuation = z.infer<typeof insertPropertyValuationSchema>;

export type SecondaryListing = typeof secondaryListings.$inferSelect;
export type InsertSecondaryListing = z.infer<typeof insertSecondaryListingSchema>;

export type SecondaryBid = typeof secondaryBids.$inferSelect;
export type InsertSecondaryBid = z.infer<typeof insertSecondaryBidSchema>;

// Pro Rata Distribution System
export const distributionPriority = pgTable('distribution_priority', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  tier: integer('tier').notNull(),
  recipientType: varchar('recipient_type', { length: 20 }).notNull(),
  percentage: numeric('percentage', { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

// Distribution records
export const distributionRecords = pgTable('distribution_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  tier: integer('tier').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  recipientType: varchar('recipient_type', { length: 20 }).notNull(),
  recipientId: uuid('recipient_id').references(() => users.id),
  distributedAt: timestamp('distributed_at').defaultNow(),
  status: varchar('status', { length: 20 }).default('completed'),
  transactionId: uuid('transaction_id').references(() => transactions.id)
});

// Tax Documents
export const taxDocuments = pgTable('tax_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  documentType: varchar('document_type', { length: 20 }).notNull(),
  generatedAt: timestamp('generated_at').defaultNow(),
  downloadUrl: text('download_url'),
  status: varchar('status', { length: 20 }).default('pending'),
  metadata: jsonb('metadata')
});

// Investor Communication Hub
export const investorUpdates = pgTable('investor_updates', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  attachments: jsonb('attachments'),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  status: varchar('status', { length: 20 }).default('draft')
});

// Create insert schemas for the new tables
export const insertDistributionPrioritySchema = createInsertSchema(distributionPriority).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertDistributionRecordSchema = createInsertSchema(distributionRecords).omit({
  id: true,
  distributedAt: true
});

export const insertTaxDocumentSchema = createInsertSchema(taxDocuments).omit({
  id: true,
  generatedAt: true
});

export const insertInvestorUpdateSchema = createInsertSchema(investorUpdates).omit({
  id: true,
  createdAt: true,
  sentAt: true
});

// Export types for the new tables
export type DistributionPriority = typeof distributionPriority.$inferSelect;
export type InsertDistributionPriority = z.infer<typeof insertDistributionPrioritySchema>;

export type DistributionRecord = typeof distributionRecords.$inferSelect;
export type InsertDistributionRecord = z.infer<typeof insertDistributionRecordSchema>;

export type TaxDocument = typeof taxDocuments.$inferSelect;
export type InsertTaxDocument = z.infer<typeof insertTaxDocumentSchema>;

export type InvestorUpdate = typeof investorUpdates.$inferSelect;
export type InsertInvestorUpdate = z.infer<typeof insertInvestorUpdateSchema>;

// Portfolio Analysis - Exposure Analyzer
export const portfolioExposures = pgTable('portfolio_exposures', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  exposureType: varchar('exposure_type', { length: 50 }).notNull(), // geographic, asset_class, development_stage
  category: varchar('category', { length: 100 }).notNull(), // state, property_type, stage
  value: numeric('value', { precision: 15, scale: 2 }).notNull(),
  percentage: numeric('percentage', { precision: 7, scale: 4 }).notNull(),
  calculatedAt: timestamp('calculated_at').defaultNow(),
  metadata: jsonb('metadata')
});

// Asset Class Balancer
export const targetAllocations = pgTable('target_allocations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  allocationType: varchar('allocation_type', { length: 50 }).notNull(), // property_type, investment_vehicle, development_stage
  category: varchar('category', { length: 100 }).notNull(),
  targetPercentage: numeric('target_percentage', { precision: 7, scale: 4 }).notNull(),
  currentPercentage: numeric('current_percentage', { precision: 7, scale: 4 }),
  updatedAt: timestamp('updated_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// Scenario Analysis Engine
export const scenarioTests = pgTable('scenario_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  userId: uuid('user_id').references(() => users.id),
  parameters: jsonb('parameters').notNull(),
  results: jsonb('results'),
  ranAt: timestamp('ran_at'),
  createdAt: timestamp('created_at').defaultNow(),
  portfolioSnapshot: jsonb('portfolio_snapshot')
});

// Scenario Templates
export const scenarioTemplates = pgTable('scenario_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  parameters: jsonb('parameters').notNull(),
  defaultValues: jsonb('default_values'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  isPublic: boolean('is_public').default(false)
});

// Create insert schemas for the new tables
export const insertPortfolioExposureSchema = createInsertSchema(portfolioExposures).omit({
  id: true,
  calculatedAt: true
});

export const insertTargetAllocationSchema = createInsertSchema(targetAllocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertScenarioTestSchema = createInsertSchema(scenarioTests).omit({
  id: true,
  createdAt: true,
  ranAt: true
});

export const insertScenarioTemplateSchema = createInsertSchema(scenarioTemplates).omit({
  id: true,
  createdAt: true
});

// Export types for the new tables
export type PortfolioExposure = typeof portfolioExposures.$inferSelect;
export type InsertPortfolioExposure = z.infer<typeof insertPortfolioExposureSchema>;

export type TargetAllocation = typeof targetAllocations.$inferSelect;
export type InsertTargetAllocation = z.infer<typeof insertTargetAllocationSchema>;

export type ScenarioTest = typeof scenarioTests.$inferSelect;
export type InsertScenarioTest = z.infer<typeof insertScenarioTestSchema>;

export type ScenarioTemplate = typeof scenarioTemplates.$inferSelect;
export type InsertScenarioTemplate = z.infer<typeof insertScenarioTemplateSchema>;

// Market Data Integration System
export const marketComparables = pgTable('market_comparables', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyType: varchar('property_type', { length: 50 }).notNull(),
  region: varchar('region', { length: 50 }).notNull(),
  avgCapRate: numeric('cap_rate', { precision: 5, scale: 2 }),
  avgNOI: numeric('noi', { precision: 15, scale: 2 }),
  avgSqFtPrice: numeric('avg_sqft_price', { precision: 10, scale: 2 }),
  transactionCount: integer('transaction_count'),
  timeframe: varchar('timeframe', { length: 20 }).default('quarterly'),
  source: varchar('source', { length: 100 }),
  updatedAt: timestamp('updated_at').defaultNow(),
  metadata: jsonb('metadata')
});

// Property AVM (Automated Valuation Model) data
export const propertyValuationModels = pgTable('property_valuation_models', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  modelType: varchar('model_type', { length: 50 }).notNull(), // 'avm', 'cap_rate', 'discounted_cash_flow', etc.
  estimatedValue: numeric('estimated_value', { precision: 15, scale: 2 }).notNull(),
  confidenceScore: numeric('confidence_score', { precision: 5, scale: 2 }),
  comparableIds: jsonb('comparable_ids'), // Array of market comparable IDs used
  calculatedAt: timestamp('calculated_at').defaultNow(),
  parameters: jsonb('parameters'), // Model-specific parameters used
  createdBy: uuid('created_by').references(() => users.id), // System or user that ran the model
  metadata: jsonb('metadata')
});

// Market data sources
export const marketDataSources = pgTable('market_data_sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  apiKey: text('api_key'),
  apiEndpoint: text('api_endpoint'),
  dataFormat: text('data_format'),
  isActive: boolean('is_active').default(true),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow(),
  credentialsLastUpdatedAt: timestamp('credentials_last_updated_at'),
  syncFrequency: varchar('sync_frequency', { length: 50 }).default('weekly')
});

// Market data sync logs
export const marketDataSyncLogs = pgTable('market_data_sync_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceId: uuid('source_id').references(() => marketDataSources.id),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  status: varchar('status', { length: 20 }).default('running'),
  recordsProcessed: integer('records_processed').default(0),
  recordsUpdated: integer('records_updated').default(0),
  recordsFailed: integer('records_failed').default(0),
  errorMessage: text('error_message'),
  syncType: varchar('sync_type', { length: 20 }).default('scheduled') // 'scheduled', 'manual', 'initial'
});

// Create insert schemas for the new tables
export const insertMarketComparableSchema = createInsertSchema(marketComparables).omit({
  id: true,
  updatedAt: true
});

export const insertPropertyValuationModelSchema = createInsertSchema(propertyValuationModels).omit({
  id: true,
  calculatedAt: true
});

export const insertMarketDataSourceSchema = createInsertSchema(marketDataSources).omit({
  id: true,
  createdAt: true,
  lastSyncedAt: true,
  credentialsLastUpdatedAt: true
});

export const insertMarketDataSyncLogSchema = createInsertSchema(marketDataSyncLogs).omit({
  id: true,
  startedAt: true,
  completedAt: true
});

// Export types for the new tables
export type MarketComparable = typeof marketComparables.$inferSelect;
export type InsertMarketComparable = z.infer<typeof insertMarketComparableSchema>;

export type PropertyValuationModel = typeof propertyValuationModels.$inferSelect;
export type InsertPropertyValuationModel = z.infer<typeof insertPropertyValuationModelSchema>;

export type MarketDataSource = typeof marketDataSources.$inferSelect;
export type InsertMarketDataSource = z.infer<typeof insertMarketDataSourceSchema>;

export type MarketDataSyncLog = typeof marketDataSyncLogs.$inferSelect;
export type InsertMarketDataSyncLog = z.infer<typeof insertMarketDataSyncLogSchema>;

// ESG Tracking System
export const energyRatingEnum = pgEnum('energy_rating', ['A', 'B', 'C', 'D', 'E', 'F']);
export const esgScores = pgTable('esg_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  energyRating: energyRatingEnum('energy_rating'),
  waterUsage: numeric('water_usage', { precision: 10, scale: 2 }),
  communityImpactScore: numeric('community_impact_score', { precision: 5, scale: 2 }),
  governanceRating: numeric('governance_rating', { precision: 5, scale: 2 }),
  lastAudited: timestamp('last_audited'),
  auditedBy: uuid('audited_by').references(() => users.id),
  certifications: jsonb('certifications'),
  carbonFootprint: numeric('carbon_footprint', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

export const utilityDataRecords = pgTable('utility_data_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  recordDate: timestamp('record_date').notNull(),
  dataType: varchar('data_type', { length: 50 }).notNull(), // electricity, gas, water, etc.
  consumption: numeric('consumption', { precision: 15, scale: 3 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull(), // kWh, therms, gallons, etc.
  cost: numeric('cost', { precision: 10, scale: 2 }),
  source: varchar('source', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  metadata: jsonb('metadata')
});

export const sustainabilityProjects = pgTable('sustainability_projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  propertyId: uuid('property_id').notNull().references(() => properties.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }), // energy, water, waste, community, etc.
  startDate: timestamp('start_date'),
  completionDate: timestamp('completion_date'),
  budget: numeric('budget', { precision: 15, scale: 2 }),
  actualCost: numeric('actual_cost', { precision: 15, scale: 2 }),
  projectedSavings: numeric('projected_savings', { precision: 15, scale: 2 }),
  actualSavings: numeric('actual_savings', { precision: 15, scale: 2 }),
  status: varchar('status', { length: 50 }).default('planned'), // planned, in_progress, completed, cancelled
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

// Fraud Detection System
export const riskAssessments = pgTable('risk_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  assessmentDate: timestamp('assessment_date').defaultNow(),
  riskScore: integer('risk_score').notNull(),
  riskLevel: varchar('risk_level', { length: 20 }).notNull(), // low, medium, high, critical
  factors: jsonb('factors'), // Array of risk factors identified
  reviewed: boolean('reviewed').default(false),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  notes: text('notes'),
  automaticActions: jsonb('automatic_actions')
});

export const transactionAnomalies = pgTable('transaction_anomalies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  transactionId: uuid('transaction_id').references(() => transactions.id),
  detectedAt: timestamp('detected_at').defaultNow(),
  anomalyType: varchar('anomaly_type', { length: 50 }).notNull(), // HIGH_VELOCITY, UNUSUAL_GEO_PATTERN, etc.
  severity: integer('severity').notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, reviewed, false_positive, confirmed
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  resolution: text('resolution'),
  dataSnapshot: jsonb('data_snapshot')
});

export const fraudRules = pgTable('fraud_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  ruleType: varchar('rule_type', { length: 50 }).notNull(), // velocity, pattern, behavioral, etc.
  parameters: jsonb('parameters').notNull(),
  severity: integer('severity').notNull().default(5), // 1-10 scale
  isActive: boolean('is_active').default(true),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at'),
  lastTriggered: timestamp('last_triggered')
});

// Investor Exit Management
export const exitRequestStatusEnum = pgEnum('exit_request_status', ['pending', 'approved', 'rejected', 'completed', 'cancelled']);
export const exitRequestTypeEnum = pgEnum('exit_request_type', ['secondary_sale', 'early_redemption', 'platform_buyback', 'maturity_extension']);

export const exitRequests = pgTable('exit_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  investmentId: uuid('investment_id').notNull().references(() => investments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  requestDate: timestamp('request_date').defaultNow(),
  requestType: exitRequestTypeEnum('request_type').notNull(),
  requestedAmount: numeric('requested_amount', { precision: 15, scale: 2 }).notNull(),
  status: exitRequestStatusEnum('status').default('pending'),
  processingFee: numeric('processing_fee', { precision: 10, scale: 2 }),
  earlyExitPenalty: numeric('early_exit_penalty', { precision: 10, scale: 2 }),
  netPayout: numeric('net_payout', { precision: 15, scale: 2 }),
  reason: text('reason'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  transactionId: uuid('transaction_id').references(() => transactions.id)
});

export const secondaryMarketOfferStatusEnum = pgEnum('secondary_market_offer_status', ['active', 'pending', 'accepted', 'rejected', 'expired', 'cancelled']);

export const secondaryMarketOffers = pgTable('secondary_market_offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  investmentId: uuid('investment_id').notNull().references(() => investments.id, { onDelete: 'cascade' }),
  sellerId: uuid('seller_id').notNull().references(() => users.id),
  offerPrice: numeric('offer_price', { precision: 15, scale: 2 }).notNull(),
  listingDate: timestamp('listing_date').defaultNow(),
  expirationDate: timestamp('expiration_date'),
  status: secondaryMarketOfferStatusEnum('status').default('active'),
  minimumPurchaseAmount: numeric('minimum_purchase_amount', { precision: 15, scale: 2 }),
  availableAmount: numeric('available_amount', { precision: 15, scale: 2 }).notNull(),
  platformFee: numeric('platform_fee', { precision: 10, scale: 2 }),
  description: text('description'),
  termsAccepted: boolean('terms_accepted').default(false),
  metadata: jsonb('metadata')
});

export const secondaryMarketBids = pgTable('secondary_market_bids', {
  id: uuid('id').primaryKey().defaultRandom(),
  offerId: uuid('offer_id').notNull().references(() => secondaryMarketOffers.id, { onDelete: 'cascade' }),
  bidderId: uuid('bidder_id').notNull().references(() => users.id),
  bidAmount: numeric('bid_amount', { precision: 15, scale: 2 }).notNull(),
  bidQuantity: numeric('bid_quantity', { precision: 15, scale: 2 }).notNull(),
  bidDate: timestamp('bid_date').defaultNow(),
  expirationDate: timestamp('expiration_date'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, accepted, rejected, expired, cancelled
  acceptedAt: timestamp('accepted_at'),
  transactionId: uuid('transaction_id').references(() => transactions.id),
  message: text('message'),
  metadata: jsonb('metadata')
});

// Create insert schemas for the new tables
export const insertEsgScoreSchema = createInsertSchema(esgScores).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUtilityDataRecordSchema = createInsertSchema(utilityDataRecords).omit({
  id: true,
  createdAt: true
});

export const insertSustainabilityProjectSchema = createInsertSchema(sustainabilityProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  assessmentDate: true,
  reviewedAt: true
});

export const insertTransactionAnomalySchema = createInsertSchema(transactionAnomalies).omit({
  id: true,
  detectedAt: true,
  reviewedAt: true
});

export const insertFraudRuleSchema = createInsertSchema(fraudRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastTriggered: true
});

export const insertExitRequestSchema = createInsertSchema(exitRequests).omit({
  id: true,
  requestDate: true,
  reviewedAt: true,
  completedAt: true
});

export const insertSecondaryMarketOfferSchema = createInsertSchema(secondaryMarketOffers).omit({
  id: true,
  listingDate: true
});

export const insertSecondaryMarketBidSchema = createInsertSchema(secondaryMarketBids).omit({
  id: true,
  bidDate: true,
  acceptedAt: true
});

// Export types for the new tables
export type EsgScore = typeof esgScores.$inferSelect;
export type InsertEsgScore = z.infer<typeof insertEsgScoreSchema>;

export type UtilityDataRecord = typeof utilityDataRecords.$inferSelect;
export type InsertUtilityDataRecord = z.infer<typeof insertUtilityDataRecordSchema>;

export type SustainabilityProject = typeof sustainabilityProjects.$inferSelect;
export type InsertSustainabilityProject = z.infer<typeof insertSustainabilityProjectSchema>;

export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;

export type TransactionAnomaly = typeof transactionAnomalies.$inferSelect;
export type InsertTransactionAnomaly = z.infer<typeof insertTransactionAnomalySchema>;

export type FraudRule = typeof fraudRules.$inferSelect;
export type InsertFraudRule = z.infer<typeof insertFraudRuleSchema>;

export type ExitRequest = typeof exitRequests.$inferSelect;
export type InsertExitRequest = z.infer<typeof insertExitRequestSchema>;

export type SecondaryMarketOffer = typeof secondaryMarketOffers.$inferSelect;
export type InsertSecondaryMarketOffer = z.infer<typeof insertSecondaryMarketOfferSchema>;

export type SecondaryMarketBid = typeof secondaryMarketBids.$inferSelect;
export type InsertSecondaryMarketBid = z.infer<typeof insertSecondaryMarketBidSchema>;

// Regulatory Compliance System
export const complianceStatusEnum = pgEnum('compliance_status', ['compliant', 'non_compliant', 'pending_review', 'exempted']);
export const verificationType = pgEnum('verification_type', ['income', 'net_worth', 'securities_holdings', 'professional_certification', 'third_party']);

export const investorVerifications = pgTable('investor_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  verificationType: verificationType('verification_type').notNull(),
  documentUrls: jsonb('document_urls'),
  verifiedBy: uuid('verified_by').references(() => users.id),
  verifiedAt: timestamp('verified_at'),
  status: varchar('status', { length: 30 }).default('pending'),
  expiresAt: timestamp('expires_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

export const investorFinancials = pgTable('investor_financials', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  annualIncome: numeric('annual_income', { precision: 15, scale: 2 }),
  netWorth: numeric('net_worth', { precision: 15, scale: 2 }),
  liquidAssets: numeric('liquid_assets', { precision: 15, scale: 2 }),
  totalInvestments: numeric('total_investments', { precision: 15, scale: 2 }),
  sourceOfWealth: text('source_of_wealth'),
  lastVerifiedAt: timestamp('last_verified_at'),
  verificationDocuments: jsonb('verification_documents'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
});

export const regulatoryLimits = pgTable('regulatory_limits', {
  id: uuid('id').primaryKey().defaultRandom(),
  jurisdiction: varchar('jurisdiction', { length: 100 }).notNull(),
  investorType: varchar('investor_type', { length: 50 }).notNull(), // retail, accredited, qualified
  maxInvestmentAmount: numeric('max_investment_amount', { precision: 15, scale: 2 }),
  maxInvestmentPercentage: numeric('max_investment_percentage', { precision: 5, scale: 2 }),
  baseCalculation: varchar('base_calculation', { length: 50 }), // income, net_worth, etc.
  requiresVerification: boolean('requires_verification').default(true),
  notes: text('notes'),
  effectiveDate: timestamp('effective_date').notNull(),
  expirationDate: timestamp('expiration_date'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow()
});

export const complianceChecks = pgTable('compliance_checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  investmentId: uuid('investment_id').references(() => investments.id),
  checkType: varchar('check_type', { length: 50 }).notNull(), // accreditation, investment_limit, kyc, etc.
  status: complianceStatusEnum('status').default('pending_review'),
  checkData: jsonb('check_data'),
  result: jsonb('result'),
  resultDetails: text('result_details'),
  performedBy: uuid('performed_by').references(() => users.id),
  performedAt: timestamp('performed_at').defaultNow(),
  expiresAt: timestamp('expires_at')
});

export const jurisdictionRestrictions = pgTable('jurisdiction_restrictions', {
  id: uuid('id').primaryKey().defaultRandom(),
  country: varchar('country', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  restrictionType: varchar('restriction_type', { length: 50 }).notNull(), // blocked, limited, documentation_required
  details: text('details'),
  regulationReference: text('regulation_reference'),
  effectiveDate: timestamp('effective_date').notNull(),
  expirationDate: timestamp('expiration_date'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow()
});

export const complianceExceptions = pgTable('compliance_exceptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  exceptionType: varchar('exception_type', { length: 50 }).notNull(),
  reason: text('reason').notNull(),
  documentUrls: jsonb('document_urls'),
  approvedBy: uuid('approved_by').notNull().references(() => users.id),
  approvedAt: timestamp('approved_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  status: varchar('status', { length: 30 }).default('active'),
  revokedBy: uuid('revoked_by').references(() => users.id),
  revokedAt: timestamp('revoked_at'),
  notes: text('notes')
});

// Create insert schemas for the new tables
export const insertInvestorVerificationSchema = createInsertSchema(investorVerifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verifiedAt: true
});

export const insertInvestorFinancialsSchema = createInsertSchema(investorFinancials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastVerifiedAt: true
});

export const insertRegulatoryLimitSchema = createInsertSchema(regulatoryLimits).omit({
  id: true,
  createdAt: true
});

export const insertComplianceCheckSchema = createInsertSchema(complianceChecks).omit({
  id: true,
  performedAt: true
});

export const insertJurisdictionRestrictionSchema = createInsertSchema(jurisdictionRestrictions).omit({
  id: true,
  createdAt: true
});

export const insertComplianceExceptionSchema = createInsertSchema(complianceExceptions).omit({
  id: true,
  approvedAt: true,
  revokedAt: true
});

// Export types for the new tables
export type InvestorVerification = typeof investorVerifications.$inferSelect;
export type InsertInvestorVerification = z.infer<typeof insertInvestorVerificationSchema>;

export type InvestorFinancial = typeof investorFinancials.$inferSelect;
export type InsertInvestorFinancial = z.infer<typeof insertInvestorFinancialsSchema>;

export type RegulatoryLimit = typeof regulatoryLimits.$inferSelect;
export type InsertRegulatoryLimit = z.infer<typeof insertRegulatoryLimitSchema>;

export type ComplianceCheck = typeof complianceChecks.$inferSelect;
export type InsertComplianceCheck = z.infer<typeof insertComplianceCheckSchema>;

export type JurisdictionRestriction = typeof jurisdictionRestrictions.$inferSelect;
export type InsertJurisdictionRestriction = z.infer<typeof insertJurisdictionRestrictionSchema>;

export type ComplianceException = typeof complianceExceptions.$inferSelect;
export type InsertComplianceException = z.infer<typeof insertComplianceExceptionSchema>;