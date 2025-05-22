/**
 * ROI Distribution Processor
 * 
 * Processes jobs in the ROI distribution queue. Handles calculating and 
 * distributing returns to investors with proper transaction management
 * and error handling.
 */

import { Job } from 'bull';
import logger from '../../logger';

// ROI distribution job data interface
export interface ROIDistributionJobData {
  propertyId: number;
  periodId: number;
  distributionDate: string;
  totalAmount: number;
  calculationMethod: 'pro-rata' | 'fixed';
  overrideRates?: Record<string, number>; // userId -> rate override
  tenantId?: string;
  initiatedBy: number; // admin user ID who initiated this distribution
}

/**
 * Process an ROI distribution job
 * @param job The Bull job containing distribution data
 * @returns Promise resolving when distribution is complete
 */
export async function processROIDistributionJob(job: Job<ROIDistributionJobData>): Promise<any> {
  const { data, id, attemptsMade } = job;
  const { propertyId, periodId, totalAmount, tenantId } = data;
  
  // Create logger with job context
  const jobLogger = logger.child({
    jobId: id,
    queue: 'roi-distribution',
    attemptsMade,
    propertyId,
    periodId,
    totalAmount,
    tenantId,
  });
  
  jobLogger.info('Processing ROI distribution job');
  
  try {
    // Begin transaction (this would use your actual database in production)
    jobLogger.info('Beginning ROI distribution transaction');
    
    // 1. Load property and verify it exists
    const property = await simulateLoadProperty(propertyId);
    
    // 2. Load all investments for this property
    const investments = await simulateLoadInvestments(propertyId);
    
    // 3. Calculate distribution amounts
    const distributions = calculateDistributions(
      investments, 
      totalAmount, 
      data.calculationMethod,
      data.overrideRates
    );
    
    // 4. Record distribution in the database
    await simulateRecordDistribution(data, distributions);
    
    // 5. Add an email job for each investor
    await simulateQueueInvestorEmails(distributions, property);
    
    // 6. Commit transaction
    jobLogger.info('Committing ROI distribution transaction');
    
    // Log successful completion
    jobLogger.info('ROI distribution completed successfully', {
      distributionCount: distributions.length,
      totalDistributed: distributions.reduce((sum, d) => sum + d.amount, 0),
    });
    
    return { 
      success: true, 
      distributionCount: distributions.length,
      distributionId: `dist-${Date.now()}`,
    };
  } catch (error) {
    // Log detailed error info
    jobLogger.error('Failed to process ROI distribution', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Determine if we should retry based on error type
    const isTransientError = isRetryableError(error);
    
    if (isTransientError && attemptsMade < job.opts.attempts! - 1) {
      jobLogger.info('Transient error detected, job will be retried');
      // Re-throw to trigger Bull's retry mechanism
      throw error;
    } else if (!isTransientError) {
      jobLogger.warn('Permanent error detected, not retrying');
      // For permanent failures, we might want to store this in a dead-letter queue
      await moveToDeadLetter(job);
      // Return failure but don't throw (prevents further retries)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        permanent: true
      };
    }
    
    // Re-throw for normal retry handling
    throw error;
  }
}

/**
 * Determines if an error is transient and should be retried
 * @param error The error to analyze
 * @returns boolean indicating if retry should be attempted
 */
function isRetryableError(error: any): boolean {
  // Database connection issues, locks, and temporary server errors should be retried
  const retryableErrorMessages = [
    'connection',
    'timeout',
    'deadlock',
    'lock',
    'constraint',
    'unavailable',
    'econnreset',
    'network',
    '500',
    'socket',
  ];
  
  const errorMessage = error?.message?.toLowerCase() || String(error).toLowerCase();
  
  return retryableErrorMessages.some(term => errorMessage.includes(term));
}

/**
 * Move a failed job to a dead letter queue for later analysis
 * @param job The failed job
 */
async function moveToDeadLetter(job: Job<ROIDistributionJobData>): Promise<void> {
  try {
    // In a real implementation, this would move the job to a dead-letter queue
    // For now, we'll just log it
    logger.warn(`Moving failed ROI distribution job ${job.id} to dead-letter queue`, {
      jobId: job.id,
      queue: 'roi-distribution',
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      data: job.data,
    });
  } catch (error) {
    logger.error(`Failed to move job ${job.id} to dead-letter queue`, {
      error,
      jobId: job.id,
    });
  }
}

// Simulation helpers for development/testing

interface Property {
  id: number;
  name: string;
  address: string;
  totalInvestment: number;
  expectedROI: number;
}

interface Investment {
  id: number;
  userId: number;
  propertyId: number;
  amount: number;
  stake: number; // percentage of total investment
  investor: {
    id: number;
    name: string;
    email: string;
  };
}

interface Distribution {
  investmentId: number;
  userId: number;
  amount: number;
  percentage: number;
  investorName: string;
  investorEmail: string;
}

/**
 * Simulate loading a property from the database
 */
async function simulateLoadProperty(propertyId: number): Promise<Property> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Randomly fail sometimes to test retry logic (5% failure rate)
  if (Math.random() < 0.05) {
    throw new Error('Simulated database connection error');
  }
  
  return {
    id: propertyId,
    name: `Property ${propertyId}`,
    address: `123 Main St, Suite ${propertyId}, Anytown, USA`,
    totalInvestment: 1000000,
    expectedROI: 8.5,
  };
}

/**
 * Simulate loading investments for a property
 */
async function simulateLoadInvestments(propertyId: number): Promise<Investment[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 150));
  
  // Create 5-10 random investments
  const count = 5 + Math.floor(Math.random() * 6);
  const investments: Investment[] = [];
  
  let totalStake = 0;
  
  for (let i = 1; i <= count - 1; i++) {
    const stake = Math.random() * (100 - totalStake) * 0.8;
    totalStake += stake;
    
    investments.push({
      id: i,
      userId: 1000 + i,
      propertyId,
      amount: 1000000 * (stake / 100),
      stake,
      investor: {
        id: 1000 + i,
        name: `Investor ${1000 + i}`,
        email: `investor${1000 + i}@example.com`,
      }
    });
  }
  
  // Add the last investor with the remaining stake
  const finalStake = 100 - totalStake;
  investments.push({
    id: count,
    userId: 1000 + count,
    propertyId,
    amount: 1000000 * (finalStake / 100),
    stake: finalStake,
    investor: {
      id: 1000 + count,
      name: `Investor ${1000 + count}`,
      email: `investor${1000 + count}@example.com`,
    }
  });
  
  return investments;
}

/**
 * Calculate distribution amounts based on investments and total amount
 */
function calculateDistributions(
  investments: Investment[],
  totalAmount: number,
  method: 'pro-rata' | 'fixed',
  overrideRates?: Record<string, number>
): Distribution[] {
  return investments.map(investment => {
    let percentage = investment.stake;
    
    // Apply any overrides if specified
    if (overrideRates && overrideRates[investment.userId.toString()]) {
      percentage = overrideRates[investment.userId.toString()];
    }
    
    let amount: number;
    if (method === 'pro-rata') {
      // Distribute proportionally to stake
      amount = totalAmount * (percentage / 100);
    } else {
      // Fixed rate (e.g., override rates specify absolute amounts)
      amount = overrideRates?.[investment.userId.toString()] || 0;
    }
    
    return {
      investmentId: investment.id,
      userId: investment.userId,
      amount,
      percentage,
      investorName: investment.investor.name,
      investorEmail: investment.investor.email,
    };
  });
}

/**
 * Simulate recording the distribution in the database
 */
async function simulateRecordDistribution(
  jobData: ROIDistributionJobData,
  distributions: Distribution[]
): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Randomly fail sometimes to test retry logic (5% failure rate)
  if (Math.random() < 0.05) {
    throw new Error('Simulated database write error');
  }
  
  logger.info('Recorded ROI distribution', {
    propertyId: jobData.propertyId,
    periodId: jobData.periodId,
    distributionDate: jobData.distributionDate,
    distributionCount: distributions.length,
    totalDistributed: distributions.reduce((sum, d) => sum + d.amount, 0),
  });
}

/**
 * Simulate queuing email notifications for investors
 */
async function simulateQueueInvestorEmails(
  distributions: Distribution[],
  property: Property
): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  logger.info('Queued investor notification emails', {
    count: distributions.length,
    property: property.name,
  });
}

export default processROIDistributionJob;