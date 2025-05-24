/**
 * KYC/AML Schema Definitions
 * 
 * This file defines database tables and enums related to KYC verification
 * and AML compliance functionality within the iREVA platform.
 */

import { pgTable, uuid, text, boolean, timestamp, integer, json } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { tenantTable } from './schema-tenant-scoped';

/**
 * KYC verification status values
 */
export const KycStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REQUIRES_ADDITIONAL_INFO: 'REQUIRES_ADDITIONAL_INFO',
  EXPIRED: 'EXPIRED'
} as const;

export type KycStatusEnum = typeof KycStatus[keyof typeof KycStatus];

/**
 * KYC verification levels
 */
export const KycLevel = {
  BASIC: 'BASIC',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED'
} as const;

export type KycLevelEnum = typeof KycLevel[keyof typeof KycLevel];

/**
 * Document status values
 */
export const DocumentStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED'
} as const;

export type DocumentStatusEnum = typeof DocumentStatus[keyof typeof DocumentStatus];

/**
 * Document types
 */
export const DocumentType = {
  PASSPORT: 'PASSPORT',
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  ID_CARD: 'ID_CARD',
  UTILITY_BILL: 'UTILITY_BILL',
  BANK_STATEMENT: 'BANK_STATEMENT',
  OTHER: 'OTHER'
} as const;

export type DocumentTypeEnum = typeof DocumentType[keyof typeof DocumentType];

/**
 * Risk levels
 */
export const RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

export type RiskLevelEnum = typeof RiskLevel[keyof typeof RiskLevel];

/**
 * Risk flag types
 */
export const FlagType = {
  DOCUMENT_QUALITY: 'DOCUMENT_QUALITY',
  DOCUMENT_MISMATCH: 'DOCUMENT_MISMATCH',
  SANCTIONS_LIST: 'SANCTIONS_LIST',
  PEP: 'PEP',
  HIGH_RISK_COUNTRY: 'HIGH_RISK_COUNTRY',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  IDENTITY_VERIFICATION_FAILED: 'IDENTITY_VERIFICATION_FAILED',
  UNUSUAL_TRANSACTION: 'UNUSUAL_TRANSACTION',
  LOCATION_MISMATCH: 'LOCATION_MISMATCH',
  OTHER: 'OTHER'
} as const;

export type FlagTypeEnum = typeof FlagType[keyof typeof FlagType];

/**
 * KYC Verification table (tenant-scoped)
 */
export const kycVerifications = tenantTable('kyc_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull(),
  status: text('status')
    .notNull()
    .default(KycStatus.NOT_STARTED),
  level: text('level')
    .notNull()
    .default(KycLevel.BASIC),
  riskLevel: text('risk_level')
    .notNull()
    .default(RiskLevel.LOW),
  lastVerifiedAt: timestamp('last_verified_at'),
  expiresAt: timestamp('expires_at'),
  rejectionReason: text('rejection_reason'),
  additionalInfoRequired: text('additional_info_required'),
  reviewedBy: integer('reviewed_by'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * KYC Document table (tenant-scoped)
 */
export const kycDocuments = tenantTable('kyc_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  kycVerificationId: uuid('kyc_verification_id')
    .notNull()
    .references(() => kycVerifications.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  status: text('status')
    .notNull()
    .default(DocumentStatus.PENDING),
  documentNumber: text('document_number'),
  issuingCountry: text('issuing_country'),
  issuingAuthority: text('issuing_authority'),
  issueDate: timestamp('issue_date'),
  expiryDate: timestamp('expiry_date'),
  fileHash: text('file_hash').notNull(), // Store file hash for integrity
  fileUrl: text('file_url').notNull(), // Encrypted URL or path
  fileEncryptionKey: text('file_encryption_key'), // Encryption key for the file
  reviewedBy: integer('reviewed_by'),
  rejectionReason: text('rejection_reason'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Risk Flags table (tenant-scoped)
 */
export const riskFlags = tenantTable('risk_flags', {
  id: uuid('id').defaultRandom().primaryKey(),
  kycVerificationId: uuid('kyc_verification_id')
    .notNull()
    .references(() => kycVerifications.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull(),
  type: text('type').notNull(),
  severity: text('severity').notNull(),
  description: text('description').notNull(),
  evidence: json('evidence'),
  status: text('status').notNull().default('open'),
  resolutionNotes: text('resolution_notes'),
  resolvedBy: integer('resolved_by'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Screening Results table (tenant-scoped)
 */
export const screeningResults = tenantTable('screening_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  kycVerificationId: uuid('kyc_verification_id')
    .notNull()
    .references(() => kycVerifications.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull(),
  screeningType: text('screening_type').notNull(), // 'pep', 'sanctions', etc.
  inputData: json('input_data'),
  matchStatus: text('match_status').notNull(), // 'match', 'potential_match', 'no_match'
  matchDetails: json('match_details'),
  externalReferenceId: text('external_reference_id'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

/**
 * Suspicious Transaction Monitoring table (tenant-scoped)
 */
export const suspiciousTransactions = tenantTable('suspicious_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  transactionId: uuid('transaction_id').notNull(),
  userId: integer('user_id').notNull(),
  riskScore: integer('risk_score').notNull(),
  triggerRules: json('trigger_rules'),
  status: text('status').notNull().default('pending_review'),
  approved: boolean('approved'),
  reviewNotes: text('review_notes'),
  reviewedBy: integer('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// Relations between tables
export const kycVerificationsRelations = relations(kycVerifications, ({ many }) => ({
  documents: many(kycDocuments),
  riskFlags: many(riskFlags),
  screeningResults: many(screeningResults)
}));

export const kycDocumentsRelations = relations(kycDocuments, ({ one }) => ({
  verification: one(kycVerifications, {
    fields: [kycDocuments.kycVerificationId],
    references: [kycVerifications.id]
  })
}));

export const riskFlagsRelations = relations(riskFlags, ({ one }) => ({
  verification: one(kycVerifications, {
    fields: [riskFlags.kycVerificationId],
    references: [kycVerifications.id]
  })
}));

export const screeningResultsRelations = relations(screeningResults, ({ one }) => ({
  verification: one(kycVerifications, {
    fields: [screeningResults.kycVerificationId],
    references: [kycVerifications.id]
  })
}));

// Define insert schemas using drizzle-zod
export const insertKycVerificationSchema = createInsertSchema(kycVerifications)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    tenantId: true // Omit tenantId as it will be added by middleware
  });

export const insertKycDocumentSchema = createInsertSchema(kycDocuments)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    tenantId: true // Omit tenantId as it will be added by middleware
  });

export const insertRiskFlagSchema = createInsertSchema(riskFlags)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    tenantId: true // Omit tenantId as it will be added by middleware
  });

export const insertScreeningResultSchema = createInsertSchema(screeningResults)
  .omit({
    id: true,
    createdAt: true,
    tenantId: true // Omit tenantId as it will be added by middleware
  });

export const insertSuspiciousTransactionSchema = createInsertSchema(suspiciousTransactions)
  .omit({
    id: true,
    createdAt: true,
    tenantId: true // Omit tenantId as it will be added by middleware
  });

// Export types
export type KycVerification = typeof kycVerifications.$inferSelect;
export type InsertKycVerification = z.infer<typeof insertKycVerificationSchema>;

export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;

export type RiskFlag = typeof riskFlags.$inferSelect;
export type InsertRiskFlag = z.infer<typeof insertRiskFlagSchema>;

export type ScreeningResult = typeof screeningResults.$inferSelect;
export type InsertScreeningResult = z.infer<typeof insertScreeningResultSchema>;

export type SuspiciousTransaction = typeof suspiciousTransactions.$inferSelect;
export type InsertSuspiciousTransaction = z.infer<typeof insertSuspiciousTransactionSchema>;