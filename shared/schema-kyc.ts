import { pgTable, text, boolean, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { relations } from 'drizzle-orm';
import { z } from 'zod';
import { users } from './schema';

/**
 * KYC/AML Compliance Schema
 * 
 * Database schema for storing KYC (Know Your Customer) and AML (Anti-Money Laundering)
 * related data with proper encryption markers and security features.
 */

// KYC Status Enum
export const KycStatusEnum = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUIRES_ADDITIONAL_INFO: 'requires_additional_info',
  EXPIRED: 'expired',
} as const;

// KYC Verification Level Enum
export const KycLevelEnum = {
  BASIC: 'basic',         // Email verification only
  STANDARD: 'standard',   // ID verification
  ENHANCED: 'enhanced',   // ID + Address verification
  PREMIUM: 'premium',     // Full KYC with liveness detection
  BUSINESS: 'business',   // Business verification (for entities)
} as const;

// Document Type Enum
export const DocumentTypeEnum = {
  ID_CARD: 'id_card',
  PASSPORT: 'passport',
  DRIVERS_LICENSE: 'drivers_license',
  UTILITY_BILL: 'utility_bill',
  BANK_STATEMENT: 'bank_statement',
  PROOF_OF_ADDRESS: 'proof_of_address',
  COMPANY_REGISTRATION: 'company_registration',
  TAX_ID: 'tax_id',
  ARTICLES_OF_INCORPORATION: 'articles_of_incorporation',
  OTHER: 'other',
} as const;

// Document Status Enum
export const DocumentStatusEnum = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const;

// KYC Verification Method Enum
export const VerificationMethodEnum = {
  MANUAL: 'manual',
  AUTOMATED: 'automated',
  THIRD_PARTY: 'third_party',
} as const;

// Risk Level Enum
export const RiskLevelEnum = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Flag Type Enum
export const FlagTypeEnum = {
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  IDENTITY_MISMATCH: 'identity_mismatch',
  DOCUMENT_TAMPERING: 'document_tampering',
  LOCATION_RISK: 'location_risk',
  TRANSACTION_ANOMALY: 'transaction_anomaly',
  PEP: 'politically_exposed_person',
  SANCTION_LIST: 'sanction_list',
  WATCH_LIST: 'watch_list',
  OTHER: 'other',
} as const;

// KYC Table - Store user verification status and overall KYC information
export const kycVerifications = pgTable('kyc_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').$type<keyof typeof KycStatusEnum>().notNull().default(KycStatusEnum.NOT_STARTED),
  level: text('level').$type<keyof typeof KycLevelEnum>().notNull().default(KycLevelEnum.BASIC),
  riskLevel: text('risk_level').$type<keyof typeof RiskLevelEnum>().default(RiskLevelEnum.LOW),
  expiresAt: timestamp('expires_at'),
  lastVerifiedAt: timestamp('last_verified_at'),
  verificationMethod: text('verification_method').$type<keyof typeof VerificationMethodEnum>(),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  rejectionReason: text('rejection_reason'),
  additionalInfoRequired: text('additional_info_required'),
  notes: text('notes'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// KYC Relations
export const kycVerificationsRelations = relations(kycVerifications, ({ one, many }) => ({
  user: one(users, {
    fields: [kycVerifications.userId],
    references: [users.id],
  }),
  documents: many(kycDocuments),
  verificationAttempts: many(kycVerificationAttempts),
  flags: many(kycRiskFlags),
}));

// KYC Documents Table - Securely store document information with encrypted paths
export const kycDocuments = pgTable('kyc_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  kycVerificationId: uuid('kyc_verification_id').notNull().references(() => kycVerifications.id, { onDelete: 'cascade' }),
  type: text('type').$type<keyof typeof DocumentTypeEnum>().notNull(),
  documentNumber: text('document_number'),
  issuingCountry: text('issuing_country'),
  issuingAuthority: text('issuing_authority'),
  issueDate: timestamp('issue_date'),
  expiryDate: timestamp('expiry_date'),
  
  // Secure storage details (encrypted at rest)
  encryptedPath: text('encrypted_path').notNull(),
  encryptionKeyId: text('encryption_key_id').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  md5Hash: text('md5_hash').notNull(),
  
  // Verification status
  status: text('status').$type<keyof typeof DocumentStatusEnum>().notNull().default(DocumentStatusEnum.PENDING),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  rejectionReason: text('rejection_reason'),
  verifiedAt: timestamp('verified_at'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// KYC Document Relations
export const kycDocumentsRelations = relations(kycDocuments, ({ one }) => ({
  kycVerification: one(kycVerifications, {
    fields: [kycDocuments.kycVerificationId],
    references: [kycVerifications.id],
  }),
}));

// KYC Verification Attempts - Track third-party API verification attempts
export const kycVerificationAttempts = pgTable('kyc_verification_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  kycVerificationId: uuid('kyc_verification_id').notNull().references(() => kycVerifications.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),  // e.g., 'trulioo', 'smile_identity'
  requestId: text('request_id').notNull(),
  requestType: text('request_type').notNull(), // e.g., 'identity_verification', 'document_verification'
  requestData: jsonb('request_data').$type<Record<string, any>>(),
  responseData: jsonb('response_data').$type<Record<string, any>>(),
  responseCode: text('response_code'),
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// KYC Verification Attempts Relations
export const kycVerificationAttemptsRelations = relations(kycVerificationAttempts, ({ one }) => ({
  kycVerification: one(kycVerifications, {
    fields: [kycVerificationAttempts.kycVerificationId],
    references: [kycVerifications.id],
  }),
}));

// KYC Risk Flags - Track potential compliance risks
export const kycRiskFlags = pgTable('kyc_risk_flags', {
  id: uuid('id').defaultRandom().primaryKey(),
  kycVerificationId: uuid('kyc_verification_id').notNull().references(() => kycVerifications.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<keyof typeof FlagTypeEnum>().notNull(),
  severity: text('severity').$type<keyof typeof RiskLevelEnum>().notNull().default(RiskLevelEnum.MEDIUM),
  description: text('description').notNull(),
  evidence: jsonb('evidence').$type<Record<string, any>>(),
  status: text('status').notNull().default('open'), // 'open', 'investigating', 'resolved', 'dismissed'
  resolvedBy: integer('resolved_by').references(() => users.id),
  resolutionNotes: text('resolution_notes'),
  resolutionDate: timestamp('resolution_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// KYC Risk Flags Relations
export const kycRiskFlagsRelations = relations(kycRiskFlags, ({ one }) => ({
  kycVerification: one(kycVerifications, {
    fields: [kycRiskFlags.kycVerificationId],
    references: [kycVerifications.id],
  }),
  user: one(users, {
    fields: [kycRiskFlags.userId],
    references: [users.id],
  }),
}));

// AML Transaction Monitoring
export const amlTransactionMonitoring = pgTable('aml_transaction_monitoring', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  transactionId: text('transaction_id').notNull(),
  transactionType: text('transaction_type').notNull(), // 'deposit', 'withdrawal', 'investment'
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  sourceType: text('source_type'), // 'bank_account', 'credit_card', 'crypto_wallet'
  sourceIdentifier: text('source_identifier'),
  destinationType: text('destination_type'),
  destinationIdentifier: text('destination_identifier'),
  riskScore: integer('risk_score'),
  isHighRisk: boolean('is_high_risk').default(false),
  isSuspicious: boolean('is_suspicious').default(false),
  anomalyDetails: jsonb('anomaly_details').$type<Record<string, any>>(),
  isReviewed: boolean('is_reviewed').default(false),
  reviewedBy: integer('reviewed_by').references(() => users.id),
  reviewNotes: text('review_notes'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// AML Transaction Monitoring Relations
export const amlTransactionMonitoringRelations = relations(amlTransactionMonitoring, ({ one }) => ({
  user: one(users, {
    fields: [amlTransactionMonitoring.userId],
    references: [users.id],
  }),
}));

// Insert schemas using drizzle-zod
export const insertKycVerificationSchema = createInsertSchema(kycVerifications, {
  metadata: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertKycVerificationAttemptSchema = createInsertSchema(kycVerificationAttempts, {
  requestData: z.record(z.any()).optional(),
  responseData: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true });

export const insertKycRiskFlagSchema = createInsertSchema(kycRiskFlags, {
  evidence: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertAmlTransactionMonitoringSchema = createInsertSchema(amlTransactionMonitoring, {
  anomalyDetails: z.record(z.any()).optional(),
}).omit({ id: true, createdAt: true });

// Export types
export type KycVerification = typeof kycVerifications.$inferSelect;
export type InsertKycVerification = z.infer<typeof insertKycVerificationSchema>;

export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;

export type KycVerificationAttempt = typeof kycVerificationAttempts.$inferSelect;
export type InsertKycVerificationAttempt = z.infer<typeof insertKycVerificationAttemptSchema>;

export type KycRiskFlag = typeof kycRiskFlags.$inferSelect;
export type InsertKycRiskFlag = z.infer<typeof insertKycRiskFlagSchema>;

export type AmlTransactionMonitoring = typeof amlTransactionMonitoring.$inferSelect;
export type InsertAmlTransactionMonitoring = z.infer<typeof insertAmlTransactionMonitoringSchema>;