/**
 * Temporal Workflows for iREVA
 * 
 * This file contains the workflow definitions for critical financial processes
 * that require reliability, durability, and visibility.
 */
import { proxyActivities } from '@temporalio/workflow';
import type * as activities from './activities';

// Define activity interfaces
const { 
  verifyInvestorCompliance,
  processPayment, 
  updateInvestmentRecord,
  distributeInvestmentShares,
  notifyInvestor,
  updateWalletBalance,
  recordTransaction
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
  retry: {
    maximumAttempts: 3
  }
});

/**
 * Process New Investment Workflow
 * 
 * Handles the end-to-end process of creating a new investment with
 * built-in reliability and compensation logic if any step fails.
 */
export async function processInvestmentWorkflow(
  investmentData: {
    userId: string;
    propertyId: string;
    amount: number;
    paymentMethod: string;
    paymentDetails?: any;
  }
) {
  // Step 1: Verify investor compliance
  const complianceResult = await verifyInvestorCompliance(
    investmentData.userId,
    investmentData.propertyId,
    investmentData.amount
  );
  
  if (!complianceResult.approved) {
    // Fail early if compliance check fails
    await notifyInvestor(
      investmentData.userId,
      'investment_rejected',
      { 
        reason: complianceResult.reason,
        propertyId: investmentData.propertyId,
        amount: investmentData.amount
      }
    );
    
    return {
      success: false,
      status: 'rejected',
      reason: complianceResult.reason
    };
  }
  
  // Step 2: Process payment
  const paymentResult = await processPayment(
    investmentData.userId,
    investmentData.amount,
    investmentData.paymentMethod,
    investmentData.paymentDetails
  );
  
  if (!paymentResult.success) {
    await notifyInvestor(
      investmentData.userId,
      'payment_failed',
      { 
        reason: paymentResult.message,
        propertyId: investmentData.propertyId,
        amount: investmentData.amount
      }
    );
    
    return {
      success: false,
      status: 'payment_failed',
      reason: paymentResult.message
    };
  }
  
  try {
    // Step 3: Create investment record
    const investment = await updateInvestmentRecord({
      userId: investmentData.userId,
      propertyId: investmentData.propertyId,
      amount: investmentData.amount,
      paymentId: paymentResult.paymentId,
      status: 'active'
    });
    
    // Step 4: Record transaction
    await recordTransaction({
      userId: investmentData.userId,
      type: 'investment',
      amount: investmentData.amount,
      referenceId: investment.id,
      paymentMethod: investmentData.paymentMethod,
      status: 'completed'
    });
    
    // Step 5: Update user wallet balance
    await updateWalletBalance(
      investmentData.userId,
      -investmentData.amount,
      'investment',
      investment.id
    );
    
    // Step 6: Distribute investment shares
    await distributeInvestmentShares(
      investmentData.userId,
      investmentData.propertyId,
      investmentData.amount,
      investment.id
    );
    
    // Step 7: Notify investor of success
    await notifyInvestor(
      investmentData.userId,
      'investment_successful',
      {
        investmentId: investment.id,
        propertyId: investmentData.propertyId,
        amount: investmentData.amount
      }
    );
    
    return {
      success: true,
      status: 'completed',
      investmentId: investment.id
    };
  } catch (error) {
    // If any step fails after payment, we need to refund
    await processPayment(
      investmentData.userId,
      -investmentData.amount, // negative amount for refund
      investmentData.paymentMethod,
      { 
        ...investmentData.paymentDetails,
        refund: true,
        originalPaymentId: paymentResult.paymentId 
      }
    );
    
    await notifyInvestor(
      investmentData.userId,
      'investment_failed',
      {
        propertyId: investmentData.propertyId,
        amount: investmentData.amount,
        reason: error.message || 'Unknown error'
      }
    );
    
    return {
      success: false,
      status: 'failed',
      reason: error.message || 'Unknown error'
    };
  }
}

/**
 * ROI Distribution Workflow
 * 
 * Handles the process of distributing returns to investors
 * with built-in reliability and tracking.
 */
export async function distributeRoiWorkflow(
  distributionData: {
    propertyId: string;
    totalAmount: number;
    distributionDate: string;
    distributionType: 'dividend' | 'interest' | 'capital_gain';
  }
) {
  // Step 1: Get all investments for this property
  const investments = await proxyActivities<typeof activities>({
    startToCloseTimeout: '1 minute'
  }).getPropertyInvestments(distributionData.propertyId);
  
  // Step 2: Calculate distribution amounts
  const totalInvested = investments.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );
  
  const results = [];
  
  // Step 3: Process each investor's distribution
  for (const investment of investments) {
    try {
      // Calculate investor's share
      const percentage = Number(investment.amount) / totalInvested;
      const amount = distributionData.totalAmount * percentage;
      
      // Process payment to investor
      const paymentResult = await processPayment(
        investment.userId,
        amount,
        'platform_wallet',
        {
          description: `ROI distribution for property ${distributionData.propertyId}`,
          distributionType: distributionData.distributionType
        }
      );
      
      if (paymentResult.success) {
        // Record transaction
        await recordTransaction({
          userId: investment.userId,
          type: 'roi_distribution',
          amount,
          referenceId: investment.id,
          paymentMethod: 'platform_wallet',
          status: 'completed'
        });
        
        // Update investor wallet balance
        await updateWalletBalance(
          investment.userId,
          amount,
          'roi_distribution',
          investment.id
        );
        
        // Notify investor
        await notifyInvestor(
          investment.userId,
          'roi_distribution',
          {
            investmentId: investment.id,
            propertyId: distributionData.propertyId,
            amount,
            distributionDate: distributionData.distributionDate,
            distributionType: distributionData.distributionType
          }
        );
        
        results.push({
          investmentId: investment.id,
          userId: investment.userId,
          amount,
          status: 'success'
        });
      } else {
        results.push({
          investmentId: investment.id,
          userId: investment.userId,
          amount,
          status: 'failed',
          reason: paymentResult.message
        });
      }
    } catch (error) {
      results.push({
        investmentId: investment.id,
        userId: investment.userId,
        status: 'failed',
        reason: error.message || 'Unknown error'
      });
    }
  }
  
  return {
    propertyId: distributionData.propertyId,
    totalAmount: distributionData.totalAmount,
    distributionDate: distributionData.distributionDate,
    distributionType: distributionData.distributionType,
    results
  };
}