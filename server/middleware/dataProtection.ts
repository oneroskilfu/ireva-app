/**
 * Production Database Protection Middleware
 * Ensures only authorized admin users can perform destructive operations
 */

import { Request, Response, NextFunction } from 'express';
import AuditLogger from '../services/auditLogger';

// Define destructive operations that require special protection
const DESTRUCTIVE_OPERATIONS = [
  'DELETE',
  'DROP',
  'TRUNCATE',
  'UPDATE',
  'INSERT'
];

const PROTECTED_TABLES = [
  'users',
  'properties',
  'investments',
  'kyc_documents',
  'audit_logs',
  'sessions'
];

interface ProtectedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class DatabaseProtectionService {
  
  // Middleware to protect destructive database operations
  static requireAdminForDestructiveOps() {
    return async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const method = req.method;
      const path = req.path;
      
      // Check if this is a potentially destructive operation
      if (this.isDestructiveOperation(method, path)) {
        
        // Ensure user is authenticated
        if (!req.user) {
          await AuditLogger.logSecurityEvent(
            'anonymous_user', 
            'anonymous@unknown.com',
            'UNAUTHORIZED_DESTRUCTIVE_ATTEMPT',
            { method, path, ip: req.ip },
            req
          );
          
          return res.status(401).json({ 
            message: 'Authentication required for this operation' 
          });
        }

        // Ensure user has admin role
        if (req.user.role !== 'admin') {
          await AuditLogger.logSecurityEvent(
            req.user.id,
            req.user.email,
            'UNAUTHORIZED_ADMIN_ATTEMPT',
            { 
              method, 
              path, 
              userRole: req.user.role,
              ip: req.ip 
            },
            req
          );
          
          return res.status(403).json({ 
            message: 'Admin privileges required for this operation' 
          });
        }

        // Log the destructive operation attempt
        await AuditLogger.logSystemAction(
          req.user.id,
          req.user.email,
          `DESTRUCTIVE_OPERATION_${method}`,
          {
            path,
            operation: 'database_modification',
            protection_level: 'admin_required'
          },
          req
        );
      }

      next();
    };
  }

  // Check if the operation is potentially destructive
  private static isDestructiveOperation(method: string, path: string): boolean {
    // DELETE requests are always destructive
    if (method === 'DELETE') return true;
    
    // PUT/PATCH requests to certain endpoints
    if (['PUT', 'PATCH'].includes(method)) {
      const destructivePaths = [
        '/api/admin/users',
        '/api/admin/properties', 
        '/api/properties',
        '/api/admin/kyc',
        '/api/admin/investments'
      ];
      
      return destructivePaths.some(destructivePath => 
        path.startsWith(destructivePath)
      );
    }

    return false;
  }

  // Validate bulk operations have size limits
  static validateBulkOperations() {
    return (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const { body } = req;
      
      // Check for bulk operations
      if (Array.isArray(body)) {
        const MAX_BULK_SIZE = 100; // Limit bulk operations
        
        if (body.length > MAX_BULK_SIZE) {
          return res.status(400).json({
            message: `Bulk operations limited to ${MAX_BULK_SIZE} items`,
            provided: body.length
          });
        }
      }

      // Check for batch update operations
      if (body.batch && Array.isArray(body.batch)) {
        const MAX_BATCH_SIZE = 50;
        
        if (body.batch.length > MAX_BATCH_SIZE) {
          return res.status(400).json({
            message: `Batch operations limited to ${MAX_BATCH_SIZE} items`,
            provided: body.batch.length
          });
        }
      }

      next();
    };
  }

  // Prevent cascading deletes without explicit confirmation
  static requireDeleteConfirmation() {
    return (req: ProtectedRequest, res: Response, next: NextFunction) => {
      if (req.method === 'DELETE') {
        const { confirm } = req.query;
        const { force } = req.body;
        
        // Require explicit confirmation for delete operations
        if (!confirm && !force) {
          return res.status(400).json({
            message: 'Delete operations require explicit confirmation',
            hint: 'Add ?confirm=true to query parameters or force: true in request body'
          });
        }

        // Log the confirmed deletion
        if (req.user) {
          AuditLogger.logSystemAction(
            req.user.id,
            req.user.email,
            'CONFIRMED_DELETE_OPERATION',
            {
              path: req.path,
              confirmation_method: confirm ? 'query_param' : 'body_param'
            },
            req
          );
        }
      }

      next();
    };
  }

  // Backup validation before critical operations
  static requireBackupConfirmation() {
    return async (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const criticalOperations = [
        'DELETE /api/admin/users',
        'DELETE /api/admin/properties',
        'DELETE /api/properties'
      ];

      const operation = `${req.method} ${req.path}`;
      const isCritical = criticalOperations.some(critical => 
        operation.startsWith(critical)
      );

      if (isCritical) {
        const { backup_confirmed } = req.headers;
        
        if (!backup_confirmed || backup_confirmed !== 'true') {
          return res.status(428).json({
            message: 'Critical operation requires backup confirmation',
            required_header: 'backup_confirmed: true',
            recommendation: 'Ensure recent database backup exists before proceeding'
          });
        }

        // Log backup confirmation
        if (req.user) {
          await AuditLogger.logSystemAction(
            req.user.id,
            req.user.email,
            'CRITICAL_OPERATION_WITH_BACKUP_CONFIRMATION',
            { operation, backup_confirmed: true },
            req
          );
        }
      }

      next();
    };
  }

  // Rate limiting for destructive operations
  static rateLimitDestructiveOps() {
    const attempts = new Map<string, { count: number; resetTime: number }>();
    const WINDOW_MS = 60 * 60 * 1000; // 1 hour
    const MAX_ATTEMPTS = 10; // Max 10 destructive operations per hour per user

    return (req: ProtectedRequest, res: Response, next: NextFunction) => {
      if (!req.user || !this.isDestructiveOperation(req.method, req.path)) {
        return next();
      }

      const userId = req.user.id;
      const now = Date.now();
      const userAttempts = attempts.get(userId);

      if (!userAttempts || now > userAttempts.resetTime) {
        // Reset or initialize counter
        attempts.set(userId, { count: 1, resetTime: now + WINDOW_MS });
        return next();
      }

      if (userAttempts.count >= MAX_ATTEMPTS) {
        // Log rate limit violation
        AuditLogger.logSecurityEvent(
          userId,
          req.user.email,
          'DESTRUCTIVE_OPERATION_RATE_LIMIT_EXCEEDED',
          { 
            attempts: userAttempts.count,
            window_ms: WINDOW_MS,
            method: req.method,
            path: req.path
          },
          req
        );

        return res.status(429).json({
          message: 'Too many destructive operations',
          limit: MAX_ATTEMPTS,
          window: '1 hour',
          reset_time: new Date(userAttempts.resetTime).toISOString()
        });
      }

      // Increment counter
      userAttempts.count++;
      attempts.set(userId, userAttempts);
      
      next();
    };
  }

  // Validate input to prevent SQL injection attempts
  static validateInput() {
    return (req: ProtectedRequest, res: Response, next: NextFunction) => {
      const suspiciousPatterns = [
        /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b)/i,
        /('|\"|;|--|\*|\bOR\b|\bAND\b).*(\bOR\b|\bAND\b)/i,
        /(script|javascript|vbscript|onload|onerror)/i
      ];

      const checkValue = (value: any, path: string = ''): boolean => {
        if (typeof value === 'string') {
          return suspiciousPatterns.some(pattern => pattern.test(value));
        }
        
        if (typeof value === 'object' && value !== null) {
          return Object.entries(value).some(([key, val]) => 
            checkValue(val, `${path}.${key}`)
          );
        }
        
        return false;
      };

      // Check query parameters
      if (checkValue(req.query)) {
        return res.status(400).json({
          message: 'Invalid characters detected in query parameters'
        });
      }

      // Check request body
      if (checkValue(req.body)) {
        return res.status(400).json({
          message: 'Invalid characters detected in request body'
        });
      }

      next();
    };
  }
}

// Production environment additional protections
export const productionDbProtection = () => {
  const middlewares = [];
  
  // Always apply input validation
  middlewares.push(DatabaseProtectionService.validateInput());
  
  // Apply bulk operation limits
  middlewares.push(DatabaseProtectionService.validateBulkOperations());
  
  if (process.env.NODE_ENV === 'production') {
    // In production, apply all protections
    middlewares.push(DatabaseProtectionService.requireAdminForDestructiveOps());
    middlewares.push(DatabaseProtectionService.requireDeleteConfirmation());
    middlewares.push(DatabaseProtectionService.requireBackupConfirmation());
    middlewares.push(DatabaseProtectionService.rateLimitDestructiveOps());
  }
  
  return middlewares;
};

export default DatabaseProtectionService;