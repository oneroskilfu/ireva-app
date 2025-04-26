import { pgTable, text, uuid, boolean, timestamp, numeric, integer, pgEnum, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Define all the enums that are needed in admin-routes.ts
export const userRoleEnum = pgEnum("user_role", ["investor", "admin", "super_admin"]);
export const kycStatusEnum = pgEnum("kyc_status", ["not_started", "pending", "approved", "rejected"]);
export const propertyTypeEnum = pgEnum("property_type", ["residential", "commercial", "industrial", "mixed_use", "land"]);
export const investmentTierEnum = pgEnum("investment_tier", ["starter", "growth", "premium", "elite"]);
export const investmentStatusEnum = pgEnum("investment_status", ["active", "completed", "refunded", "cancelled"]);
export const accreditationLevelEnum = pgEnum("accreditation_level", ["non_accredited", "accredited", "qualified_purchaser"]);
export const paymentMethodEnum = pgEnum("payment_method", ["wallet", "card", "bank_transfer", "crypto"]);
export const cryptoNetworkEnum = pgEnum("crypto_network", ["ethereum", "binance", "polygon", "solana", "avalanche"]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "approved", "rejected", "processed", "failed"]);

// User schema
export const users = pgTable("users", {
  id: integer("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").default("investor"),
  phoneNumber: text("phone_number"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  kycStatus: kycStatusEnum("kyc_status").default("not_started"),
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
  completionDate: timestamp("completion_date")
});

// Investments schema
export const investments = pgTable("investments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  unitsInvested: integer("units_invested").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  roiEarned: numeric("roi_earned", { precision: 12, scale: 2 }).default("0"),
  status: text("status").default("active"), // active, completed, refunded
  investedAt: timestamp("invested_at").defaultNow()
});

// Wallets schema
export const wallets = pgTable("wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  balance: numeric("balance", { precision: 12, scale: 2 }).default("0"),
  availableBalance: numeric("available_balance", { precision: 12, scale: 2 }).default("0"),
  pendingDeposits: numeric("pending_deposits", { precision: 12, scale: 2 }).default("0"),
  pendingWithdrawals: numeric("pending_withdrawals", { precision: 12, scale: 2 }).default("0"),
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
  feedback: many(userFeedback),
  issues: many(issues),
  issueComments: many(issueComments),
  assignedIssues: many(issues, { relationName: "assignedIssues" })
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
  project: one(properties, {
    fields: [investments.projectId],
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

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id]
  })
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