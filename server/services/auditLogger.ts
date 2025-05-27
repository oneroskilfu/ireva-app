import { storage } from '../storage';

export interface AuditLogEntry {
  id?: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'user_management' | 'property' | 'investment' | 'kyc' | 'system';
}

export class AuditLogger {
  static async logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    try {
      const auditEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date()
      };

      await storage.createAuditLog(auditEntry);
      
      // Log to console for immediate visibility
      console.log(`[AUDIT] ${entry.action} by ${entry.userEmail} on ${entry.resource}`, {
        resourceId: entry.resourceId,
        severity: entry.severity,
        details: entry.details
      });

      // For critical actions, also log to external monitoring service
      if (entry.severity === 'critical') {
        await this.logToCriticalMonitoring(auditEntry);
      }

    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Ensure audit logging failures don't break the main application
    }
  }

  // Authentication Actions
  static async logLogin(userId: string, userEmail: string, req: any, success: boolean) {
    await this.logAction({
      userId,
      userEmail,
      action: success ? 'USER_LOGIN_SUCCESS' : 'USER_LOGIN_FAILED',
      resource: 'authentication',
      details: {
        success,
        loginMethod: 'email_password'
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: success ? 'low' : 'medium',
      category: 'auth'
    });
  }

  static async logLogout(userId: string, userEmail: string, req: any) {
    await this.logAction({
      userId,
      userEmail,
      action: 'USER_LOGOUT',
      resource: 'authentication',
      details: {},
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'low',
      category: 'auth'
    });
  }

  static async logPasswordChange(userId: string, userEmail: string, req: any) {
    await this.logAction({
      userId,
      userEmail,
      action: 'PASSWORD_CHANGED',
      resource: 'user_account',
      resourceId: userId,
      details: {
        changeMethod: 'user_initiated'
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'medium',
      category: 'auth'
    });
  }

  // User Management Actions
  static async logUserCreation(adminUserId: string, adminEmail: string, newUserId: string, newUserEmail: string, req: any) {
    await this.logAction({
      userId: adminUserId,
      userEmail: adminEmail,
      action: 'USER_CREATED',
      resource: 'user',
      resourceId: newUserId,
      details: {
        newUserEmail,
        createdByAdmin: true
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'medium',
      category: 'user_management'
    });
  }

  static async logUserStatusChange(adminUserId: string, adminEmail: string, targetUserId: string, targetUserEmail: string, newStatus: boolean, req: any) {
    await this.logAction({
      userId: adminUserId,
      userEmail: adminEmail,
      action: newStatus ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      resource: 'user',
      resourceId: targetUserId,
      details: {
        targetUserEmail,
        newStatus,
        previousStatus: !newStatus
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'high',
      category: 'user_management'
    });
  }

  static async logRoleChange(adminUserId: string, adminEmail: string, targetUserId: string, targetUserEmail: string, oldRole: string, newRole: string, req: any) {
    await this.logAction({
      userId: adminUserId,
      userEmail: adminEmail,
      action: 'USER_ROLE_CHANGED',
      resource: 'user',
      resourceId: targetUserId,
      details: {
        targetUserEmail,
        oldRole,
        newRole
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'critical',
      category: 'user_management'
    });
  }

  // Property Management Actions
  static async logPropertyCreation(userId: string, userEmail: string, propertyId: string, propertyTitle: string, req: any) {
    await this.logAction({
      userId,
      userEmail,
      action: 'PROPERTY_CREATED',
      resource: 'property',
      resourceId: propertyId,
      details: {
        propertyTitle,
        createdByAdmin: true
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'medium',
      category: 'property'
    });
  }

  static async logPropertyUpdate(userId: string, userEmail: string, propertyId: string, propertyTitle: string, changes: Record<string, any>, req: any) {
    await this.logAction({
      userId,
      userEmail,
      action: 'PROPERTY_UPDATED',
      resource: 'property',
      resourceId: propertyId,
      details: {
        propertyTitle,
        changes,
        fieldsModified: Object.keys(changes)
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'medium',
      category: 'property'
    });
  }

  static async logPropertyStatusChange(userId: string, userEmail: string, propertyId: string, propertyTitle: string, oldStatus: string, newStatus: string, req: any) {
    await this.logAction({
      userId,
      userEmail,
      action: 'PROPERTY_STATUS_CHANGED',
      resource: 'property',
      resourceId: propertyId,
      details: {
        propertyTitle,
        oldStatus,
        newStatus
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'high',
      category: 'property'
    });
  }

  // KYC Actions
  static async logKYCSubmission(userId: string, userEmail: string, req: any) {
    await this.logAction({
      userId,
      userEmail,
      action: 'KYC_SUBMITTED',
      resource: 'kyc',
      resourceId: userId,
      details: {
        submissionMethod: 'user_portal'
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'medium',
      category: 'kyc'
    });
  }

  static async logKYCApproval(adminUserId: string, adminEmail: string, targetUserId: string, targetUserEmail: string, req: any) {
    await this.logAction({
      userId: adminUserId,
      userEmail: adminEmail,
      action: 'KYC_APPROVED',
      resource: 'kyc',
      resourceId: targetUserId,
      details: {
        targetUserEmail,
        approvedByAdmin: true
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'high',
      category: 'kyc'
    });
  }

  static async logKYCRejection(adminUserId: string, adminEmail: string, targetUserId: string, targetUserEmail: string, reason: string, req: any) {
    await this.logAction({
      userId: adminUserId,
      userEmail: adminEmail,
      action: 'KYC_REJECTED',
      resource: 'kyc',
      resourceId: targetUserId,
      details: {
        targetUserEmail,
        rejectionReason: reason,
        rejectedByAdmin: true
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'high',
      category: 'kyc'
    });
  }

  // Investment Actions
  static async logInvestmentCreated(userId: string, userEmail: string, investmentId: string, propertyId: string, amount: number, req: any) {
    await this.logAction({
      userId,
      userEmail,
      action: 'INVESTMENT_CREATED',
      resource: 'investment',
      resourceId: investmentId,
      details: {
        propertyId,
        amount,
        currency: 'NGN'
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'medium',
      category: 'investment'
    });
  }

  // System Actions
  static async logSystemAction(userId: string, userEmail: string, action: string, details: Record<string, any>, req: any) {
    await this.logAction({
      userId,
      userEmail,
      action: action.toUpperCase(),
      resource: 'system',
      details,
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'medium',
      category: 'system'
    });
  }

  // Security Events
  static async logSecurityEvent(userId: string, userEmail: string, event: string, details: Record<string, any>, req: any) {
    await this.logAction({
      userId,
      userEmail,
      action: `SECURITY_${event.toUpperCase()}`,
      resource: 'security',
      details: {
        ...details,
        securityEvent: true
      },
      ipAddress: this.getClientIP(req),
      userAgent: req.get('User-Agent') || 'unknown',
      severity: 'critical',
      category: 'auth'
    });
  }

  // Helper methods
  private static getClientIP(req: any): string {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.headers['x-forwarded-for']?.split(',')[0] || 
           'unknown';
  }

  private static async logToCriticalMonitoring(entry: AuditLogEntry) {
    // In production, integrate with monitoring services like DataDog, New Relic, etc.
    console.error('[CRITICAL AUDIT EVENT]', {
      action: entry.action,
      user: entry.userEmail,
      resource: entry.resource,
      details: entry.details,
      timestamp: entry.timestamp
    });
  }

  // Query audit logs
  static async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    category?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    return await storage.getAuditLogs(filters);
  }

  // Get audit summary for dashboard
  static async getAuditSummary(timeframe: '24h' | '7d' | '30d' = '24h') {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    return await storage.getAuditSummary(startDate, endDate);
  }
}

export default AuditLogger;