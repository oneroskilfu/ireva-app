import { z } from 'zod';
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

// KYC status options
export enum KycStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

// KYC submissions table schema
export const kycSubmissions = pgTable('kyc_submissions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  fullName: text('full_name').notNull(),
  address: text('address').notNull(),
  idType: text('id_type').notNull(),
  idNumber: text('id_number').notNull(),
  selfieUrl: text('selfie_url').notNull(),
  idDocUrl: text('id_doc_url').notNull(),
  status: text('status').notNull().default(KycStatus.PENDING),
  submittedAt: timestamp('submitted_at').defaultNow(),
  verifiedAt: timestamp('verified_at'),
  rejectionReason: text('rejection_reason'),
  verifiedBy: integer('verified_by'),
  notes: text('notes'),
});

// Define schemas for validation
export const selectKycSchema = createSelectSchema(kycSubmissions);
export const insertKycSchema = createInsertSchema(kycSubmissions, {
  userId: z.number(),
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  address: z.string().min(3, "Address must be at least 3 characters"),
  idType: z.string(),
  idNumber: z.string().min(3, "ID number must be at least 3 characters"),
  selfieUrl: z.string(),
  idDocUrl: z.string(),
}).omit({ 
  id: true, 
  submittedAt: true, 
  verifiedAt: true, 
  rejectionReason: true, 
  verifiedBy: true,
  notes: true
});

// Define types
export type KycSubmission = typeof kycSubmissions.$inferSelect;
export type InsertKycSubmission = z.infer<typeof insertKycSchema>;
export type KycSubmissionWithUser = KycSubmission & {
  user: {
    username: string;
    email: string;
  }
};