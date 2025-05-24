/**
 * Email Queue Processor
 * 
 * Processes jobs in the email queue. Handles email sending with
 * retry logic and proper error handling.
 */

import { Job } from 'bull';
import logger from '../../logger';

// Email job data interface
export interface EmailJobData {
  to: string | string[];
  subject: string;
  template: string;
  context: Record<string, any>;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  priority?: 'high' | 'normal' | 'low';
  tenantId?: string;
}

/**
 * Process an email job
 * @param job The Bull job containing email data
 * @returns Promise resolving when email is sent
 */
export async function processEmailJob(job: Job<EmailJobData>): Promise<any> {
  const { data, id, attemptsMade } = job;
  const { to, subject, template, context, tenantId } = data;
  
  // Create logger with job context
  const jobLogger = logger.child({
    jobId: id,
    queue: 'email',
    attemptsMade,
    to,
    subject,
    template,
    tenantId,
  });
  
  jobLogger.info('Processing email job');
  
  try {
    // For now, we'll just log the email data
    // In a real implementation, this would call an email service
    jobLogger.info('Would send email with data', { data });
    
    // Simulate sending an email
    await simulateSendEmail(data);
    
    jobLogger.info('Email sent successfully');
    return { success: true, messageId: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}` };
  } catch (error) {
    // Log detailed error info
    jobLogger.error('Failed to send email', { 
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
  // Network errors, rate limits, and temporary server issues should be retried
  const retryableErrorMessages = [
    'timeout',
    'connection',
    'network',
    'econnreset',
    'econnrefused',
    'socket',
    'rate limit',
    'too many requests',
    '429',
    '503',
    '500',
    'throttle',
  ];
  
  const errorMessage = error?.message?.toLowerCase() || String(error).toLowerCase();
  
  return retryableErrorMessages.some(term => errorMessage.includes(term));
}

/**
 * Move a failed job to a dead letter queue for later analysis
 * @param job The failed job
 */
async function moveToDeadLetter(job: Job<EmailJobData>): Promise<void> {
  try {
    // In a real implementation, this would move the job to a dead-letter queue
    // For now, we'll just log it
    logger.warn(`Moving failed email job ${job.id} to dead-letter queue`, {
      jobId: job.id,
      queue: 'email',
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

/**
 * Simulate sending an email (placeholder for actual implementation)
 * @param data Email job data
 */
async function simulateSendEmail(data: EmailJobData): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Randomly fail sometimes to test retry logic (10% failure rate)
  if (Math.random() < 0.1) {
    throw new Error('Simulated transient email sending failure');
  }
}

export default processEmailJob;