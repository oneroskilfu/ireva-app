import { db } from '../db';
import { eq } from 'drizzle-orm';
import { 
  transactions, 
  insertTransactionSchema, 
  InsertTransaction, 
  Transaction,
  transactionActionEnum 
} from '../../shared/schema';
import { generateTransactionReference } from '../utils/helpers';

/**
 * Transaction Service
 * 
 * This service provides methods to log financial transactions in the system.
 * It records every financial activity like investments, withdrawals, deposits, etc.
 * These logs are useful for audit trails, financial reporting, and user transaction history.
 */
class TransactionService {
  /**
   * Log a transaction
   * 
   * @param data Transaction data to log
   * @returns The created transaction
   */
  async logTransaction(data: InsertTransaction): Promise<Transaction> {
    try {
      // Generate a unique reference if not provided
      if (!data.reference) {
        data.reference = generateTransactionReference();
      }
      
      const [transaction] = await db.insert(transactions)
        .values(data)
        .returning();
      
      console.log(`Transaction logged: ${data.type} - ${data.amount} - ${data.description}`);
      return transaction;
    } catch (error) {
      console.error('Error logging transaction:', error);
      throw error;
    }
  }
  
  /**
   * Log an investment transaction
   * 
   * @param userId User ID
   * @param amount Investment amount
   * @param propertyId Property ID
   * @param investmentId Investment ID
   * @param description Custom description (optional)
   * @param metadata Additional metadata (optional)
   * @returns The created transaction
   */
  async logInvestment(
    userId: number, 
    amount: number, 
    propertyId: number, 
    investmentId: number,
    description?: string,
    metadata?: any
  ): Promise<Transaction> {
    return this.logTransaction({
      userId,
      type: 'investment',
      amount,
      description: description || `Investment in property ID: ${propertyId}`,
      propertyId,
      investmentId,
      metadata: metadata || null,
      reference: generateTransactionReference(),
      status: 'completed'
    });
  }
  
  /**
   * Log a deposit transaction
   * 
   * @param userId User ID
   * @param amount Deposit amount
   * @param walletId Wallet ID
   * @param balanceBefore Balance before deposit
   * @param balanceAfter Balance after deposit
   * @param description Custom description (optional)
   * @param metadata Additional metadata (optional)
   * @returns The created transaction
   */
  async logDeposit(
    userId: number,
    amount: number,
    walletId: number,
    balanceBefore: number,
    balanceAfter: number,
    description?: string,
    metadata?: any
  ): Promise<Transaction> {
    return this.logTransaction({
      userId,
      type: 'deposit',
      amount,
      description: description || `Wallet deposit`,
      walletId,
      balanceBefore,
      balanceAfter,
      metadata: metadata || null,
      reference: generateTransactionReference(),
      status: 'completed'
    });
  }
  
  /**
   * Log a withdrawal transaction
   * 
   * @param userId User ID
   * @param amount Withdrawal amount
   * @param walletId Wallet ID
   * @param balanceBefore Balance before withdrawal
   * @param balanceAfter Balance after withdrawal
   * @param description Custom description (optional)
   * @param metadata Additional metadata (optional)
   * @returns The created transaction
   */
  async logWithdrawal(
    userId: number,
    amount: number,
    walletId: number,
    balanceBefore: number,
    balanceAfter: number,
    description?: string,
    metadata?: any
  ): Promise<Transaction> {
    return this.logTransaction({
      userId,
      type: 'withdrawal',
      amount,
      description: description || `Wallet withdrawal`,
      walletId,
      balanceBefore,
      balanceAfter,
      metadata: metadata || null,
      reference: generateTransactionReference(),
      status: 'completed'
    });
  }
  
  /**
   * Log an investment return transaction
   * 
   * @param userId User ID
   * @param amount Return amount
   * @param investmentId Investment ID
   * @param propertyId Property ID
   * @param description Custom description (optional)
   * @param metadata Additional metadata (optional)
   * @returns The created transaction
   */
  async logInvestmentReturn(
    userId: number,
    amount: number,
    investmentId: number,
    propertyId: number,
    description?: string,
    metadata?: any
  ): Promise<Transaction> {
    return this.logTransaction({
      userId,
      type: 'return',
      amount,
      description: description || `Investment return for investment ID: ${investmentId}`,
      propertyId,
      investmentId,
      metadata: metadata || null,
      reference: generateTransactionReference(),
      status: 'completed'
    });
  }
  
  /**
   * Log a referral bonus transaction
   * 
   * @param userId User ID
   * @param amount Bonus amount
   * @param referrerId Referrer user ID
   * @param description Custom description (optional)
   * @param metadata Additional metadata (optional)
   * @returns The created transaction
   */
  async logReferralBonus(
    userId: number,
    amount: number,
    referrerId: number,
    description?: string,
    metadata?: any
  ): Promise<Transaction> {
    return this.logTransaction({
      userId,
      type: 'referral_bonus',
      amount,
      description: description || `Referral bonus from user ID: ${referrerId}`,
      metadata: metadata ? { ...metadata, referrerId } : { referrerId },
      reference: generateTransactionReference(),
      status: 'completed'
    });
  }
  
  /**
   * Get all transactions for a user
   * 
   * @param userId User ID
   * @returns Array of transactions
   */
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(transactions.createdAt, 'desc');
  }
  
  /**
   * Get transactions for a specific investment
   * 
   * @param investmentId Investment ID
   * @returns Array of transactions
   */
  async getInvestmentTransactions(investmentId: number): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.investmentId, investmentId))
      .orderBy(transactions.createdAt, 'desc');
  }
  
  /**
   * Get transactions for a specific property
   * 
   * @param propertyId Property ID
   * @returns Array of transactions
   */
  async getPropertyTransactions(propertyId: number): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.propertyId, propertyId))
      .orderBy(transactions.createdAt, 'desc');
  }
  
  /**
   * Get transactions for a specific wallet
   * 
   * @param walletId Wallet ID
   * @returns Array of transactions
   */
  async getWalletTransactions(walletId: number): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(transactions.createdAt, 'desc');
  }
}

// Export a singleton instance
export const transactionService = new TransactionService();
export default transactionService;