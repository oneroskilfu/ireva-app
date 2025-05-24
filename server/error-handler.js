/**
 * Error Handling & Monitoring System
 * 
 * Provides advanced error handling, logging, and health monitoring
 * for production environments.
 */

// Try to import the logger
let logger;
try {
  logger = require('./logger.cjs');
} catch (err) {
  // Fallback to console if logger not available
  logger = {
    error: (msg, category, details) => console.error(`[${category || 'ERROR'}] ${msg}`, details || ''),
    warn: (msg, category, details) => console.warn(`[${category || 'ERROR'}] ${msg}`, details || ''),
    info: (msg, category, details) => console.info(`[${category || 'ERROR'}] ${msg}`, details || '')
  };
}

// Try to import configuration
let config;
try {
  config = require('./config').config;
} catch (err) {
  // Default configuration if not available
  config = {
    env: {
      isDevelopment: process.env.NODE_ENV !== 'production',
      isProduction: process.env.NODE_ENV === 'production'
    }
  };
}

/**
 * Error handler middleware for Express
 * @param {Error} err - The error that occurred
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Log the error
  const errorId = generateErrorId();
  
  // Determine error type and status code
  const statusCode = determineStatusCode(err);
  const errorType = determineErrorType(err);
  
  // Log with appropriate level based on status
  if (statusCode >= 500) {
    logger.error(`Server error (${errorId}): ${err.message}`, 'SERVER', {
      error: err,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: sanitizeRequestBody(req.body),
      params: req.params,
      query: req.query,
      user: req.session?.user ? { id: req.session.user.id, role: req.session.user.role } : null
    });
  } else {
    logger.warn(`Client error (${errorId}): ${err.message}`, 'CLIENT', {
      error: err,
      url: req.originalUrl,
      method: req.method
    });
  }
  
  // In production, don't expose error details
  const responseError = {
    message: config.env.isProduction 
      ? getPublicErrorMessage(err, statusCode)
      : err.message || 'An error occurred',
    errorId,
    type: errorType
  };
  
  // Add stack trace in development
  if (config.env.isDevelopment) {
    responseError.stack = err.stack;
    responseError.details = err.details || {};
  }
  
  // Send JSON response
  res.status(statusCode).json({ error: responseError });
}

/**
 * Generate a unique error ID for tracking
 * @returns {string} - Unique error ID
 */
function generateErrorId() {
  return `err_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
}

/**
 * Determine appropriate HTTP status code for an error
 * @param {Error} err - The error
 * @returns {number} - HTTP status code
 */
function determineStatusCode(err) {
  // Custom status code if present
  if (err.statusCode) return err.statusCode;
  
  // Standard error mappings
  if (err.name === 'ValidationError') return 400;
  if (err.name === 'UnauthorizedError') return 401;
  if (err.name === 'ForbiddenError') return 403;
  if (err.name === 'NotFoundError') return 404;
  if (err.name === 'ConflictError') return 409;
  if (err.name === 'RateLimitError') return 429;
  
  // Default to 500 for server errors
  return 500;
}

/**
 * Determine the error type for categorization
 * @param {Error} err - The error
 * @returns {string} - Error category
 */
function determineErrorType(err) {
  // Database error detection
  if (err.code && (
    err.code.startsWith('23') || // PostgreSQL constraint errors
    err.code === '42P01' || // Table doesn't exist
    err.message.includes('database') ||
    err.message.includes('sql') ||
    err.message.includes('query')
  )) {
    return 'database_error';
  }
  
  // Authentication errors
  if (err.name === 'UnauthorizedError' || 
      err.name === 'JsonWebTokenError' ||
      err.message.includes('authentication') ||
      err.message.includes('password') ||
      err.message.includes('token') ||
      err.message.includes('login')
  ) {
    return 'auth_error';
  }
  
  // Validation errors
  if (err.name === 'ValidationError' ||
      err.name === 'SyntaxError' ||
      err.message.includes('validation') ||
      err.message.includes('required') ||
      err.message.includes('invalid')
  ) {
    return 'validation_error';
  }
  
  // Resource not found
  if (err.name === 'NotFoundError' ||
      err.message.includes('not found')
  ) {
    return 'not_found';
  }
  
  // Network errors
  if (err.name === 'NetworkError' ||
      err.code === 'ECONNREFUSED' ||
      err.code === 'ENOTFOUND' ||
      err.message.includes('network') ||
      err.message.includes('connection')
  ) {
    return 'network_error';
  }
  
  // Default error type
  return 'server_error';
}

/**
 * Get a sanitized error message suitable for users
 * @param {Error} err - The original error
 * @param {number} statusCode - HTTP status code
 * @returns {string} - User-friendly error message
 */
function getPublicErrorMessage(err, statusCode) {
  // Default messages by status code
  const defaultMessages = {
    400: 'The request was invalid or cannot be processed.',
    401: 'Authentication is required to access this resource.',
    403: 'You do not have permission to access this resource.',
    404: 'The requested resource was not found.',
    409: 'The request conflicts with the current state of the resource.',
    429: 'Too many requests. Please try again later.',
    500: 'An unexpected error occurred on the server.',
    503: 'The service is currently unavailable. Please try again later.'
  };
  
  // Safe error messages that can be exposed in production
  const safeErrorPrefixes = [
    'Invalid input:',
    'Missing required field:',
    'Resource not found:',
    'Validation failed:',
    'Duplicate entry:',
    'Authentication required'
  ];
  
  // Check if error message starts with a safe prefix
  const isSafeMessage = safeErrorPrefixes.some(prefix => 
    err.message && err.message.startsWith(prefix)
  );
  
  if (isSafeMessage) {
    return err.message;
  }
  
  // Fall back to default message for status code
  return defaultMessages[statusCode] || 'An error occurred while processing your request.';
}

/**
 * Sanitize request body to remove sensitive information
 * @param {Object} body - Request body
 * @returns {Object} - Sanitized body
 */
function sanitizeRequestBody(body) {
  if (!body) return {};
  
  // Create a copy to avoid modifying the original
  const sanitized = { ...body };
  
  // List of sensitive fields to redact
  const sensitiveFields = [
    'password', 'passwordConfirmation', 'secret', 'token', 'apiKey', 'key',
    'credential', 'accessToken', 'refreshToken', 'cardNumber', 'cvv', 'ssn',
    'socialSecurity', 'creditCard', 'cc'
  ];
  
  // Redact sensitive fields
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeRequestBody(sanitized[key]);
    }
  });
  
  return sanitized;
}

/**
 * Process-level unhandled error handlers
 */
function setupGlobalErrorHandlers() {
  // Unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection', 'PROCESS', {
      reason: reason instanceof Error ? {
        message: reason.message,
        stack: reason.stack
      } : reason
    });
  });
  
  // Uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', 'PROCESS', {
      error: err,
      stack: err.stack
    });
    
    // In production, give time for logs to flush then exit
    if (config.env.isProduction) {
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  });
  
  // SIGTERM signal handler for graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully', 'PROCESS');
    
    // Implement any cleanup here
    
    process.exit(0);
  });
}

/**
 * Health monitoring middleware
 * @param {Object} options - Health check options
 * @returns {Function} - Express middleware
 */
function healthMonitor(options = {}) {
  // Health check status
  const health = {
    status: 'ok',
    uptime: 0,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'unknown',
      cache: 'unknown',
      auth: 'unknown'
    },
    details: {}
  };
  
  // Update health status periodically
  const startTime = Date.now();
  const updateInterval = options.updateInterval || 60000; // 1 minute
  
  setInterval(async () => {
    try {
      health.uptime = Math.floor((Date.now() - startTime) / 1000);
      health.timestamp = new Date().toISOString();
      
      // Check database if available
      if (options.db) {
        try {
          await options.db.query('SELECT 1');
          health.services.database = 'ok';
        } catch (err) {
          health.services.database = 'error';
          health.details.database = err.message;
        }
      }
      
      // Check auth service if configured
      if (options.auth) {
        health.services.auth = 'ok';
      }
      
      // Set overall status
      health.status = Object.values(health.services).includes('error') ? 'error' : 'ok';
    } catch (err) {
      logger.error('Health check update error', 'HEALTH', { error: err });
    }
  }, updateInterval);
  
  // Return middleware
  return (req, res, next) => {
    if (req.path === '/api/health' || req.path === '/health') {
      const fullReport = req.query.full === 'true' || req.query.details === 'true';
      
      // Basic health response or detailed response
      const response = fullReport ? health : {
        status: health.status,
        uptime: health.uptime,
        timestamp: health.timestamp
      };
      
      return res.status(health.status === 'ok' ? 200 : 503).json(response);
    }
    
    next();
  };
}

// Export functions
module.exports = {
  errorHandler,
  setupGlobalErrorHandlers,
  healthMonitor
};

// For dual module compatibility
if (typeof exports !== 'undefined') {
  exports.errorHandler = errorHandler;
  exports.setupGlobalErrorHandlers = setupGlobalErrorHandlers;
  exports.healthMonitor = healthMonitor;
}