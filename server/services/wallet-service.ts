import mongoose from 'mongoose';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import { CryptoPaymentService } from './crypto-payment-service.js';

/**
 * WalletService - Manages wallet operations including crypto balance updates
 */
export class WalletService {
  private cryptoPaymentService: CryptoPaymentService;

  constructor() {
    this.cryptoPaymentService = new CryptoPaymentService();
    console.log('WalletService initialized');
  }

  /**
   * Update wallet balance based on a confirmed transaction
   * @param transactionId - ID of the confirmed transaction
   * @param userId - User ID who owns the wallet
   * @param session - Mongoose session for transaction
   */
  public async updateWalletBalanceFromTransaction(
    transactionId: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId,
    session?: mongoose.ClientSession
  ): Promise<boolean> {
    try {
      // Find the transaction
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        throw new Error(`Transaction ${transactionId} not found`);
      }

      if (transaction.status !== 'completed') {
        throw new Error(`Transaction ${transactionId} is not completed`);
      }

      // Find or create the user's wallet
      let wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        wallet = new Wallet({ userId });
      }

      const useSession = session || await mongoose.startSession();
      if (!session) {
        useSession.startTransaction();
      }

      try {
        // Update wallet based on transaction type
        switch (transaction.type) {
          case 'crypto_investment':
            if (transaction.paymentMethod === 'crypto') {
              // Record crypto used for investment
              if (!wallet.cryptoBalances) {
                wallet.cryptoBalances = new Map();
              }
              
              // Track the deposit of crypto (even though it's immediately invested)
              const currency = transaction.currency || 'USDC';
              const currentBalance = wallet.cryptoBalances.get(currency) || 0;
              wallet.cryptoBalances.set(currency, currentBalance);
              
              // Track total investment amount in fiat
              wallet.totalInvested += transaction.amount;
              
              // Add transaction to wallet's history
              if (!wallet.pendingTransactions) {
                wallet.pendingTransactions = [];
              }
              wallet.pendingTransactions = wallet.pendingTransactions.filter(
                (txId) => !txId.equals(transaction._id)
              );
            }
            break;

          case 'deposit':
            if (transaction.paymentMethod === 'crypto') {
              // Crypto deposit to wallet
              const currency = transaction.currency || 'USDC';
              if (!wallet.cryptoBalances) {
                wallet.cryptoBalances = new Map();
              }
              const currentBalance = wallet.cryptoBalances.get(currency) || 0;
              const depositAmount = transaction.crypto?.receivedAmount || transaction.amount;
              wallet.cryptoBalances.set(currency, currentBalance + depositAmount);
              
              // Update total deposited
              wallet.totalDeposited += transaction.amount;
            } else {
              // Regular fiat deposit
              wallet.balance += transaction.amount;
              wallet.totalDeposited += transaction.amount;
            }
            break;

          case 'withdrawal':
            if (transaction.paymentMethod === 'crypto') {
              // Crypto withdrawal from wallet
              const currency = transaction.currency || 'USDC';
              if (!wallet.cryptoBalances) {
                wallet.cryptoBalances = new Map();
              }
              const currentBalance = wallet.cryptoBalances.get(currency) || 0;
              wallet.cryptoBalances.set(currency, Math.max(0, currentBalance - transaction.amount));
              
              // Update total withdrawn
              wallet.totalWithdrawn += transaction.amount;
            } else {
              // Regular fiat withdrawal
              wallet.balance = Math.max(0, wallet.balance - transaction.amount);
              wallet.totalWithdrawn += transaction.amount;
            }
            break;

          case 'return':
            // Returns are always added to the wallet balance
            wallet.balance += transaction.amount;
            wallet.totalReturns += transaction.amount;
            break;

          default:
            console.log(`Unhandled transaction type: ${transaction.type}`);
        }

        // Save the wallet updates
        wallet.lastUpdated = new Date();
        await wallet.save({ session: useSession });

        // Commit the transaction if we started it
        if (!session) {
          await useSession.commitTransaction();
          useSession.endSession();
        }

        return true;
      } catch (error) {
        // Rollback if we started the transaction
        if (!session) {
          await useSession.abortTransaction();
          useSession.endSession();
        }
        throw error;
      }
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      return false;
    }
  }

  /**
   * Add a crypto address to user's wallet
   * @param userId - User ID who owns the wallet
   * @param currency - Cryptocurrency code (e.g., BTC, ETH, USDC)
   * @param address - Blockchain address for this currency
   * @param network - Blockchain network (e.g., ethereum, polygon)
   */
  public async addCryptoAddress(
    userId: string | mongoose.Types.ObjectId,
    currency: string,
    address: string,
    network: string
  ): Promise<boolean> {
    try {
      // Find or create the user's wallet
      let wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        wallet = new Wallet({ userId });
      }

      // Initialize crypto addresses if needed
      if (!wallet.cryptoAddresses) {
        wallet.cryptoAddresses = new Map();
      }

      // Store address with network information
      const key = `${currency.toUpperCase()}_${network}`;
      wallet.cryptoAddresses.set(key, address);
      wallet.lastUpdated = new Date();
      await wallet.save();
      
      return true;
    } catch (error) {
      console.error('Error adding crypto address:', error);
      return false;
    }
  }

  /**
   * Get user's crypto balances
   * @param userId - User ID who owns the wallet
   */
  public async getCryptoBalances(userId: string | mongoose.Types.ObjectId): Promise<Map<string, number>> {
    try {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet || !wallet.cryptoBalances) {
        return new Map<string, number>();
      }
      return wallet.cryptoBalances;
    } catch (error) {
      console.error('Error getting crypto balances:', error);
      return new Map<string, number>();
    }
  }

  /**
   * Update wallet crypto balances from an external source 
   * (e.g., blockchain explorer or exchange API)
   * @param userId - User ID who owns the wallet
   */
  public async syncCryptoBalances(userId: string | mongoose.Types.ObjectId): Promise<boolean> {
    try {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        return false;
      }

      // In a real implementation, this would call blockchain explorer APIs
      // or exchange APIs to get current balances
      const externalBalances = await this.cryptoPaymentService.getWalletBalances(userId.toString());
      
      if (!externalBalances) {
        return false;
      }

      // Initialize or update crypto balances
      if (!wallet.cryptoBalances) {
        wallet.cryptoBalances = new Map();
      }

      // Update each currency balance
      for (const [currency, balance] of Object.entries(externalBalances)) {
        wallet.cryptoBalances.set(currency, balance);
      }

      wallet.lastUpdated = new Date();
      await wallet.save();
      return true;
    } catch (error) {
      console.error('Error syncing crypto balances:', error);
      return false;
    }
  }

  /**
   * Update crypto balance for a wallet
   * @param userId - User ID who owns the wallet
   * @param currency - Cryptocurrency code (e.g., BTC, ETH, USDC)
   * @param amount - Amount to update (positive for addition, negative for subtraction)
   * @param isAbsolute - If true, sets the balance to the exact amount instead of adding/subtracting
   */
  public async updateCryptoBalance(
    userId: string | mongoose.Types.ObjectId,
    currency: string,
    amount: number,
    isAbsolute: boolean = false
  ): Promise<boolean> {
    try {
      // Find or create the user's wallet
      let wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        wallet = new Wallet({ userId });
      }

      // Initialize crypto balances if needed
      if (!wallet.cryptoBalances) {
        wallet.cryptoBalances = new Map();
      }

      // Normalize the currency code
      const normalizedCurrency = currency.toUpperCase();
      
      // Update the balance
      if (isAbsolute) {
        // Set the balance to exact amount
        wallet.cryptoBalances.set(normalizedCurrency, amount);
      } else {
        // Add/subtract from current balance
        const currentBalance = wallet.cryptoBalances.get(normalizedCurrency) || 0;
        const newBalance = Math.max(0, currentBalance + amount); // Prevent negative balances
        wallet.cryptoBalances.set(normalizedCurrency, newBalance);
      }

      wallet.lastUpdated = new Date();
      await wallet.save();
      
      console.log(`Updated crypto balance for user ${userId}: ${normalizedCurrency} ${isAbsolute ? 'set to' : 'adjusted by'} ${amount}`);
      return true;
    } catch (error) {
      console.error('Error updating crypto balance:', error);
      return false;
    }
  }

  /**
   * Update user's wallet when a crypto payment is confirmed
   * @param paymentId - ID of the payment from crypto provider
   */
  public async processCryptoPaymentConfirmation(paymentId: string): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find the transaction by payment ID
      const transaction = await Transaction.findOne({ paymentId });
      if (!transaction) {
        throw new Error(`Transaction not found for payment ID: ${paymentId}`);
      }

      // Skip if already processed
      if (transaction.status === 'completed' && transaction.completedAt) {
        return true;
      }

      // Get the payment details from the crypto provider
      const paymentDetails = await this.cryptoPaymentService.getPayment(paymentId);
      if (!paymentDetails || !['confirmed', 'completed'].includes(paymentDetails.status)) {
        throw new Error(`Payment ${paymentId} is not confirmed`);
      }

      // Update transaction status
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.transactionHash = paymentDetails.txHash;
      
      // Add crypto-specific details
      if (!transaction.crypto) {
        transaction.crypto = {
          provider: 'CoinGate', // or detect from the payment service
          txHash: paymentDetails.txHash,
          status: paymentDetails.status,
          walletAddress: paymentDetails.paymentAddress,
          confirmations: paymentDetails.confirmations || 1,
          receivedAmount: paymentDetails.amountInCrypto,
          exchangeRate: paymentDetails.amountInCrypto ? paymentDetails.amount / paymentDetails.amountInCrypto : 0
        };
      }

      await transaction.save({ session });

      // Update wallet balance based on transaction type
      const userId = transaction.userId;
      const result = await this.updateWalletBalanceFromTransaction(
        transaction._id,
        userId,
        session
      );

      if (!result) {
        throw new Error('Failed to update wallet balance');
      }

      await session.commitTransaction();
      session.endSession();
      return true;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error processing crypto payment confirmation:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const walletService = new WalletService();