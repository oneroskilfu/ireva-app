/**
 * Temporal Client for iREVA
 * 
 * This file provides client functions to start and interact with Temporal workflows.
 */
import { Connection, Client } from '@temporalio/client';

// Singleton instance of the Temporal client
let temporalClient: Client | null = null;

/**
 * Initialize and get the Temporal client
 */
export async function getTemporalClient(): Promise<Client> {
  if (temporalClient) {
    return temporalClient;
  }
  
  try {
    // Connect to Temporal server
    const connection = await Connection.connect({
      // For production, configure with proper Temporal server address
      address: process.env.TEMPORAL_ADDRESS || 'localhost:7233'
    });
    
    // Create client from connection
    temporalClient = new Client({
      connection,
      namespace: 'default' // Use appropriate namespace in production
    });
    
    console.log('Temporal client connected successfully');
    
    return temporalClient;
  } catch (error) {
    console.error('Failed to connect Temporal client:', error);
    
    // Create a mock client for development/testing
    temporalClient = createMockClient();
    
    return temporalClient;
  }
}

/**
 * Create a mock Temporal client for development environments
 */
function createMockClient(): Client {
  console.warn('Using mock Temporal client - for development only');
  
  // Create a simple mock implementation
  const mockClient: any = {
    workflow: {
      start: async (options: any) => {
        console.log('Mock workflow started:', options);
        const workflowId = `mock-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        
        // Simulate workflow execution with a timeout
        setTimeout(() => {
          if (mockWorkflowHandlers[options.workflowName]) {
            const result = mockWorkflowHandlers[options.workflowName](options.args[0]);
            console.log(`Mock workflow ${workflowId} completed:`, result);
          }
        }, 500);
        
        return { workflowId };
      },
      
      getHandle: (workflowId: string) => {
        return {
          result: async () => {
            console.log(`Mock getting result for workflow ${workflowId}`);
            return { success: true, status: 'completed', mockWorkflowId: workflowId };
          },
          cancel: async () => {
            console.log(`Mock cancelling workflow ${workflowId}`);
            return;
          },
          query: async (queryName: string) => {
            console.log(`Mock query ${queryName} for workflow ${workflowId}`);
            return { status: 'COMPLETED' };
          }
        };
      }
    }
  };
  
  return mockClient as Client;
}

// Mock workflow handlers for development
const mockWorkflowHandlers: Record<string, (arg: any) => any> = {
  processInvestmentWorkflow: (data) => {
    return {
      success: true,
      status: 'completed',
      investmentId: `mock-investment-${Date.now()}`
    };
  },
  
  distributeRoiWorkflow: (data) => {
    return {
      propertyId: data.propertyId,
      totalAmount: data.totalAmount,
      distributionDate: data.distributionDate,
      results: [
        {
          investmentId: 'mock-investment-1',
          userId: 'mock-user-1',
          amount: data.totalAmount * 0.3,
          status: 'success'
        },
        {
          investmentId: 'mock-investment-2',
          userId: 'mock-user-2',
          amount: data.totalAmount * 0.7,
          status: 'success'
        }
      ]
    };
  }
};

/**
 * Start a new investment workflow
 */
export async function startInvestmentWorkflow(investmentData: {
  userId: string;
  propertyId: string;
  amount: number;
  paymentMethod: string;
  paymentDetails?: any;
}): Promise<string> {
  const client = await getTemporalClient();
  
  const handle = await client.workflow.start('processInvestmentWorkflow', {
    args: [investmentData],
    taskQueue: 'ireva-financial-tasks',
    workflowId: `investment-${investmentData.userId}-${Date.now()}`,
    searchAttributes: {
      CustomStringField: investmentData.propertyId
    }
  });
  
  console.log(`Started investment workflow ${handle.workflowId}`);
  
  return handle.workflowId;
}

/**
 * Start a new ROI distribution workflow
 */
export async function startRoiDistributionWorkflow(distributionData: {
  propertyId: string;
  totalAmount: number;
  distributionDate: string;
  distributionType: 'dividend' | 'interest' | 'capital_gain';
}): Promise<string> {
  const client = await getTemporalClient();
  
  const handle = await client.workflow.start('distributeRoiWorkflow', {
    args: [distributionData],
    taskQueue: 'ireva-financial-tasks',
    workflowId: `roi-distribution-${distributionData.propertyId}-${Date.now()}`,
    searchAttributes: {
      CustomStringField: distributionData.propertyId
    }
  });
  
  console.log(`Started ROI distribution workflow ${handle.workflowId}`);
  
  return handle.workflowId;
}

/**
 * Get workflow result
 */
export async function getWorkflowResult(workflowId: string): Promise<any> {
  const client = await getTemporalClient();
  
  const handle = client.workflow.getHandle(workflowId);
  const result = await handle.result();
  
  return result;
}

/**
 * Initialize Temporal service
 */
export async function initializeTemporalService(): Promise<void> {
  await getTemporalClient();
  console.log('Temporal service initialized');
}