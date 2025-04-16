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

// User accreditation level enum
export const accreditationLevelEnum = pgEnum("accreditation_level", [
  "non_accredited",
  "accredited",
  "qualified_purchaser"
]);

// User role enum
export const userRoleEnum = pgEnum("user_role", [
  "user",
  "admin",
  "super_admin"
]);

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  role: userRoleEnum("role").default("user"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  kycStatus: kycStatusEnum("kyc_status").default("not_started"),
  kycDocuments: jsonb("kyc_documents"),
  kycRejectionReason: text("kyc_rejection_reason"),
  kycSubmittedAt: timestamp("kyc_submitted_at"),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  accreditationLevel: accreditationLevelEnum("accreditation_level").default("non_accredited"),
  accreditationDocuments: jsonb("accreditation_documents"),
  accreditationVerifiedAt: timestamp("accreditation_verified_at"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  investmentPreferences: jsonb("investment_preferences"), // Types of properties interested in
  totalInvested: integer("total_invested").default(0),
  totalEarnings: integer("total_earnings").default(0),
  rewardsPoints: integer("rewards_points").default(0),
  badges: jsonb("badges"), // Achievement badges
  referralCode: text("referral_code"),
  referredBy: integer("referred_by"), // User ID who referred this user
  referralBonus: integer("referral_bonus").default(0),
  notificationPreferences: jsonb("notification_preferences"),
  directMessageEnabled: boolean("direct_message_enabled").default(true),
  lastActiveAt: timestamp("last_active_at"),
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
  "land",
]);

// Investment tier enum
export const investmentTierEnum = pgEnum("investment_tier", [
  "starter", // For non-accredited investors, lowest minimum
  "growth",  // Mid-level investment tier
  "premium", // Higher minimum, higher returns
  "elite",   // Accredited investors only, highest returns
]);

// Property schema
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  type: propertyTypeEnum("type").notNull(),
  imageUrl: text("image_url").notNull(),
  imageGallery: jsonb("image_gallery"), // Array of additional images
  videoUrl: text("video_url"), // Virtual tour or promotional video
  tier: investmentTierEnum("tier").default("starter"), // Investment tier
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
  amenities: jsonb("amenities"), // Property amenities
  developer: text("developer"), // Property developer name
  developerProfile: text("developer_profile"), // Developer history and track record
  riskLevel: text("risk_level"), // Low, Medium, High
  projectedCashflow: jsonb("projected_cashflow"), // Monthly/yearly projections
  documents: jsonb("documents"), // Due diligence documents
  latitude: decimal("latitude"), // For map integration
  longitude: decimal("longitude"), // For map integration
  accreditedOnly: boolean("accredited_only").default(false), // Whether only accredited investors can invest
  sustainabilityFeatures: jsonb("sustainability_features"), // Green features of the property
  constructionUpdates: jsonb("construction_updates"), // For properties under development
  completionDate: timestamp("completion_date"), // Expected or actual completion date
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
  monthlyReturns: jsonb("monthly_returns"), // Monthly earnings data
  reinvestmentOption: boolean("reinvestment_option").default(false), // Whether earnings are automatically reinvested
  transactionId: text("transaction_id"), // Reference to payment transaction
  certificateUrl: text("certificate_url"), // URL to download investment certificate
  notes: text("notes"), // User notes about this investment
  lastValuationDate: timestamp("last_valuation_date"), // When was the investment last valued
  performanceHistory: jsonb("performance_history"), // Historical performance data
  maturityDate: timestamp("maturity_date"), // When the investment matures
  exitOptions: jsonb("exit_options"), // Available exit options
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

// Direct message schema
export const directMessages = pgTable("direct_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  recipientId: integer("recipient_id").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
  attachments: jsonb("attachments"),
});

export const insertDirectMessageSchema = createInsertSchema(directMessages).omit({
  id: true,
  isRead: true,
  readAt: true,
  createdAt: true,
});

// Content categories for educational resources
export const contentCategoryEnum = pgEnum("content_category", [
  "beginner_guides",
  "investment_strategies",
  "market_analysis",
  "tax_planning",
  "legal_considerations",
  "case_studies",
  "webinars",
  "video_tutorials"
]);

// Educational resources schema
export const educationalResources = pgTable("educational_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: contentCategoryEnum("category").notNull(),
  authorId: integer("author_id"), // Can be null for system-generated content
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  resourceUrl: text("resource_url"), // For downloadable content
  readTimeMinutes: integer("read_time_minutes"),
  publishedAt: timestamp("published_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  likeCount: integer("like_count").default(0),
  viewCount: integer("view_count").default(0),
  tags: jsonb("tags"),
  isPreview: boolean("is_preview").default(false), // If this content is available without full registration
  isPremium: boolean("is_premium").default(false), // If this requires a premium account
});

export const insertEducationalResourceSchema = createInsertSchema(educationalResources).omit({
  id: true,
  likeCount: true,
  viewCount: true,
  publishedAt: true,
  updatedAt: true,
});

// Payment methods schema
export const paymentMethodEnum = pgEnum("payment_method", [
  "bank_transfer",
  "credit_card",
  "debit_card",
  "paystack",
  "flutterwave",
  "wallet"
]);

// Payment transactions schema
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  investmentId: integer("investment_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").default("NGN"),
  method: paymentMethodEnum("method").notNull(),
  status: text("status").notNull(), // pending, successful, failed, reversed
  reference: text("reference").notNull(),
  gatewayReference: text("gateway_reference"),
  gatewayResponse: text("gateway_response"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  metaData: jsonb("meta_data"),
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// User Achievement badges
export const achievementBadges = pgTable("achievement_badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url").notNull(),
  points: integer("points").default(0),
  criteria: text("criteria").notNull(), // E.g., "Invest in 5 properties"
  level: integer("level").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAchievementBadgeSchema = createInsertSchema(achievementBadges).omit({
  id: true,
  createdAt: true,
});

// User achievements (which badges they've earned)
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  displayed: boolean("displayed").default(true), // Whether to display on profile
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true,
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

export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = z.infer<typeof insertDirectMessageSchema>;

export type EducationalResource = typeof educationalResources.$inferSelect;
export type InsertEducationalResource = z.infer<typeof insertEducationalResourceSchema>;

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;

export type AchievementBadge = typeof achievementBadges.$inferSelect;
export type InsertAchievementBadge = z.infer<typeof insertAchievementBadgeSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
