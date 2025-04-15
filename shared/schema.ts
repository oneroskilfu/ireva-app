import { pgTable, text, serial, integer, boolean, timestamp, decimal, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// KYC status enum
export const kycStatusEnum = pgEnum("kyc_status", [
  "not_started",
  "pending",
  "verified",
  "rejected"
]);

// Verification method enum
export const verificationMethodEnum = pgEnum("verification_method", [
  "otp",
  "email",
  "document"
]);

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  kycStatus: kycStatusEnum("kyc_status").default("not_started"),
  kycDocuments: jsonb("kyc_documents"),
  kycRejectionReason: text("kyc_rejection_reason"),
  kycSubmittedAt: timestamp("kyc_submitted_at"),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
});

export const phoneVerificationSchema = z.object({
  phoneNumber: z.string().min(10).max(15),
  code: z.string().length(6),
});

export const kycDocumentSchema = z.object({
  idType: z.enum(["national_id", "drivers_license", "passport", "voters_card"]),
  idNumber: z.string().min(3),
  frontImage: z.string(),
  backImage: z.string().optional(),
  selfieImage: z.string(),
  addressProofImage: z.string().optional(),
  addressProofType: z.enum(["utility_bill", "bank_statement", "tax_document", "rental_agreement"]).optional(),
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
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
});

// Notification type enum
export const notificationTypeEnum = pgEnum("notification_type", [
  "system",
  "investment",
  "property",
  "kyc",
  "payment",
  "social",
  "forum"
]);

// Notification schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
  metadata: jsonb("metadata"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  readAt: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PhoneVerification = z.infer<typeof phoneVerificationSchema>;
export type KycDocument = z.infer<typeof kycDocumentSchema>;
export type KycStatus = "not_started" | "pending" | "verified" | "rejected";
export type VerificationMethod = "otp" | "email" | "document";
export type NotificationType = "system" | "investment" | "property" | "kyc" | "payment" | "social" | "forum";
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
