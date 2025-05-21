import { relations } from 'drizzle-orm';
import { 
  pgTable, 
  serial, 
  integer, 
  varchar, 
  timestamp, 
  decimal, 
  text,
  boolean,
  unique,
  index,
  primaryKey
} from 'drizzle-orm/pg-core';
import { users, wallets, investments, properties } from './schema';

/**
 * Double-Entry Ledger System
 * 
 * This schema implements a financial-grade double-entry bookkeeping system where
 * every transaction must balance (debits = credits) and all financial movements
 * are permanently recorded with multiple integrity checks.
 */

// Transaction types
export type TransactionType = 
  | 'deposit'           // User deposits funds into the platform
  | 'withdrawal'        // User withdraws funds from the platform
  | 'investment'        // User invests in a property
  | 'roi_distribution'  // ROI is distributed to investor
  | 'fee'               // Platform fee
  | 'refund'            // Refund to user
  | 'adjustment'        // Manual adjustment by admin
  | 'transfer';         // Transfer between accounts

// Account types
export type AccountType =
  | 'user_wallet'       // User's wallet
  | 'platform_revenue'  // Platform revenue account
  | 'property_funding'  // Property funding account
  | 'escrow'            // Funds in escrow
  | 'fee_collection'    // Fee collection account
  | 'investment_pool'   // Investment pool account
  | 'roi_reserve';      // ROI reserve account

// Status types
export type TransactionStatus =
  | 'pending'           // Transaction is pending processing
  | 'completed'         // Transaction is completed
  | 'failed'            // Transaction failed
  | 'cancelled'         // Transaction was cancelled
  | 'disputed';         // Transaction is under dispute

// Chart of Accounts table
// Defines all possible accounts in the system
export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  accountType: varchar('account_type', { length: 50 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // Optional reference to a user if this is a user account
  userId: integer('user_id').references(() => users.id),
  // Optional reference to a property if this is a property account
  propertyId: integer('property_id').references(() => properties.id),
  // Balance is derived from journal entries and should not be updated directly
  // It's stored here for quick reference and validation only
  currentBalance: decimal('current_balance', { precision: 18, scale: 2 }).default('0').notNull(),
  // Currency for this account
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
}, (table) => {
  return {
    // Make sure account type + user ID combinations are unique
    userAccountTypeIdx: unique().on(table.accountType, table.userId),
    // Make sure account type + property ID combinations are unique
    propertyAccountTypeIdx: unique().on(table.accountType, table.propertyId),
  };
});

// Ledger transactions table
// Master record for each transaction in the system
export const ledgerTransactions = pgTable('ledger_transactions', {
  id: serial('id').primaryKey(),
  // Transaction reference number (human-readable)
  referenceNumber: varchar('reference_number', { length: 50 }).notNull().unique(),
  // Type of transaction
  transactionType: varchar('transaction_type', { length: 50 }).notNull(),
  // Status of the transaction
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  // Transaction amount (sum of all entries - must equal zero for valid transaction)
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  // Transaction currency
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  // Transaction date/time
  transactionDate: timestamp('transaction_date').defaultNow().notNull(),
  // Description of the transaction
  description: text('description'),
  // Optional metadata for the transaction (JSON)
  metadata: text('metadata'),
  // User who initiated the transaction (if applicable)
  initiatedBy: integer('initiated_by').references(() => users.id),
  // External payment reference (if applicable)
  externalReference: varchar('external_reference', { length: 100 }),
  // IP address of the requester
  ipAddress: varchar('ip_address', { length: 45 }),
  // Timestamp for when transaction was created
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Timestamp for when transaction was last updated
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // Optional error message if transaction failed
  errorMessage: text('error_message'),
  // Reconciliation status
  isReconciled: boolean('is_reconciled').default(false).notNull()
}, (table) => {
  return {
    referenceNumberIdx: index('idx_reference_number').on(table.referenceNumber),
    transactionTypeIdx: index('idx_transaction_type').on(table.transactionType),
    transactionDateIdx: index('idx_transaction_date').on(table.transactionDate),
    statusIdx: index('idx_status').on(table.status),
    initiatedByIdx: index('idx_initiated_by').on(table.initiatedBy),
  };
});

// Journal entries table
// Every transaction consists of at least two journal entries (debit and credit)
// The sum of all entries for a transaction must equal zero
export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  // Reference to the transaction
  transactionId: integer('transaction_id').notNull().references(() => ledgerTransactions.id),
  // Account affected by this entry
  accountId: integer('account_id').notNull().references(() => accounts.id),
  // Amount of the entry (positive for credit, negative for debit)
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  // Description of the entry
  description: text('description'),
  // Timestamp for when entry was created
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Running balance for account after this entry (for quick reference)
  runningBalance: decimal('running_balance', { precision: 18, scale: 2 }).notNull()
}, (table) => {
  return {
    transactionIdIdx: index('idx_transaction_id').on(table.transactionId),
    accountIdIdx: index('idx_account_id').on(table.accountId),
  };
});

// Reconciliation records table
// For tracking reconciliation of accounts
export const reconciliations = pgTable('reconciliations', {
  id: serial('id').primaryKey(),
  // Account being reconciled
  accountId: integer('account_id').notNull().references(() => accounts.id),
  // User who performed the reconciliation
  performedBy: integer('performed_by').notNull().references(() => users.id),
  // Date/time of reconciliation
  reconciliationDate: timestamp('reconciliation_date').defaultNow().notNull(),
  // Expected balance
  expectedBalance: decimal('expected_balance', { precision: 18, scale: 2 }).notNull(),
  // Actual balance found
  actualBalance: decimal('actual_balance', { precision: 18, scale: 2 }).notNull(),
  // Discrepancy amount
  discrepancy: decimal('discrepancy', { precision: 18, scale: 2 }).notNull(),
  // Notes about the reconciliation
  notes: text('notes'),
  // Status of the reconciliation
  status: varchar('status', { length: 20 }).notNull(),
  // Resolution action taken (if any)
  resolutionAction: text('resolution_action')
});

// Account balance history table
// For tracking changes to account balances over time
export const accountBalanceHistory = pgTable('account_balance_history', {
  id: serial('id').primaryKey(),
  // Account the balance is for
  accountId: integer('account_id').notNull().references(() => accounts.id),
  // Date/time of the balance record
  recordDate: timestamp('record_date').defaultNow().notNull(),
  // Balance at that point in time
  balance: decimal('balance', { precision: 18, scale: 2 }).notNull(),
  // Last transaction that affected this balance
  lastTransactionId: integer('last_transaction_id').references(() => ledgerTransactions.id)
}, (table) => {
  return {
    accountDateIdx: unique().on(table.accountId, table.recordDate),
  };
});

// Define relationships between entities
export const accountRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
    relationName: 'user_accounts'
  }),
  property: one(properties, {
    fields: [accounts.propertyId],
    references: [properties.id],
    relationName: 'property_accounts'
  }),
  journalEntries: many(journalEntries),
  reconciliations: many(reconciliations),
  balanceHistory: many(accountBalanceHistory)
}));

export const ledgerTransactionRelations = relations(ledgerTransactions, ({ one, many }) => ({
  initiator: one(users, {
    fields: [ledgerTransactions.initiatedBy],
    references: [users.id],
    relationName: 'transaction_initiator'
  }),
  journalEntries: many(journalEntries)
}));

export const journalEntryRelations = relations(journalEntries, ({ one }) => ({
  transaction: one(ledgerTransactions, {
    fields: [journalEntries.transactionId],
    references: [ledgerTransactions.id]
  }),
  account: one(accounts, {
    fields: [journalEntries.accountId],
    references: [accounts.id]
  })
}));

export const reconciliationRelations = relations(reconciliations, ({ one }) => ({
  account: one(accounts, {
    fields: [reconciliations.accountId],
    references: [accounts.id]
  }),
  performedByUser: one(users, {
    fields: [reconciliations.performedBy],
    references: [users.id]
  })
}));

export const accountBalanceHistoryRelations = relations(accountBalanceHistory, ({ one }) => ({
  account: one(accounts, {
    fields: [accountBalanceHistory.accountId],
    references: [accounts.id]
  }),
  lastTransaction: one(ledgerTransactions, {
    fields: [accountBalanceHistory.lastTransactionId],
    references: [ledgerTransactions.id]
  })
}));

// Define types for TypeScript
export type Account = typeof accounts.$inferSelect;
export type LedgerTransaction = typeof ledgerTransactions.$inferSelect;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type Reconciliation = typeof reconciliations.$inferSelect;
export type AccountBalanceHistory = typeof accountBalanceHistory.$inferSelect;