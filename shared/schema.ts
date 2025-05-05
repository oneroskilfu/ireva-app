import { pgTable, serial, text, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export enum UserRole {
  INVESTOR = "investor",
  ADMIN = "admin",
  SUPERADMIN = "superadmin",
}

// KYC status enum
export enum KycStatus {
  NOT_STARTED = "not_started",
  SUBMITTED = "submitted",
  VERIFIED = "verified",
  REJECTED = "rejected"
}

// Type for KYC documents
export type KycDocument = {
  idType: string;
  idNumber: string;
  idImageUrl: string;
  addressProofUrl?: string;
};

// Users table - simplified for initial implementation
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default(UserRole.INVESTOR),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  phoneNumber: text("phone_number"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  // We've removed fields that caused database errors
  // Additional fields can be added via migrations later
});

// Create insert schema
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true
});

// Create insert type
export type InsertUser = z.infer<typeof insertUserSchema>;

// Create select type
export type User = typeof users.$inferSelect;