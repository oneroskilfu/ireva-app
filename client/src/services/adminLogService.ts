import { apiRequest } from '@/lib/queryClient';

/**
 * Admin Log Service
 * 
 * This service provides methods to log various admin actions in the iREVA platform.
 * It follows a consistent pattern while allowing for specialized action logging.
 */

class AdminLogService {
  /**
   * Generic method to create an admin log
   */
  async createLog(
    action: string, 
    targetType: string, 
    targetId: number | null, 
    description: string, 
    details?: any
  ) {
    try {
      const response = await apiRequest('POST', '/api/admin-logs', {
        action,
        targetType,
        targetId,
        description,
        details: details ? JSON.stringify(details) : null
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error creating admin log:', error);
      throw error;
    }
  }
  
  // User Management Logs
  async userCreation(userId: number, userData?: any) {
    return this.createLog(
      'create',
      'user',
      userId,
      `Created new user account #${userId}`,
      userData
    );
  }
  
  async userUpdate(userId: number, changes?: any) {
    return this.createLog(
      'update',
      'user',
      userId,
      `Updated user account information for user #${userId}`,
      changes
    );
  }
  
  async userApproval(userId: number, details?: any) {
    return this.createLog(
      'approve',
      'user',
      userId,
      `Approved user account #${userId}`,
      details
    );
  }
  
  // KYC Management Logs
  async kycVerification(userId: number, documents?: any) {
    return this.createLog(
      'verify',
      'kyc',
      userId,
      `Verified KYC documentation for user #${userId}`,
      documents
    );
  }
  
  async kycRejection(userId: number, reason?: string) {
    return this.createLog(
      'reject',
      'kyc',
      userId,
      `Rejected KYC documentation for user #${userId}`,
      { reason }
    );
  }
  
  // Property Management Logs
  async propertyCreation(propertyId: number, propertyName: string, details?: any) {
    return this.createLog(
      'create',
      'property',
      propertyId,
      `Created new property: ${propertyName}`,
      details
    );
  }
  
  async propertyUpdate(propertyId: number, propertyName: string, changes?: any) {
    return this.createLog(
      'update',
      'property',
      propertyId,
      `Updated property: ${propertyName}`,
      changes
    );
  }
  
  // Investment Management Logs
  async investmentApproval(investmentId: number, details?: any) {
    return this.createLog(
      'approve',
      'investment',
      investmentId,
      `Approved investment #${investmentId}`,
      details
    );
  }
  
  async investmentRejection(investmentId: number, reason?: string) {
    return this.createLog(
      'reject',
      'investment',
      investmentId,
      `Rejected investment #${investmentId}`,
      { reason }
    );
  }
  
  async roiDistribution(propertyId: number, amount: number, details?: any) {
    return this.createLog(
      'create',
      'payment',
      propertyId,
      `Distributed ROI payments for property #${propertyId}: ₦${amount.toLocaleString()}`,
      details
    );
  }
  
  // System Logs
  async systemUpdate(description: string, details?: any) {
    return this.createLog(
      'system_update',
      'system',
      null,
      description,
      details
    );
  }
  
  async adminLogin(adminId: number) {
    return this.createLog(
      'login',
      'system',
      adminId,
      `Admin login`,
      { timestamp: new Date().toISOString() }
    );
  }
}

export const adminLogger = new AdminLogService();