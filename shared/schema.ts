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
  // Multiple media items stored as JSON array
  additionalImages: text("additional_images"), // JSON string array of image URLs
  videoUrl: text("video_url"), // URL to a video tour or promo
  virtualTourUrl: text("virtual_tour_url"), // URL to a 360 virtual tour
  
  // Financial details
  targetReturn: decimal("target_return").notNull(),
  minimumInvestment: integer("minimum_investment").notNull(),
  term: integer("term").notNull(), // in months
  totalFunding: integer("total_funding").notNull(),
  currentFunding: integer("current_funding").notNull(),
  
  // Project metrics
  numberOfInvestors: integer("number_of_investors").default(0),
  size: text("size"), // Property size in sq ft/meters
  builtYear: text("built_year"),
  occupancy: text("occupancy"), // Occupancy rate for rental properties
  cashFlow: text("cash_flow"), // Expected monthly cash flow
  daysLeft: integer("days_left").default(30), // Days left in funding period
  
  // Detailed location information
  address: text("address"), // Full address
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  latitude: decimal("latitude"), // For map display
  longitude: decimal("longitude"), // For map display
  neighborhoodDescription: text("neighborhood_description"), // Details about the area
  
  // Developer/Sponsor information
  developerName: text("developer_name"), // Name of the property developer
  developerDescription: text("developer_description"), // Developer background & track record
  developerLogoUrl: text("developer_logo_url"), // Developer's logo
  
  // Project timeline
  acquisitionDate: timestamp("acquisition_date"), // When the property was acquired
  constructionStartDate: timestamp("construction_start_date"),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  
  // Due diligence
  documentUrls: text("document_urls"), // JSON string array of document URLs
  riskRating: text("risk_rating"), // Low, Medium, High risk assessment
  riskDescription: text("risk_description"), // Detailed risk explanation
  
  // Detailed financial projections
  projectedIrr: decimal("projected_irr"), // Internal Rate of Return
  projectedCashYield: decimal("projected_cash_yield"), // Annual cash yield
  projectedAppreciation: decimal("projected_appreciation"), // Expected appreciation
  projectedTotalReturn: decimal("projected_total_return"), // Total return over investment period
  
  // Property features & amenities
  features: text("features"), // JSON string array of property features
  amenities: text("amenities"), // JSON string array of property amenities
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
