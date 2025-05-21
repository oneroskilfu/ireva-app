/**
 * Advanced Security Middleware
 * 
 * Implements Zero Trust Security features:
 * - Fine-grained role-based access control
 * - Request validation and sanitization
 * - Session security and token management
 * - Audit logging
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { eq } = require('drizzle-orm');
const { db } = require('../db.cjs');
const { auditLogs } = require('../../shared/schema');

// JWT secret should be stored in secure environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'ireva-super-secret-key-change-in-production';

// Permission definitions for different roles
const rolePermissions = {
  admin: {
    users: ['read', 'create', 'update', 'delete'],
    properties: ['read', 'create', 'update', 'delete'],
    investments: ['read', 'create', 'update', 'delete'],
    transactions: ['read', 'create', 'update', 'delete'],
    kyc: ['read', 'create', 'update', 'delete'],
    documents: ['read', 'create', 'update', 'delete'],
    notifications: ['read', 'create', 'update', 'delete'],
    wallets: ['read', 'update'],
    reports: ['read', 'create']
  },
  manager: {
    users: ['read'],
    properties: ['read', 'create', 'update'],
    investments: ['read', 'update'],
    transactions: ['read'],
    kyc: ['read', 'update'],
    documents: ['read', 'create', 'update'],
    notifications: ['read', 'create'],
    wallets: ['read'],
    reports: ['read']
  },
  investor: {
    users: ['read_own'],
    properties: ['read'],
    investments: ['read_own', 'create_own'],
    transactions: ['read_own', 'create_own'],
    kyc: ['read_own', 'create_own'],
    documents: ['read_own', 'create_own'],
    notifications: ['read_own'],
    wallets: ['read_own', 'update_own'],
    reports: ['read_own']
  }
};

/**
 * Permission check middleware
 * Validates if the user has the required permission for the resource and action
 */
exports.checkPermission = (resource, action) => {
  return (req, res, next) => {
    // Skip for public routes or if already checked
    if (req.skipPermissionCheck) {
      return next();
    }

    // Ensure user exists in request
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: Authentication required'
      });
    }

    // Get user role (default to investor if not set)
    const role = req.user.role || 'investor';
    
    // Check if role exists in permissions
    if (!rolePermissions[role]) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Invalid role'
      });
    }

    // Check if resource exists for the role
    if (!rolePermissions[role][resource]) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You do not have access to this resource'
      });
    }

    // Check if action is allowed for the role and resource
    const allowedActions = rolePermissions[role][resource];
    const isAllowed = 
      allowedActions.includes(action) || 
      (action.endsWith('_own') && allowedActions.includes(action.replace('_own', '')));

    if (!isAllowed) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: You do not have permission to perform this action'
      });
    }

    // Check ownership if action has '_own' suffix
    if (action.endsWith('_own')) {
      req.checkOwnership = true;
    }

    // Permission granted, continue
    next();
  };
};

/**
 * Ownership verification middleware
 * Ensures users can only access their own resources
 */
exports.verifyOwnership = (resourceIdParam, resourceField = 'userId') => {
  return (req, res, next) => {
    // Skip if ownership check is not required or for admins
    if (!req.checkOwnership || req.user.role === 'admin') {
      return next();
    }

    // Get resource ID from parameters, body, or query
    const resourceId = 
      req.params[resourceIdParam] || 
      req.body[resourceIdParam] || 
      req.query[resourceIdParam];

    // If no resource ID is found, allow operation (likely a list/create operation)
    if (!resourceId) {
      return next();
    }

    // Add filter to request to ensure only owned resources are returned
    req.ownershipFilter = {
      field: resourceField,
      value: req.user.id
    };

    next();
  };
};

/**
 * Audit logging middleware
 * Logs all API activities for audit trail
 */
exports.auditLog = (action) => {
  return async (req, res, next) => {
    // Store original end method
    const originalEnd = res.end;
    
    // Get request start time
    const startTime = Date.now();
    
    // Override end method to capture response
    res.end = async function(chunk, encoding) {
      // Restore original end
      res.end = originalEnd;
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      try {
        // Create audit log entry
        await createAuditLog({
          userId: req.user?.id || null,
          action,
          resource: req.originalUrl,
          method: req.method,
          statusCode: res.statusCode,
          requestBody: sanitizeSensitiveData(req.body),
          responseTime,
          ipAddress: getClientIp(req),
          userAgent: req.headers['user-agent'] || 'Unknown',
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error creating audit log:', error);
      }
      
      // Call original end
      return res.end(chunk, encoding);
    };
    
    next();
  };
};

/**
 * Create audit log entry
 */
async function createAuditLog(logData) {
  try {
    // Insert into audit logs table
    await db.insert(auditLogs).values(logData);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Remove sensitive data from request body
 */
function sanitizeSensitiveData(data) {
  if (!data) return null;
  
  // Create a copy of the data
  const sanitized = { ...data };
  
  // List of sensitive fields to remove
  const sensitiveFields = ['password', 'passwordConfirm', 'token', 'secret', 'ssn', 'creditCard'];
  
  // Remove sensitive fields
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Get client IP address
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress;
}

/**
 * Token verification middleware with additional security checks
 */
exports.verifyToken = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const { users, sessions } = require('../../shared/schema');
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User no longer exists'
      });
    }
    
    // Verify session if sessionId exists in token
    if (decoded.sessionId) {
      const [session] = await db.select()
        .from(sessions)
        .where(eq(sessions.id, decoded.sessionId))
        .limit(1);
      
      if (!session || session.isRevoked) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized: Session is invalid or expired'
        });
      }
      
      // Check client fingerprint if available
      if (session.fingerprint && req.headers['x-device-fingerprint']) {
        if (session.fingerprint !== req.headers['x-device-fingerprint']) {
          // Potential session hijacking attempt - revoke session and log
          await db.update(sessions)
            .set({ isRevoked: true, updatedAt: new Date() })
            .where(eq(sessions.id, decoded.sessionId));
          
          await createAuditLog({
            userId: user.id,
            action: 'SESSION_HIJACK_ATTEMPT',
            resource: req.originalUrl,
            method: req.method,
            statusCode: 401,
            ipAddress: getClientIp(req),
            userAgent: req.headers['user-agent'] || 'Unknown',
            timestamp: new Date()
          });
          
          return res.status(401).json({
            status: 'error',
            message: 'Unauthorized: Security violation detected'
          });
        }
      }
      
      // Update session last activity
      await db.update(sessions)
        .set({ lastActivity: new Date() })
        .where(eq(sessions.id, decoded.sessionId));
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: Account is inactive'
      });
    }
    
    // Add user to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: Token expired'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Generate a secure token with device fingerprinting
 */
exports.generateSecureToken = (userId, deviceFingerprint = null) => {
  // Create a session ID
  const sessionId = crypto.randomUUID();
  
  // Create payload
  const payload = {
    id: userId,
    sessionId,
    iat: Math.floor(Date.now() / 1000)
  };
  
  // Generate token
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d'
  });
  
  // Store session in database
  storeSession(sessionId, userId, deviceFingerprint);
  
  return { token, sessionId };
};

/**
 * Store session in database
 */
async function storeSession(sessionId, userId, fingerprint = null) {
  try {
    const { sessions } = require('../../shared/schema');
    
    await db.insert(sessions).values({
      id: sessionId,
      userId,
      fingerprint,
      isRevoked: false,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
  } catch (error) {
    console.error('Failed to store session:', error);
  }
}

/**
 * Revoke session
 */
exports.revokeSession = async (sessionId) => {
  try {
    const { sessions } = require('../../shared/schema');
    
    await db.update(sessions)
      .set({ isRevoked: true, updatedAt: new Date() })
      .where(eq(sessions.id, sessionId));
      
    return true;
  } catch (error) {
    console.error('Failed to revoke session:', error);
    return false;
  }
};

/**
 * Field-level encryption for sensitive data
 */
exports.encryptField = (text, encryptionKey = process.env.ENCRYPTION_KEY) => {
  if (!text) return null;
  
  try {
    // Use a secure encryption key - should be in environment variables
    const key = encryptionKey || 'default-encryption-key-change-in-production';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.padEnd(32).slice(0, 32)), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV and encrypted data
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Decrypt field-level encrypted data
 */
exports.decryptField = (encryptedText, encryptionKey = process.env.ENCRYPTION_KEY) => {
  if (!encryptedText) return null;
  
  try {
    // Use a secure encryption key - should be in environment variables
    const key = encryptionKey || 'default-encryption-key-change-in-production';
    
    // Split IV and encrypted data
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.padEnd(32).slice(0, 32)), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Data validation middleware
 */
exports.validateData = (schema) => {
  return (req, res, next) => {
    try {
      const { body } = req;
      
      // Validate request body against provided schema
      const result = schema.safeParse(body);
      
      if (!result.success) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: result.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      // Add validated data to request
      req.validatedData = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Session timeout middleware
 */
exports.sessionTimeout = (timeout = 30 * 60 * 1000) => { // Default 30 minutes
  return async (req, res, next) => {
    try {
      // Skip if no user or session
      if (!req.user || !req.user.sessionId) {
        return next();
      }
      
      const { sessions } = require('../../shared/schema');
      
      // Get session
      const [session] = await db.select()
        .from(sessions)
        .where(eq(sessions.id, req.user.sessionId))
        .limit(1);
      
      if (!session) {
        return next();
      }
      
      // Check if session has timed out
      const lastActivity = new Date(session.lastActivity).getTime();
      const currentTime = Date.now();
      
      if (currentTime - lastActivity > timeout) {
        // Session has timed out, revoke it
        await db.update(sessions)
          .set({ isRevoked: true, updatedAt: new Date() })
          .where(eq(sessions.id, req.user.sessionId));
        
        return res.status(401).json({
          status: 'error',
          message: 'Session has expired due to inactivity'
        });
      }
      
      // Update session last activity
      await db.update(sessions)
        .set({ lastActivity: new Date() })
        .where(eq(sessions.id, req.user.sessionId));
      
      next();
    } catch (error) {
      next(error);
    }
  };
};