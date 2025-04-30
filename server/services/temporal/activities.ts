/**
 * Temporal Activities for iREVA
 * 
 * This file defines the activity implementations that are called by workflows.
 * Each activity represents a single unit of work with clear inputs and outputs.
 */
import { db } from '../../db';
import { 
  investments, 
  transactions, 
  wallets,
  users,
  properties
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { complianceChecker } from '../regulatory-compliance/complianceChecker';
import { paymentProcessor } from '../payments/paymentProcessor';
import { notificationService } from '../notifications/notificationService';
import { tokenService } from '../blockchain/tokenService';

/**
 * Verify investor compliance for an investment
 */
export async function verifyInvestorCompliance(
  userId: string,
  propertyId: string,
  amount: number
): Promise<{ approved: boolean; reason?: string }> {
  try {
    // Use compliance service to check if investment is allowed
    const complianceResult = await complianceChecker.checkInvestmentCompliance(
      userId,
      propertyId,
      amount
    );
    
    return complianceResult;
  } catch (error) {
    console.error('Compliance verification error:', error);
    return {
      approved: false,
      reason: error.message || 'Compliance verification failed'
    };
  }
}

/**
 * Process payment for investment
 */
export async function processPayment(
  userId: string,
  amount: number,
  paymentMethod: string,
  paymentDetails?: any
): Promise<{
  success: boolean;
  paymentId?: string;
  message?: string;
}> {
  try {
    // Use payment service to process payment
    const paymentResult = await paymentProcessor.processPayment({
      userId,
      amount,
      method: paymentMethod,
      details: paymentDetails
    });
    
    return paymentResult;
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      message: error.message || 'Payment processing failed'
    };
  }
}

/**
 * Update investment record in database
 */
export async function updateInvestmentRecord(investmentData: {
  userId: string;
  propertyId: string;
  amount: number;
  paymentId: string;
  status: string;
}): Promise<any> {
  try {
    // Create investment record
    const [investment] = await db.insert(investments)
      .values({
        userId: investmentData.userId,
        propertyId: investmentData.propertyId,
        amount: investmentData.amount.toString(),
        status: investmentData.status as any,
        investedAt: new Date(),
        projectedROI: '0', // This would be calculated based on property data
      })
      .returning();
    
    return investment;
  } catch (error) {
    console.error('Investment record update error:', error);
    throw error;
  }
}

/**
 * Record transaction in database
 */
export async function recordTransaction(transactionData: {
  userId: string;
  type: string;
  amount: number;
  referenceId: string;
  paymentMethod: string;
  status: string;
}): Promise<any> {
  try {
    // Create transaction record
    const [transaction] = await db.insert(transactions)
      .values({
        userId: transactionData.userId,
        type: transactionData.type,
        amount: transactionData.amount.toString(),
        referenceId: transactionData.referenceId,
        paymentMethod: transactionData.paymentMethod,
        status: transactionData.status as any,
        processedAt: new Date()
      })
      .returning();
    
    return transaction;
  } catch (error) {
    console.error('Transaction record error:', error);
    throw error;
  }
}

/**
 * Update user wallet balance
 */
export async function updateWalletBalance(
  userId: string,
  amount: number,
  transactionType: string,
  referenceId: string
): Promise<any> {
  try {
    // Get user wallet
    const [wallet] = await db.select()
      .from(wallets)
      .where(and(
        eq(wallets.userId, userId),
        eq(wallets.type, 'main')
      ));
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    // Update wallet balance
    const currentBalance = parseFloat(wallet.balance.toString());
    const newBalance = currentBalance + amount;
    
    const [updated] = await db.update(wallets)
      .set({
        balance: newBalance.toString(),
        updatedAt: new Date()
      })
      .where(eq(wallets.id, wallet.id))
      .returning();
    
    return updated;
  } catch (error) {
    console.error('Wallet balance update error:', error);
    throw error;
  }
}

/**
 * Distribute investment shares to investor via blockchain
 */
export async function distributeInvestmentShares(
  userId: string,
  propertyId: string,
  amount: number,
  investmentId: string
): Promise<any> {
  try {
    // Get user's blockchain wallet address
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user || !user.walletAddress) {
      throw new Error('User blockchain wallet not found');
    }
    
    // Get property token contract address
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    });
    
    if (!property || !property.tokenContractAddress) {
      throw new Error('Property token contract not found');
    }
    
    // Calculate number of shares based on amount
    const sharesAmount = calculateSharesAmount(amount, property);
    
    // Mint tokens on blockchain (this would call the blockchain service)
    const result = await tokenService.mintPropertyTokens(
      property.tokenContractAddress,
      user.walletAddress,
      sharesAmount,
      investmentId
    );
    
    return result;
  } catch (error) {
    console.error('Share distribution error:', error);
    throw error;
  }
}

/**
 * Calculate number of shares based on investment amount and property details
 */
function calculateSharesAmount(amount: number, property: any): number {
  // This would implement the share calculation logic
  // For simplicity, we'll assume 1 share = $10
  return Math.floor(amount / 10);
}

/**
 * Send notification to investor
 */
export async function notifyInvestor(
  userId: string,
  notificationType: string,
  data: any
): Promise<any> {
  try {
    // Use notification service to send notification
    const result = await notificationService.sendNotification(
      userId,
      notificationType,
      data
    );
    
    return result;
  } catch (error) {
    console.error('Investor notification error:', error);
    // Don't throw error for notification failures
    return { success: false, error: error.message };
  }
}

/**
 * Get all investments for a property
 */
export async function getPropertyInvestments(propertyId: string): Promise<any[]> {
  try {
    // Get all active investments for this property
    const propertyInvestments = await db.select()
      .from(investments)
      .where(and(
        eq(investments.propertyId, propertyId),
        eq(investments.status, 'active')
      ));
    
    return propertyInvestments;
  } catch (error) {
    console.error('Get property investments error:', error);
    throw error;
  }
}