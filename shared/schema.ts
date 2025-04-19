import { pgTable, text, uuid, boolean, timestamp, numeric, integer, pgEnum, jsonb } from "drizzle-orm/pg-core";
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

// User schema
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("investor"), // investor or admin
  phoneNumber: text("phone_number"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
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

// Projects schema
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  totalUnits: integer("total_units"),
  availableUnits: integer("available_units"),
  pricePerUnit: numeric("price_per_unit", { precision: 12, scale: 2 }),
  roiPercent: numeric("roi_percent", { precision: 5, scale: 2 }),
  tenorMonths: integer("tenor_months"),
  status: text("status").default("active"), // active, closed, upcoming
  launchDate: timestamp("launch_date"),
  createdAt: timestamp("created_at").defaultNow()
});

// Investments schema
export const investments = pgTable("investments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
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
  lastUpdated: timestamp("last_updated").defaultNow()
});

// Transactions schema
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  type: text("type"), // deposit, withdrawal, investment, roi_credit
  reference: text("reference"),
  status: text("status").default("completed"),
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
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" })
}));

export const kycSubmissionsRelations = relations(kycSubmissions, ({ one }) => ({
  user: one(users, {
    fields: [kycSubmissions.userId],
    references: [users.id]
  })
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  investments: many(investments)
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
  user: one(users, {
    fields: [investments.userId],
    references: [users.id]
  }),
  project: one(projects, {
    fields: [investments.projectId],
    references: [projects.id]
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

// Create schemas for insertions
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertKycSubmissionSchema = createInsertSchema(kycSubmissions).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true
});

export const insertProjectSchema = createInsertSchema(projects).omit({
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

// Export the property schema with a new name to match the import in admin-routes.ts
export const insertPropertySchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type KycSubmission = typeof kycSubmissions.$inferSelect;
export type InsertKycSubmission = z.infer<typeof insertKycSubmissionSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;