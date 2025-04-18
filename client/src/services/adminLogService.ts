import { apiRequest } from '@/lib/queryClient';

type AdminLogAction = 
  | 'login' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'reject' 
  | 'verify' 
  | 'system_update';

type AdminLogTargetType = 
  | 'user' 
  | 'property' 
  | 'investment' 
  | 'kyc' 
  | 'payment' 
  | 'system' 
  | 'achievement' 
  | 'educational_resource';

interface AdminLogParams {
  action: AdminLogAction;
  targetType: AdminLogTargetType;
  targetId?: number;
  description: string;
  details?: Record<string, any>;
}

/**
 * Logs an administrative action to the system
 * 
 * @param params Log parameters including action type, target, and description
 * @returns Promise that resolves to the log entry if successful
 */
export async function logAdminActivity(params: AdminLogParams): Promise<any> {
  try {
    const response = await apiRequest('POST', '/api/admin-logs', params);
    const result = await response.json();
    return result.log;
  } catch (error) {
    console.error('Failed to log admin activity:', error);
    throw error;
  }
}

/**
 * Fetches admin activity logs with optional filtering
 * 
 * @param options Optional filter options
 * @returns Promise that resolves to an array of log entries
 */
export async function getAdminLogs(options?: { 
  action?: AdminLogAction;
  targetType?: AdminLogTargetType;
  limit?: number;
}): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    
    if (options?.action) params.append('action', options.action);
    if (options?.targetType) params.append('targetType', options.targetType);
    if (options?.limit) params.append('limit', options.limit.toString());
    
    const url = `/api/admin-logs${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiRequest('GET', url);
    return response.json();
  } catch (error) {
    console.error('Failed to fetch admin logs:', error);
    throw error;
  }
}

/**
 * Helper function for logging commonly used admin actions
 */
export const adminLogger = {
  /**
   * Logs a user approval action
   */
  userApproval: (userId: number, details?: Record<string, any>) => {
    return logAdminActivity({
      action: 'approve',
      targetType: 'user',
      targetId: userId,
      description: `User ${userId} was approved`,
      details
    });
  },
  
  /**
   * Logs a KYC verification action
   */
  kycVerification: (userId: number, details?: Record<string, any>) => {
    return logAdminActivity({
      action: 'verify',
      targetType: 'kyc',
      targetId: userId,
      description: `KYC for user ${userId} was verified`,
      details
    });
  },
  
  /**
   * Logs an investment approval action
   */
  investmentApproval: (investmentId: number, details?: Record<string, any>) => {
    return logAdminActivity({
      action: 'approve',
      targetType: 'investment',
      targetId: investmentId,
      description: `Investment ${investmentId} was approved`,
      details
    });
  },
  
  /**
   * Logs a property creation action
   */
  propertyCreation: (propertyId: number, propertyName: string, details?: Record<string, any>) => {
    return logAdminActivity({
      action: 'create',
      targetType: 'property',
      targetId: propertyId,
      description: `Property "${propertyName}" was created`,
      details
    });
  },
  
  /**
   * Logs a property update action
   */
  propertyUpdate: (propertyId: number, propertyName: string, details?: Record<string, any>) => {
    return logAdminActivity({
      action: 'update',
      targetType: 'property',
      targetId: propertyId,
      description: `Property "${propertyName}" was updated`,
      details
    });
  },
  
  /**
   * Logs an ROI distribution action
   */
  roiDistribution: (projectId: number, amount: number, details?: Record<string, any>) => {
    return logAdminActivity({
      action: 'create',
      targetType: 'payment',
      targetId: projectId,
      description: `ROI of ${amount} was distributed for project ${projectId}`,
      details
    });
  },
  
  /**
   * Logs a system settings update
   */
  systemUpdate: (description: string, details?: Record<string, any>) => {
    return logAdminActivity({
      action: 'system_update',
      targetType: 'system',
      description,
      details
    });
  }
};