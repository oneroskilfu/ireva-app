import { db } from '../db';
import { adminLogs, insertAdminLogSchema, InsertAdminLog } from '../../shared/schema';
import { Request } from 'express';

/**
 * Admin Logger Service
 * 
 * This service provides methods to log admin actions in the system.
 * It helps track who did what and when, which is essential for audit trails,
 * troubleshooting, and ensuring accountability for administrative actions.
 */
export class AdminLogger {
  /**
   * Log an admin action
   * 
   * @param adminId The ID of the admin performing the action
   * @param action The type of action being performed (create, update, delete, etc.)
   * @param targetType The type of entity being acted upon (user, property, etc.)
   * @param targetId The ID of the specific entity being acted upon
   * @param description A human-readable description of the action
   * @param details Additional details about the action (optional)
   * @param req Express request object (optional, for capturing IP and user agent)
   */
  static async log(
    adminId: number,
    action: InsertAdminLog['action'],
    targetType: InsertAdminLog['targetType'],
    targetId: number,
    description: string,
    details?: any,
    req?: Request
  ): Promise<void> {
    try {
      // Create the log entry
      const logData = insertAdminLogSchema.parse({
        adminId,
        action,
        targetType,
        targetId,
        description,
        details: details || null,
        ipAddress: req?.ip || null,
        userAgent: req?.headers['user-agent'] || null
      });

      // Insert the log into the database
      await db.insert(adminLogs).values(logData);
      
      console.log(`Admin action logged: ${description}`);
    } catch (error) {
      // Log errors but don't throw - logging should never interrupt main functionality
      console.error('Error logging admin action:', error);
    }
  }

  /**
   * Log a login action
   */
  static async logLogin(adminId: number, req?: Request): Promise<void> {
    await this.log(
      adminId,
      'login',
      'user',
      adminId,
      `Admin user ${adminId} logged in`,
      null,
      req
    );
  }
  
  /**
   * Log a KYC verification action
   */
  static async logKycVerification(
    adminId: number, 
    userId: number, 
    status: 'approve' | 'reject', 
    reason?: string,
    req?: Request
  ): Promise<void> {
    const action = status === 'approve' ? 'approve' : 'reject';
    const description = status === 'approve' 
      ? `Admin ${adminId} approved KYC for user ${userId}` 
      : `Admin ${adminId} rejected KYC for user ${userId}`;
    
    await this.log(
      adminId,
      action,
      'kyc',
      userId,
      description,
      { reason },
      req
    );
  }
  
  /**
   * Log a property creation action
   */
  static async logPropertyCreation(
    adminId: number,
    propertyId: number,
    propertyName: string,
    req?: Request
  ): Promise<void> {
    await this.log(
      adminId,
      'create',
      'property',
      propertyId,
      `Admin ${adminId} created property: ${propertyName}`,
      null,
      req
    );
  }
  
  /**
   * Log a property update action
   */
  static async logPropertyUpdate(
    adminId: number,
    propertyId: number,
    propertyName: string,
    changedFields: string[],
    req?: Request
  ): Promise<void> {
    await this.log(
      adminId,
      'update',
      'property',
      propertyId,
      `Admin ${adminId} updated property: ${propertyName}`,
      { changedFields },
      req
    );
  }
  
  /**
   * Log an investment status update
   */
  static async logInvestmentStatusUpdate(
    adminId: number,
    investmentId: number,
    newStatus: string,
    previousStatus: string,
    req?: Request
  ): Promise<void> {
    await this.log(
      adminId,
      'update',
      'investment',
      investmentId,
      `Admin ${adminId} changed investment ${investmentId} status from ${previousStatus} to ${newStatus}`,
      { previousStatus, newStatus },
      req
    );
  }
  
  /**
   * Log a user role change
   */
  static async logUserRoleChange(
    adminId: number,
    userId: number,
    newRole: string,
    previousRole: string,
    req?: Request
  ): Promise<void> {
    await this.log(
      adminId,
      'update',
      'user',
      userId,
      `Admin ${adminId} changed user ${userId} role from ${previousRole} to ${newRole}`,
      { previousRole, newRole },
      req
    );
  }
  
  /**
   * Log a system setting change
   */
  static async logSystemSettingChange(
    adminId: number,
    settingName: string,
    newValue: any,
    previousValue: any,
    req?: Request
  ): Promise<void> {
    await this.log(
      adminId,
      'system_update',
      'system',
      0, // No specific ID for system settings
      `Admin ${adminId} updated system setting: ${settingName}`,
      { 
        setting: settingName, 
        previousValue, 
        newValue 
      },
      req
    );
  }
  
  /**
   * Log educational resource creation
   */
  static async logResourceCreation(
    adminId: number,
    resourceId: number,
    resourceTitle: string,
    req?: Request
  ): Promise<void> {
    await this.log(
      adminId,
      'create',
      'educational_resource',
      resourceId,
      `Admin ${adminId} created educational resource: ${resourceTitle}`,
      null,
      req
    );
  }
}

export default AdminLogger;