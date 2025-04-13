import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
// KYC status enum
export const kycStatusEnum = pgEnum("kyc_status", [
  "not_started",
  "pending",
  "verified",
  "rejected"
]);

// MFA method enum
export const mfaMethodEnum = pgEnum("mfa_method", [
  "none",
  "sms",
  "email",
  "app"
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  walletBalance: integer("wallet_balance").default(0).notNull(),
  phoneNumber: text("phone_number"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankAccountName: text("bank_account_name"),
  kycStatus: kycStatusEnum("kyc_status").default("not_started").notNull(),
  kycIdType: text("kyc_id_type"),
  kycIdNumber: text("kyc_id_number"),
  kycVerificationDate: timestamp("kyc_verification_date"),
  // MFA fields
  mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
  mfaPrimaryMethod: mfaMethodEnum("mfa_primary_method").default("none").notNull(),
  mfaSecondaryMethod: mfaMethodEnum("mfa_secondary_method").default("none"),
  mfaSecret: text("mfa_secret"), // For TOTP (app-based authentication)
  mfaBackupCodes: text("mfa_backup_codes"), // JSON string of backup codes
  mfaLastVerified: timestamp("mfa_last_verified"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  isAdmin: true,
  phoneNumber: true,
  bankName: true,
  bankAccountNumber: true,
  bankAccountName: true,
  walletBalance: true,
  kycStatus: true,
  kycIdType: true,
  kycIdNumber: true,
  kycVerificationDate: true,
  // Include MFA fields
  mfaEnabled: true,
  mfaPrimaryMethod: true,
  mfaSecondaryMethod: true,
  mfaSecret: true,
  mfaBackupCodes: true,
  mfaLastVerified: true,
});

// Property type enum
export const propertyTypeEnum = pgEnum("property_type", [
  "residential",
  "commercial",
  "industrial",
  "mixed-use",
]);

// Property schema
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  type: propertyTypeEnum("type").notNull(),
  imageUrl: text("image_url").notNull(),
  targetReturn: decimal("target_return").notNull(),
  minimumInvestment: integer("minimum_investment").notNull(),
  term: integer("term").notNull(), // in months
  totalFunding: integer("total_funding").notNull(),
  currentFunding: integer("current_funding").notNull(),
  numberOfInvestors: integer("number_of_investors").default(0),
  size: text("size"),
  builtYear: text("built_year"),
  occupancy: text("occupancy"),
  cashFlow: text("cash_flow"),
  daysLeft: integer("days_left").default(30),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
});

// Investment status enum
export const investmentStatusEnum = pgEnum("investment_status", [
  "active",
  "completed",
  "pending",
]);

// Investment schema
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  propertyId: integer("property_id").notNull(),
  amount: integer("amount").notNull(),
  date: timestamp("date").defaultNow(),
  status: investmentStatusEnum("status").default("active"),
  currentValue: integer("current_value").notNull(),
  completedDate: timestamp("completed_date"),
  earnings: integer("earnings").default(0),
  returns: integer("returns").default(0),
  paymentReference: text("payment_reference"),
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
