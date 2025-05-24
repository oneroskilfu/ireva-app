import axios from 'axios';
import { db } from '../db';
import { wallets, transactions, cryptoPayments, InsertCryptoPayment } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Mock data for when COINGATE_API_KEY is not set
const MOCK_CURRENCIES = ['BTC', 'ETH', 'USDT', 'USDC', 'LTC', 'XRP'];
const MOCK_PAYMENT = {
  id: 'mock-payment-' + Date.now(),
  status: 'pending',
  price_amount: 100,
  price_currency: 'USDT',
  receive_amount: 100,
  receive_currency: 'USDT',
  payment_url: 'https://example.com/pay',
  payment_address: '0x1234567890abcdef',
  created_at: new Date().toISOString(),
  expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
  order_id: 'ORDER-' + Date.now(),
};

interface CreatePaymentParams {
  amount: number;
  userId: number;
  currency: string;
  description: string;
  orderId: string;
  returnUrl: string;
  callbackUrl: string;
  propertyId?: number;
}

export class CryptoPaymentService {
  private static instance: CryptoPaymentService;
  private apiKey: string | undefined;
  private apiUrl: string;
  private useMockData: boolean;

  // Private constructor for singleton pattern
  private constructor() {
    this.apiKey = process.env.COINGATE_API_KEY;
    this.apiUrl = 'https://api.coingate.com/v2';
    this.useMockData = !this.apiKey;
    
    if (this.useMockData) {
      console.log('COINGATE_API_KEY is not set. Using mock data for crypto integration.');
    }
  }

  // Static method to get the single instance
  public static getInstance(): CryptoPaymentService {
    if (!CryptoPaymentService.instance) {
      console.log('CryptoPaymentService initialized');
      CryptoPaymentService.instance = new CryptoPaymentService();
    }
    return CryptoPaymentService.instance;
  }

  async getSupportedCurrencies(): Promise<string[]> {
    if (this.useMockData) {
      return MOCK_CURRENCIES;
    }

    try {
      const response = await axios.get(`${this.apiUrl}/currencies/merchant`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching supported currencies:', error);
      return MOCK_CURRENCIES; // Fallback to mock data if API call fails
    }
  }

  async createPayment(params: CreatePaymentParams): Promise<any> {
    if (this.useMockData) {
      // Create a record in our database for mock payment
      await this.savePaymentToDatabase({
        id: MOCK_PAYMENT.id,
        userId: params.userId,
        amount: params.amount,
        currency: params.currency,
        status: 'pending',
        orderId: params.orderId,
        paymentUrl: MOCK_PAYMENT.payment_url,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        propertyId: params.propertyId,
      });
      
      return {
        ...MOCK_PAYMENT,
        price_amount: params.amount,
        price_currency: params.currency,
        receive_amount: params.amount,
        receive_currency: params.currency,
        order_id: params.orderId,
      };
    }

    try {
      const payload = {
        price_amount: params.amount,
        price_currency: params.currency,
        receive_currency: params.currency, // Can be different if preferred
        title: 'iREVA Investment Platform',
        description: params.description,
        callback_url: params.callbackUrl,
        cancel_url: params.returnUrl + '?status=canceled',
        success_url: params.returnUrl + '?status=success',
        order_id: params.orderId,
      };

      const response = await axios.post(`${this.apiUrl}/orders`, payload, {
        headers: this.getHeaders(),
      });

      // Save payment to database
      await this.savePaymentToDatabase({
        id: response.data.id,
        userId: params.userId,
        amount: params.amount,
        currency: params.currency,
        status: response.data.status,
        orderId: params.orderId,
        paymentUrl: response.data.payment_url,
        createdAt: new Date(response.data.created_at),
        expiresAt: response.data.expires_at ? new Date(response.data.expires_at) : null,
        propertyId: params.propertyId,
      });

      return response.data;
    } catch (error: any) {
      console.error('Error creating payment:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create payment');
    }
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    if (this.useMockData) {
      // Randomly return different statuses for demo purposes
      const statuses = ['pending', 'confirming', 'paid', 'expired', 'canceled'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    }

    try {
      const response = await axios.get(`${this.apiUrl}/orders/${paymentId}`, {
        headers: this.getHeaders(),
      });
      return response.data.status;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw new Error('Failed to fetch payment status');
    }
  }

  async getUserPayments(userId: string): Promise<any[]> {
    try {
      const payments = await db.select().from(cryptoPayments).where(eq(cryptoPayments.userId, userId));
      return payments;
    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw new Error('Failed to fetch user payments');
    }
  }
  
  async getAllTransactions(): Promise<any[]> {
    try {
      // Get all crypto payments with user and property details
      const payments = await db.query.cryptoPayments.findMany({
        with: {
          user: true,
          property: true
        }
      });
      
      return payments;
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw new Error('Failed to fetch all transactions');
    }
  }
  
  async getPropertyCryptoInvestments(propertyId: string): Promise<any> {
    try {
      // Get all crypto payments for a specific property
      const payments = await db.select().from(cryptoPayments)
        .where(eq(cryptoPayments.propertyId, propertyId));
      
      // Calculate total investment amount
      const totalInvestment = payments.reduce((sum, payment) => {
        // Only count confirmed/paid payments
        if (['paid', 'confirmed'].includes(payment.status)) {
          return sum + Number(payment.amount);
        }
        return sum;
      }, 0);
      
      // Group by currency
      const byCurrency = payments.reduce((acc: Record<string, number>, payment) => {
        if (!['paid', 'confirmed'].includes(payment.status)) return acc;
        
        const currency = payment.currency;
        if (!acc[currency]) {
          acc[currency] = 0;
        }
        acc[currency] += Number(payment.amount);
        return acc;
      }, {});
      
      // Count unique investors
      const uniqueInvestors = new Set(payments
        .filter(p => ['paid', 'confirmed'].includes(p.status))
        .map(p => p.userId)
      );
      
      return {
        propertyId,
        totalInvestment,
        byCurrency,
        uniqueInvestorCount: uniqueInvestors.size,
        payments
      };
    } catch (error) {
      console.error('Error fetching property crypto investments:', error);
      throw new Error('Failed to fetch property crypto investments');
    }
  }
  
  async getAllPropertiesCryptoInvestments(): Promise<any[]> {
    try {
      // Get all properties with crypto investments
      const properties = await db.query.properties.findMany({
        with: {
          cryptoPayments: true
        }
      });
      
      // Process each property's crypto investments
      const result = await Promise.all(properties
        .filter(p => p.cryptoPayments.length > 0)
        .map(async (property) => {
          const cryptoData = await this.getPropertyCryptoInvestments(property.id);
          return {
            property,
            cryptoData
          };
        }));
      
      return result;
    } catch (error) {
      console.error('Error fetching all properties crypto investments:', error);
      throw new Error('Failed to fetch all properties crypto investments');
    }
  }

  async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    try {
      await db.update(cryptoPayments)
        .set({ status })
        .where(eq(cryptoPayments.id, paymentId));
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  async processSuccessfulPayment(paymentId: string, userId: string, amount: number): Promise<void> {
    try {
      // 1. Update wallet balance
      const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
      
      if (wallet) {
        const newBalance = Number(wallet.balance || 0) + amount;
        const newAvailableBalance = Number(wallet.availableBalance || 0) + amount;
        
        await db.update(wallets)
          .set({ 
            balance: newBalance.toString(),
            availableBalance: newAvailableBalance.toString()
          })
          .where(eq(wallets.id, wallet.id));
      } else {
        // Create wallet if it doesn't exist
        await db.insert(wallets).values([{
          userId: userId,
          balance: amount.toString(),
          availableBalance: amount.toString(),
          pendingDeposits: "0",
          pendingWithdrawals: "0"
        }]);
      }
      
      // Fetch the wallet again to get its ID
      const [updatedWallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
      
      if (!updatedWallet) {
        throw new Error('Failed to create or update wallet');
      }
      
      // 2. Create transaction record
      await db.insert(transactions).values([{
        walletId: updatedWallet.id,
        userId: userId,
        type: 'deposit',
        amount: amount.toString(),
        status: 'completed',
        description: `Crypto deposit (${paymentId})`,
        referenceId: paymentId
      }]);
      
      // 3. Mark crypto payment as completed
      await this.updatePaymentStatus(paymentId, 'completed');
    } catch (error) {
      console.error('Error processing successful payment:', error);
      throw new Error('Failed to process successful payment');
    }
  }

  private async savePaymentToDatabase(payment: {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: string;
    orderId: string;
    paymentUrl: string;
    createdAt: Date;
    expiresAt: Date | null;
    propertyId?: string;
  }): Promise<void> {
    try {
      // Convert numeric values to strings for database compatibility
      const dbPayment = {
        id: payment.id,
        userId: payment.userId,
        amount: payment.amount.toString(),
        currency: payment.currency,
        status: payment.status,
        orderId: payment.orderId,
        paymentUrl: payment.paymentUrl,
        createdAt: payment.createdAt,
        expiresAt: payment.expiresAt,
        propertyId: payment.propertyId
      };
      
      await db.insert(cryptoPayments).values([dbPayment]);
    } catch (error) {
      console.error('Error saving payment to database:', error);
      // Continue even if database save fails
    }
  }

  private getHeaders() {
    return {
      Authorization: `Token ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }
}