import axios from 'axios';
import { CryptoPaymentIntent, CryptoTransaction, InsertCryptoTransaction, UpdateCryptoTransaction, CryptoRefundRequest } from '@shared/crypto-schema';
import { db } from '../db';
import { cryptoTransactions, cryptoWalletBalances } from '@shared/crypto-schema';
import { eq, and } from 'drizzle-orm';
import { storage } from '../storage';

class CryptoPaymentService {
  private apiKey: string | undefined;
  private apiUrl: string;
  
  constructor() {
    this.apiKey = process.env.COINGATE_API_KEY;
    this.apiUrl = 'https://api.coingate.com/v2';
    
    if (!this.apiKey && process.env.NODE_ENV === 'development') {
      console.warn('COINGATE_API_KEY is not set. Using mock data for development.');
    }
  }
  
  /**
   * Create a crypto payment intent
   */
  async createPaymentIntent(paymentIntent: CryptoPaymentIntent): Promise<CryptoTransaction> {
    try {
      // In production, we would call the payment provider API
      // For development, we'll create a mock payment intent
      let paymentProviderResponse: any;
      
      if (this.apiKey && process.env.NODE_ENV !== 'development') {
        // This would be real API call in production
        const response = await axios.post(`${this.apiUrl}/orders`, {
          price_amount: paymentIntent.amount,
          price_currency: paymentIntent.currency,
          receive_currency: paymentIntent.cryptoCurrency,
          title: 'iREVA Property Investment',
          description: `Investment ${paymentIntent.propertyId ? `in property ${paymentIntent.propertyId}` : ''}`,
          callback_url: process.env.CRYPTO_PAYMENT_CALLBACK_URL,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
          success_url: paymentIntent.returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
          token: this.apiKey
        });
        
        paymentProviderResponse = response.data;
      } else {
        // Mock response for development
        paymentProviderResponse = {
          id: `mock-order-${Date.now()}`,
          status: 'pending',
          price_amount: paymentIntent.amount,
          price_currency: paymentIntent.currency,
          receive_currency: paymentIntent.cryptoCurrency,
          payment_address: `mock-address-${paymentIntent.cryptoCurrency.toLowerCase()}-${Date.now()}`,
          payment_url: `https://mock-payment-provider.com/pay/${Date.now()}`,
          token: 'mock-token',
          created_at: new Date().toISOString(),
          order_id: `order-${Date.now()}`,
          token_id: `token-${Date.now()}`,
          expire_at: new Date(Date.now() + 3600000).toISOString()
        };
      }
      
      // Create transaction record in database
      const transactionData: InsertCryptoTransaction = {
        userId: paymentIntent.userId,
        amount: paymentIntent.amount.toString(),
        currency: paymentIntent.currency,
        cryptoCurrency: paymentIntent.cryptoCurrency,
        status: 'pending',
        paymentProviderReference: paymentProviderResponse.id,
        paymentAddress: paymentProviderResponse.payment_address,
        paymentUrl: paymentProviderResponse.payment_url,
        expiresAt: new Date(paymentProviderResponse.expire_at || Date.now() + 3600000),
        paymentProviderResponse: JSON.stringify(paymentProviderResponse),
        cryptoAmount: paymentProviderResponse.crypto_amount?.toString() || null
      };
      
      if (paymentIntent.investmentId) {
        transactionData.investmentId = paymentIntent.investmentId;
      }
      
      if (paymentIntent.propertyId) {
        transactionData.propertyId = paymentIntent.propertyId;
      }
      
      // Insert transaction into database
      const [transaction] = await db
        .insert(cryptoTransactions)
        .values(transactionData)
        .returning();
      
      return transaction;
    } catch (error) {
      console.error('Error creating crypto payment intent:', error);
      throw new Error('Failed to create crypto payment intent');
    }
  }
  
  /**
   * Get a transaction by ID
   */
  async getTransaction(id: string): Promise<CryptoTransaction | undefined> {
    try {
      const [transaction] = await db
        .select()
        .from(cryptoTransactions)
        .where(eq(cryptoTransactions.id, id));
      
      return transaction;
    } catch (error) {
      console.error('Error getting crypto transaction:', error);
      throw new Error('Failed to get crypto transaction');
    }
  }
  
  /**
   * Get transactions by user ID
   */
  async getTransactionsByUser(userId: string): Promise<CryptoTransaction[]> {
    try {
      const transactions = await db
        .select()
        .from(cryptoTransactions)
        .where(eq(cryptoTransactions.userId, userId))
        .orderBy(cryptoTransactions.createdAt);
      
      return transactions;
    } catch (error) {
      console.error('Error getting user crypto transactions:', error);
      throw new Error('Failed to get user crypto transactions');
    }
  }
  
  /**
   * Get all transactions
   */
  async getAllTransactions(): Promise<CryptoTransaction[]> {
    try {
      const transactions = await db
        .select()
        .from(cryptoTransactions)
        .orderBy(cryptoTransactions.createdAt);
      
      return transactions;
    } catch (error) {
      console.error('Error getting all crypto transactions:', error);
      throw new Error('Failed to get all crypto transactions');
    }
  }
  
  /**
   * Update a transaction status
   */
  async updateTransactionStatus(id: string, updateData: UpdateCryptoTransaction): Promise<CryptoTransaction | undefined> {
    try {
      const data: any = {
        status: updateData.status,
        updatedAt: new Date()
      };
      
      if (updateData.txHash) {
        data.txHash = updateData.txHash;
      }
      
      if (updateData.paymentProviderReference) {
        data.paymentProviderReference = updateData.paymentProviderReference;
      }
      
      if (updateData.paymentProviderResponse) {
        data.paymentProviderResponse = updateData.paymentProviderResponse;
      }
      
      if (updateData.status === 'confirmed') {
        data.confirmedAt = new Date();
      } else if (updateData.status === 'refunded') {
        data.refundedAt = new Date();
      }
      
      const [transaction] = await db
        .update(cryptoTransactions)
        .set(data)
        .where(eq(cryptoTransactions.id, id))
        .returning();
      
      // If transaction is confirmed, update wallet balance
      if (transaction && updateData.status === 'confirmed' && !transaction.walletUpdated) {
        await this.updateWalletBalance(transaction);
      }
      
      return transaction;
    } catch (error) {
      console.error('Error updating crypto transaction:', error);
      throw new Error('Failed to update crypto transaction');
    }
  }
  
  /**
   * Update wallet balance after successful transaction
   */
  private async updateWalletBalance(transaction: CryptoTransaction): Promise<void> {
    try {
      // Check if wallet balance exists
      const [existingBalance] = await db
        .select()
        .from(cryptoWalletBalances)
        .where(
          and(
            eq(cryptoWalletBalances.userId, transaction.userId),
            eq(cryptoWalletBalances.currency, transaction.currency)
          )
        );
      
      const amount = parseFloat(transaction.amount.toString());
      
      if (existingBalance) {
        // Update existing balance
        await db
          .update(cryptoWalletBalances)
          .set({
            balance: (parseFloat(existingBalance.balance.toString()) + amount).toString(),
            updatedAt: new Date()
          })
          .where(eq(cryptoWalletBalances.id, existingBalance.id));
      } else {
        // Create new balance record
        await db
          .insert(cryptoWalletBalances)
          .values({
            userId: transaction.userId,
            currency: transaction.currency,
            balance: amount.toString(),
            updatedAt: new Date()
          });
      }
      
      // Mark transaction as wallet updated
      await db
        .update(cryptoTransactions)
        .set({ walletUpdated: true })
        .where(eq(cryptoTransactions.id, transaction.id));
      
      // Create a notification for the user
      await storage.createNotification({
        userId: transaction.userId,
        type: 'payment',
        title: 'Crypto Payment Confirmed',
        message: `Your payment of ${amount} ${transaction.currency} has been confirmed and added to your wallet.`,
        isRead: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw new Error('Failed to update wallet balance');
    }
  }
  
  /**
   * Process a refund request
   */
  async requestRefund(refundRequest: CryptoRefundRequest): Promise<CryptoTransaction | undefined> {
    try {
      // Get the transaction
      const transaction = await this.getTransaction(refundRequest.transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      if (transaction.status !== 'confirmed') {
        throw new Error('Only confirmed transactions can be refunded');
      }
      
      if (this.apiKey && process.env.NODE_ENV !== 'development') {
        // This would be a real API call in production
        // For now, we'll just update the transaction status
        /*
        await axios.post(`${this.apiUrl}/orders/${transaction.paymentProviderReference}/refund`, {
          token: this.apiKey
        });
        */
        console.log(`Would refund transaction ${transaction.id} in production`);
      }
      
      // Update transaction status to refunded
      return await this.updateTransactionStatus(transaction.id, {
        status: 'refunded',
        paymentProviderResponse: JSON.stringify({
          refunded: true,
          refundReason: refundRequest.reason || 'Refund requested by admin',
          refundedAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error processing refund request:', error);
      throw new Error('Failed to process refund request');
    }
  }
  
  /**
   * Process webhook event from payment provider
   */
  async processWebhookEvent(event: string, data: any): Promise<CryptoTransaction | undefined> {
    try {
      // Find transaction by payment provider reference
      const [transaction] = await db
        .select()
        .from(cryptoTransactions)
        .where(eq(cryptoTransactions.paymentProviderReference, data.id));
      
      if (!transaction) {
        console.error('No transaction found for webhook event:', data);
        return undefined;
      }
      
      // Map provider status to our status
      let status = transaction.status;
      switch (data.status) {
        case 'paid':
        case 'confirmed':
          status = 'confirmed';
          break;
        case 'invalid':
        case 'canceled':
        case 'expired':
          status = 'failed';
          break;
        case 'refunded':
          status = 'refunded';
          break;
        default:
          status = 'pending';
      }
      
      // Update transaction status
      return await this.updateTransactionStatus(transaction.id, {
        status,
        txHash: data.transaction_id || transaction.txHash,
        paymentProviderResponse: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Error processing webhook event:', error);
      throw new Error('Failed to process webhook event');
    }
  }
  
  /**
   * Get wallet balances for a user
   */
  async getWalletBalances(userId: string): Promise<any[]> {
    try {
      const balances = await db
        .select()
        .from(cryptoWalletBalances)
        .where(eq(cryptoWalletBalances.userId, userId));
      
      return balances;
    } catch (error) {
      console.error('Error getting wallet balances:', error);
      throw new Error('Failed to get wallet balances');
    }
  }
  
  /**
   * Get wallet balance for a specific currency
   */
  async getWalletBalance(userId: string, currency: string): Promise<string> {
    try {
      const [balance] = await db
        .select()
        .from(cryptoWalletBalances)
        .where(
          and(
            eq(cryptoWalletBalances.userId, userId),
            eq(cryptoWalletBalances.currency, currency)
          )
        );
      
      return balance?.balance.toString() || '0';
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return '0';
    }
  }
}

export const cryptoPaymentService = new CryptoPaymentService();