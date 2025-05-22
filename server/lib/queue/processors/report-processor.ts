/**
 * Report Generation Processor
 * 
 * Processes jobs in the report generation queue. Handles creating
 * various reports with proper resource management and error handling.
 */

import { Job } from 'bull';
import logger from '../../logger';

// Report types supported by the system
export type ReportType = 
  | 'investor-statement' 
  | 'property-performance' 
  | 'roi-summary'
  | 'portfolio-valuation'
  | 'transaction-history'
  | 'tax-document';

// Format types for generated reports
export type ReportFormat = 'pdf' | 'csv' | 'excel' | 'json';

// Report generation job data interface
export interface ReportJobData {
  reportType: ReportType;
  format: ReportFormat;
  parameters: {
    userId?: number;
    propertyId?: number;
    portfolioId?: number;
    startDate?: string;
    endDate?: string;
    includeCharts?: boolean;
    detailed?: boolean;
    [key: string]: any;
  };
  requestedBy: number; // user ID who requested this report
  notifyOnComplete?: boolean;
  email?: string; // email to send report to when complete
  tenantId?: string;
}

/**
 * Process a report generation job
 * @param job The Bull job containing report configuration
 * @returns Promise resolving when report is generated
 */
export async function processReportJob(job: Job<ReportJobData>): Promise<any> {
  const { data, id, attemptsMade } = job;
  const { reportType, format, parameters, tenantId } = data;
  
  // Set up job-specific logger
  const jobLogger = {
    info: (message: string, meta?: any) => 
      logger.info(message, { ...meta, jobId: id, queue: 'report-generation', attemptsMade, reportType, tenantId }),
    warn: (message: string, meta?: any) => 
      logger.warn(message, { ...meta, jobId: id, queue: 'report-generation', attemptsMade, reportType, tenantId }),
    error: (message: string, meta?: any) => 
      logger.error(message, { ...meta, jobId: id, queue: 'report-generation', attemptsMade, reportType, tenantId }),
    debug: (message: string, meta?: any) => 
      logger.debug(message, { ...meta, jobId: id, queue: 'report-generation', attemptsMade, reportType, tenantId }),
  };
  
  jobLogger.info('Processing report generation job', { format, parameters });
  
  try {
    // 1. Validate parameters for this report type
    validateReportParameters(reportType, parameters);
    
    // 2. Collect data for the report
    jobLogger.info('Collecting data for report');
    const reportData = await collectReportData(reportType, parameters);
    
    // 3. Generate the report in the requested format
    jobLogger.info('Generating report', { format });
    const reportFile = await generateReport(reportType, format, reportData, parameters);
    
    // 4. Store the report file
    jobLogger.info('Storing report file');
    const fileLocation = await storeReportFile(reportFile, data);
    
    // 5. Notify user if requested
    if (data.notifyOnComplete) {
      jobLogger.info('Sending report notification');
      await sendReportNotification(data, fileLocation);
    }
    
    jobLogger.info('Report generation completed successfully');
    
    return { 
      success: true, 
      reportId: `report-${Date.now()}`,
      fileLocation,
      fileSize: reportFile.size,
    };
  } catch (error) {
    // Log detailed error info
    jobLogger.error('Failed to generate report', { 
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
  // Database timeouts, resource constraints, and temporary server issues should be retried
  const retryableErrorMessages = [
    'timeout',
    'connection',
    'memory',
    'resource',
    'temporary',
    'overload',
    'capacity',
    'limit',
    'unavailable',
    'service',
    'network',
  ];
  
  const errorMessage = error?.message?.toLowerCase() || String(error).toLowerCase();
  
  return retryableErrorMessages.some(term => errorMessage.includes(term));
}

/**
 * Move a failed job to a dead letter queue for later analysis
 * @param job The failed job
 */
async function moveToDeadLetter(job: Job<ReportJobData>): Promise<void> {
  try {
    // In a real implementation, this would move the job to a dead-letter queue
    // For now, we'll just log it
    logger.warn(`Moving failed report job ${job.id} to dead-letter queue`, {
      jobId: job.id,
      queue: 'report-generation',
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

/**
 * Validate report parameters
 */
function validateReportParameters(reportType: ReportType, parameters: any): void {
  // In a real implementation, we would validate parameters based on report type
  // For example, investor statements require a userId, property reports require a propertyId
  
  const requiredParams: Record<ReportType, string[]> = {
    'investor-statement': ['userId', 'startDate', 'endDate'],
    'property-performance': ['propertyId'],
    'roi-summary': ['startDate', 'endDate'],
    'portfolio-valuation': ['userId'],
    'transaction-history': ['userId', 'startDate', 'endDate'],
    'tax-document': ['userId', 'startDate', 'endDate'],
  };
  
  const required = requiredParams[reportType] || [];
  
  for (const param of required) {
    if (!parameters[param]) {
      throw new Error(`Missing required parameter for ${reportType} report: ${param}`);
    }
  }
}

/**
 * Collect data for a report
 */
async function collectReportData(reportType: ReportType, parameters: any): Promise<any> {
  // Simulate network delay and data processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Randomly fail sometimes to test retry logic (5% failure rate)
  if (Math.random() < 0.05) {
    throw new Error('Simulated database query timeout');
  }
  
  // Return mock data based on report type
  switch (reportType) {
    case 'investor-statement':
      return {
        investor: {
          id: parameters.userId,
          name: `Investor ${parameters.userId}`,
        },
        period: {
          startDate: parameters.startDate,
          endDate: parameters.endDate,
        },
        investments: [
          { propertyId: 1, amount: 50000, currentValue: 55000, roi: 10 },
          { propertyId: 2, amount: 75000, currentValue: 82500, roi: 10 },
        ],
        transactions: [
          { date: '2023-01-15', type: 'distribution', amount: 1250, propertyId: 1 },
          { date: '2023-02-15', type: 'distribution', amount: 1250, propertyId: 1 },
          { date: '2023-03-15', type: 'distribution', amount: 1250, propertyId: 1 },
          { date: '2023-01-20', type: 'distribution', amount: 1875, propertyId: 2 },
          { date: '2023-02-20', type: 'distribution', amount: 1875, propertyId: 2 },
          { date: '2023-03-20', type: 'distribution', amount: 1875, propertyId: 2 },
        ],
        summary: {
          totalInvested: 125000,
          totalCurrentValue: 137500,
          totalROI: 10,
          totalDistributions: 9375,
        },
      };
      
    case 'property-performance':
      return {
        property: {
          id: parameters.propertyId,
          name: `Property ${parameters.propertyId}`,
          address: `123 Main St, Suite ${parameters.propertyId}`,
          acquisitionDate: '2022-06-01',
          acquisitionPrice: 2500000,
          currentValue: 2750000,
        },
        metrics: {
          occupancyRate: 95,
          netOperatingIncome: 225000,
          capRate: 8.2,
          cashOnCashReturn: 9.5,
          appreciation: 10,
        },
        historicalPerformance: [
          { month: '2023-01', income: 18500, expenses: 7500, cashflow: 11000 },
          { month: '2023-02', income: 18700, expenses: 7200, cashflow: 11500 },
          { month: '2023-03', income: 18900, expenses: 7400, cashflow: 11500 },
        ],
        investments: {
          totalRaised: 2000000,
          investorCount: 15,
          distributions: [
            { date: '2023-01-15', amount: 15000 },
            { date: '2023-02-15', amount: 15000 },
            { date: '2023-03-15', amount: 15000 },
          ],
        },
      };
      
    default:
      return {
        reportType,
        parameters,
        generatedAt: new Date().toISOString(),
        data: {
          // Generic mock data
          summary: {
            totalItems: 25,
            totalValue: 250000,
            averageValue: 10000,
          },
          details: Array(25).fill(0).map((_, i) => ({
            id: i + 1,
            name: `Item ${i + 1}`,
            value: Math.round(5000 + Math.random() * 10000),
            date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          })),
        },
      };
  }
}

// Mock file interface for simulation
interface ReportFile {
  filename: string;
  content: Buffer;
  mimeType: string;
  size: number;
}

/**
 * Generate a report in the requested format
 */
async function generateReport(
  reportType: ReportType,
  format: ReportFormat,
  data: any,
  parameters: any
): Promise<ReportFile> {
  // Simulate report generation (would use actual PDF/CSV generation in production)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Randomly fail sometimes to test retry logic (5% failure rate)
  if (Math.random() < 0.05) {
    throw new Error('Simulated report generation error: insufficient memory');
  }
  
  // Generate unique filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${reportType}-${timestamp}.${format}`;
  
  // In a real implementation, we would generate actual file content
  // based on the format and data
  
  // Mock file content as JSON string (for simulation purposes)
  const mockContent = JSON.stringify({
    reportType,
    format,
    generatedAt: new Date().toISOString(),
    parameters,
    data,
  }, null, 2);
  
  // Create mock file
  return {
    filename,
    content: Buffer.from(mockContent),
    mimeType: getMimeType(format),
    size: mockContent.length,
  };
}

/**
 * Get MIME type for a report format
 */
function getMimeType(format: ReportFormat): string {
  switch (format) {
    case 'pdf': return 'application/pdf';
    case 'csv': return 'text/csv';
    case 'excel': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'json': return 'application/json';
    default: return 'application/octet-stream';
  }
}

/**
 * Store a generated report file
 */
async function storeReportFile(file: ReportFile, jobData: ReportJobData): Promise<string> {
  // Simulate file storage (would use actual file storage in production)
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate a path where the file would be stored
  // In production, this might be a cloud storage URL
  const storagePath = `/reports/${jobData.tenantId || 'default'}/${file.filename}`;
  
  logger.info('Report file stored', {
    path: storagePath,
    size: file.size,
    mimeType: file.mimeType,
  });
  
  return storagePath;
}

/**
 * Send notification that a report is ready
 */
async function sendReportNotification(jobData: ReportJobData, fileLocation: string): Promise<void> {
  // In production, this would queue an email notification
  logger.info('Sending report notification', {
    email: jobData.email,
    reportType: jobData.reportType,
    fileLocation,
  });
}

export default processReportJob;