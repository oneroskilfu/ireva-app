import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { pgTable, text, uuid, timestamp, numeric, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

// Define crypto transaction status enum
export const cryptoTransactionStatusEnum = z.enum([
  'pending',
  'processing',
  'confirmed',
  'failed',
  'refunded'
]);

// Define supported crypto currencies
export const cryptoCurrencyEnum = z.enum([
  'BTC',
  'ETH',
  'USDC',
  'USDT'
]);

// Define the crypto transaction table
export const cryptoTransactions = pgTable('crypto_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  investmentId: uuid('investment_id'),
  propertyId: text('property_id'),
  amount: numeric('amount').notNull(),
  cryptoAmount: numeric('crypto_amount'),
  currency: text('currency').default('USD').notNull(),
  cryptoCurrency: text('crypto_currency').notNull(),
  status: text('status').default('pending').notNull(),
  txHash: text('tx_hash'),
  paymentProviderReference: text('payment_provider_reference'),
  paymentAddress: text('payment_address'),
  qrCodeUrl: text('qr_code_url'),
  paymentUrl: text('payment_url'),
  expiresAt: timestamp('expires_at'),
  confirmedAt: timestamp('confirmed_at'),
  refundedAt: timestamp('refunded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  paymentProviderResponse: text('payment_provider_response'),
  walletUpdated: boolean('wallet_updated').default(false)
});

// Define the crypto wallet balance table
export const cryptoWalletBalances = pgTable('crypto_wallet_balances', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  currency: text('currency').default('USD').notNull(),
  balance: numeric('balance').default('0').notNull(),
  pendingBalance: numeric('pending_balance').default('0'),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Define the schemas using drizzle-zod
export const insertCryptoTransactionSchema = createInsertSchema(cryptoTransactions, {
  status: cryptoTransactionStatusEnum,
  cryptoCurrency: cryptoCurrencyEnum
}).omit({ id: true, confirmedAt: true, refundedAt: true, createdAt: true, updatedAt: true });

export const insertCryptoWalletBalanceSchema = createInsertSchema(cryptoWalletBalances)
  .omit({ id: true, updatedAt: true });

// Define the types
export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;
export type InsertCryptoTransaction = z.infer<typeof insertCryptoTransactionSchema>;

export type CryptoWalletBalance = typeof cryptoWalletBalances.$inferSelect;
export type InsertCryptoWalletBalance = z.infer<typeof insertCryptoWalletBalanceSchema>;

// Define a schema for crypto payment intents
export const cryptoPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  cryptoCurrency: cryptoCurrencyEnum,
  userId: z.string(),
  investmentId: z.string().optional(),
  propertyId: z.string().optional(),
  returnUrl: z.string().optional()
});

export type CryptoPaymentIntent = z.infer<typeof cryptoPaymentIntentSchema>;

// Define a schema for updating crypto transaction status
export const updateCryptoTransactionSchema = z.object({
  status: cryptoTransactionStatusEnum,
  txHash: z.string().optional(),
  paymentProviderReference: z.string().optional(),
  paymentProviderResponse: z.string().optional()
});

export type UpdateCryptoTransaction = z.infer<typeof updateCryptoTransactionSchema>;

// Define a schema for crypto refund requests
export const cryptoRefundRequestSchema = z.object({
  transactionId: z.string(),
  reason: z.string().optional()
});

export type CryptoRefundRequest = z.infer<typeof cryptoRefundRequestSchema>;

// Define a schema for crypto payment webhooks
export const cryptoPaymentWebhookSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.string(),
    status: z.string(),
    transaction_id: z.string().optional(),
    order_id: z.string().optional(),
    payment_id: z.string().optional(),
    amount: z.number().or(z.string()).transform(val => typeof val === 'string' ? parseFloat(val) : val),
    currency: z.string(),
    crypto_currency: z.string().optional(),
    customer_id: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional()
  })
});

export type CryptoPaymentWebhook = z.infer<typeof cryptoPaymentWebhookSchema>;