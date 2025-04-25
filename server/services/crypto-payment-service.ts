import { v4 as uuidv4 } from 'uuid';

// Mock wallet addresses for different networks
const networkWallets: Record<string, string> = {
  'ethereum': '0xD5c0D17cCb9071D27a4F7eD8255F59989b9ea461',
  'polygon': '0x7a14Ac0E62BA57D8789E53DD1d8c2B29Bd91D0D2',
  'binance': '0xB8D1F9C2C85219a4F2B7B3C406AF0AE699a0a210',
  'solana': '6zxWB7Jz9JqvJanpFSBDdRKzj8GQ8EtyUJf84nXnQRkd',
  'avalanche': '0x3F25C4a1f162e9D9a8a2746f5d127556b1D7F796'
};

// Mock exchange rates for crypto currencies
const exchangeRates: Record<string, number> = {
  'USDC': 1.00, // 1 USDC = 1 USD
  'USDT': 1.00, // 1 USDT = 1 USD
  'ETH': 4000.0, // 1 ETH = 4000 USD
  'BTC': 60000.0 // 1 BTC = 60000 USD
};

// Type definitions
interface CreatePaymentRequest {
  userId: number;
  propertyId: number;
  amount: number;
  currency: string;
  network?: string;
}

interface CryptoPayment {
  id: string;
  userId: number;
  propertyId: number;
  amount: number;
  amountInCrypto: string;
  walletAddress: string;
  network: string;
  currency: string;
  status: string; // pending, processing, completed, failed, expired
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  paymentUrl?: string;
  paymentAddress?: string;
}

// In-memory store for payments (would be a database in production)
const payments = new Map<string, CryptoPayment>();

export class CryptoPaymentService {
  constructor() {
    console.log('CryptoPaymentService initialized');
  }

  /**
   * Create a new crypto payment request
   */
  async createPayment(request: CreatePaymentRequest): Promise<CryptoPayment> {
    const { userId, propertyId, amount, currency = 'USDC', network = 'ethereum' } = request;
    
    // Convert amount to crypto based on exchange rate
    const rate = exchangeRates[currency] || 1;
    const amountInCrypto = (amount / rate).toFixed(6);
    
    // Get wallet address for the network
    const walletAddress = networkWallets[network] || networkWallets.ethereum;
    
    // Create payment with 1 hour expiry
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    const payment: CryptoPayment = {
      id: uuidv4(),
      userId,
      propertyId,
      amount,
      amountInCrypto,
      walletAddress,
      network,
      currency,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      expiresAt,
      paymentUrl: `https://pay.crypto.example/${network}/${walletAddress}?amount=${amountInCrypto}&currency=${currency}`, // Mock URL
      paymentAddress: walletAddress,
    };
    
    // Store the payment
    payments.set(payment.id, payment);
    
    // In production, you'd integrate with a crypto payment provider here
    // and receive a payment URL/invoice ID that would be returned to the client
    
    return payment;
  }

  /**
   * Get a payment by ID
   */
  async getPayment(id: string): Promise<CryptoPayment | null> {
    const payment = payments.get(id);
    
    // Check if payment has expired
    if (payment && payment.status === 'pending') {
      const now = new Date();
      if (now > payment.expiresAt) {
        payment.status = 'expired';
        payment.updatedAt = now;
        payments.set(id, payment);
      }
    }
    
    return payment || null;
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(id: string): Promise<string> {
    const payment = await this.getPayment(id);
    return payment ? payment.status : 'not_found';
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: string, status: string, txHash?: string): Promise<boolean> {
    const payment = payments.get(id);
    
    if (!payment) {
      return false;
    }
    
    payment.status = status;
    payment.updatedAt = new Date();
    
    if (txHash) {
      payment.txHash = txHash;
    }
    
    payments.set(id, payment);
    return true;
  }

  /**
   * Update transaction status (comprehensive)
   */
  async updateTransactionStatus(id: string, data: { 
    status: string; 
    txHash?: string; 
    paymentProviderReference?: string;
    paymentProviderResponse?: string;
  }): Promise<boolean> {
    const payment = payments.get(id);
    
    if (!payment) {
      return false;
    }
    
    payment.status = data.status;
    payment.updatedAt = new Date();
    
    if (data.txHash) {
      payment.txHash = data.txHash;
    }
    
    // Store additional metadata as needed
    
    payments.set(id, payment);
    return true;
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(id: string): Promise<boolean> {
    const payment = payments.get(id);
    
    if (!payment || payment.status !== 'pending') {
      return false;
    }
    
    payment.status = 'cancelled';
    payment.updatedAt = new Date();
    payments.set(id, payment);
    
    return true;
  }

  /**
   * Get all payments for a user
   */
  async getUserPayments(userId: number): Promise<CryptoPayment[]> {
    return Array.from(payments.values())
      .filter(payment => payment.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  /**
   * Get all transactions for a user (alias for getUserPayments)
   */
  async getTransactionsByUser(userId: string): Promise<CryptoPayment[]> {
    return this.getUserPayments(parseInt(userId));
  }
  
  /**
   * Get a transaction by ID
   */
  async getTransaction(transactionId: string): Promise<CryptoPayment | null> {
    return this.getPayment(transactionId);
  }
  
  /**
   * Get all transactions
   */
  async getAllTransactions(): Promise<CryptoPayment[]> {
    return Array.from(payments.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  /**
   * Create a payment intent
   */
  async createPaymentIntent(data: any): Promise<CryptoPayment> {
    return this.createPayment({
      userId: parseInt(data.userId),
      propertyId: parseInt(data.propertyId || '0'),
      amount: data.amount,
      currency: data.cryptoCurrency || 'USDC',
      network: data.network || 'ethereum'
    });
  }
  
  /**
   * Get wallet balances for a user
   */
  async getWalletBalances(userId: string): Promise<any[]> {
    // Mock wallet balances for demo
    return [
      { currency: 'USDC', balance: 1000.0, pendingBalance: 0 },
      { currency: 'USDT', balance: 500.0, pendingBalance: 100 },
      { currency: 'ETH', balance: 0.5, pendingBalance: 0 }
    ];
  }
  
  /**
   * Process a refund request
   */
  async requestRefund(data: { transactionId: string, reason?: string }): Promise<CryptoPayment | null> {
    const payment = await this.getPayment(data.transactionId);
    if (!payment) return null;
    
    payment.status = 'refunded';
    payment.updatedAt = new Date();
    payments.set(payment.id, payment);
    
    return payment;
  }
  
  /**
   * Process a webhook event
   */
  async processWebhookEvent(event: string, data: any): Promise<boolean> {
    console.log(`Processing webhook event: ${event}`, data);
    
    if (event === 'payment.update' && data.payment_id) {
      const payment = await this.getPayment(data.payment_id);
      if (payment) {
        const status = data.status.toLowerCase();
        if (status === 'confirmed' || status === 'completed') {
          payment.status = 'completed';
          payment.txHash = data.transaction_id || payment.txHash;
        } else if (status === 'failed') {
          payment.status = 'failed';
        }
        
        payment.updatedAt = new Date();
        payments.set(payment.id, payment);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check for payment confirmations
   * In a real implementation, this would listen to blockchain events
   * or poll a payment provider's API
   */
  async checkForPaymentConfirmations(): Promise<void> {
    // This is a mock implementation
    // In production, you'd integrate with a blockchain node or payment provider API
    
    // Mock random confirmations for demo purposes
    const pendingPayments = Array.from(payments.values())
      .filter(payment => payment.status === 'pending');
    
    for (const payment of pendingPayments) {
      // Randomly confirm some payments (about 20% chance)
      if (Math.random() < 0.2) {
        payment.status = 'processing';
        payment.updatedAt = new Date();
        payments.set(payment.id, payment);
        
        // Then after a brief delay, mark as completed
        setTimeout(() => {
          payment.status = 'completed';
          payment.txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
          payment.updatedAt = new Date();
          payments.set(payment.id, payment);
        }, 30000); // 30 seconds later
      }
    }
  }

  /**
   * Get supported networks
   */
  getSupportedNetworks(): string[] {
    return Object.keys(networkWallets);
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): string[] {
    return Object.keys(exchangeRates);
  }
}