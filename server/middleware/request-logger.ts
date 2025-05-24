/**
 * Request Logging Middleware
 * 
 * This middleware logs all HTTP requests with details about the request,
 * response time, status code, and other important metrics.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../lib/logger';

// Add request ID type to Express Request
declare global {
  namespace Express {
    interface Request {
      id: string;
      startTime: [number, number]; // hrtime tuple
    }
  }
}

/**
 * Middleware that logs incoming requests and outgoing responses
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Generate unique ID for this request
  req.id = req.headers['x-request-id'] as string || uuidv4();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);
  
  // Record start time (high-resolution time)
  req.startTime = process.hrtime();
  
  // Create request-specific logger
  const requestLog = logger.createRequestLogger(req);
  
  // Log request
  requestLog.info(`Incoming request: ${req.method} ${req.originalUrl}`);
  
  // Track response
  res.on('finish', () => {
    // Calculate request duration
    const hrTime = process.hrtime(req.startTime);
    const durationMs = Math.round(hrTime[0] * 1000 + hrTime[1] / 1000000);
    
    // Determine log level based on status code
    const statusCode = res.statusCode;
    const logLevel = statusCode >= 500 ? 'error'
                   : statusCode >= 400 ? 'warn'
                   : 'info';
    
    // Log response with appropriate level
    const message = `Request completed: ${req.method} ${req.originalUrl} ${statusCode} ${durationMs}ms`;
    
    // Include relevant request data
    const meta = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      durationMs,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      referer: req.headers.referer || '-',
    };
    
    // Add user and tenant info if available
    if (req.user) {
      Object.assign(meta, { 
        userId: req.user.id,
        userEmail: req.user.email
      });
    }
    
    if (req.tenant) {
      Object.assign(meta, { 
        tenantId: req.tenant.id,
        tenantRole: req.tenant.role 
      });
    }
    
    requestLog[logLevel](message, meta);
  });
  
  // Capture errors
  const originalEnd = res.end;
  res.end = function(...args: any[]) {
    if (res.statusCode >= 500) {
      requestLog.error(`Server error in request: ${req.method} ${req.originalUrl}`, {
        error: res.statusMessage,
        stack: new Error().stack
      });
    }
    return originalEnd.apply(this, args);
  };
  
  next();
};

export default requestLogger;