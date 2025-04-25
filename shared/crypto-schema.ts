import { z } from 'zod';

// Define crypto transaction status enum
export const cryptoTransactionStatusEnum = z.enum([
  'pending',
  'processing',
  'confirmed',
  'failed',
  'refunded',
  'expired',
  'completed'
]);

// Define supported crypto currencies
export const cryptoCurrencyEnum = z.enum([
  'BTC',
  'ETH',
  'USDC',
  'USDT'
]);

// Define supported networks
export const cryptoNetworkEnum = z.enum([
  'ethereum',
  'polygon',
  'binance',
  'solana'
]);

// Define a schema for crypto payment intents
export const cryptoPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('NGN'),
  cryptoCurrency: cryptoCurrencyEnum,
  userId: z.string(),
  investmentId: z.string().optional(),
  propertyId: z.string().optional(),
  returnUrl: z.string().optional(),
  network: cryptoNetworkEnum.optional()
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

// Simple interfaces for our mock data
export interface CryptoTransaction {
  id: string;
  userId: string;
  propertyId?: string;
  investmentId?: string;
  amount: number;
  cryptoAmount: number;
  currency: string;
  cryptoCurrency: string;
  status: string;
  txHash?: string;
  paymentAddress: string;
  qrCodeUrl?: string;
  paymentUrl?: string;
  expiresAt: Date;
  confirmedAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CryptoWalletBalance {
  currency: string;
  balance: number;
  pendingBalance: number;
}