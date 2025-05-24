/**
 * Centralized Logging System
 * 
 * This module provides a consistent logging interface throughout the application
 * using Winston. It supports different log levels based on environment, file
 * rotation, and integrates with LogDNA for centralized log management.
 */

import * as winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { LogDNATransport } from './logdna-transport';

// Define log directory path
const LOG_DIR = path.join(process.cwd(), 'logs');

// Environment variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_NAME = process.env.APP_NAME || 'ireva-platform';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const LOGDNA_API_KEY = process.env.LOGDNA_API_KEY;
const LOG_LEVEL = process.env.LOG_LEVEL || getDefaultLogLevel();

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Define log format with color based on log level
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  // Format metadata as JSON string if present
  const meta = Object.keys(metadata).length
    ? `\n${JSON.stringify(metadata, null, 2)}`
    : '';
  
  // Format timestamp
  const time = timestamp ? `[${timestamp}]` : '';
  
  return `${time} [${level.toUpperCase()}]: ${message}${meta}`;
});

// Create color console formatter
const colorConsoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  logFormat
);

// Create non-color formatter for file logs
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Custom formatter for structured JSON logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Create daily rotating file transport for general logs
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(LOG_DIR, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d', // Keep logs for 14 days
  format: fileFormat,
});

// Create daily rotating file transport for error logs (separate file)
const errorFileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(LOG_DIR, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d', // Keep error logs for 30 days
  level: 'error',
  format: fileFormat,
});

// Create transports array
const transports: winston.transport[] = [
  // Always log to console 
  new winston.transports.Console({
    format: colorConsoleFormat,
  }),
  // Always log to files
  dailyRotateFileTransport,
  errorFileTransport,
];

// Add LogDNA transport if API key is available
if (LOGDNA_API_KEY) {
  console.log('LogDNA integration enabled');
  transports.push(
    new LogDNATransport({
      apiKey: LOGDNA_API_KEY,
      hostname: os.hostname(),
      app: APP_NAME,
      env: NODE_ENV,
      index_meta: true,
      level: 'info', // Only send info and above to LogDNA to reduce costs
      tags: ['ireva', NODE_ENV, APP_VERSION]
    })
  );
} else {
  console.warn('LogDNA API key not found. External logging is disabled.');
}

// Create log level based on environment
function getDefaultLogLevel(): string {
  switch (NODE_ENV) {
    case 'production':
      return 'info';
    case 'development':
      return 'debug';
    case 'test':
      return 'debug';
    default:
      return 'silly'; // Most verbose level
  }
}

// Configure base logger
const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: structuredFormat,
  defaultMeta: { 
    service: APP_NAME,
    environment: NODE_ENV,
    version: APP_VERSION,
    hostname: os.hostname(),
  },
  transports,
  // Don't exit on uncaught exceptions, just log them
  exitOnError: false,
});

// Set up handlers for uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: formatError(error) });
  // Give time for logs to be written before exiting
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', { 
    reason: formatError(reason), 
    promise 
  });
});

// Create a tenant-aware logger by adding tenant context
export const createTenantLogger = (tenantId: string) => {
  return logger.child({
    tenantId,
  });
};

// Create a child logger with request context
export const createRequestLogger = (req: any) => {
  return logger.child({
    requestId: req.id || 'unknown',
    userId: req.user?.id || 'anonymous',
    tenantId: req.tenant?.id || 'none',
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    path: req.originalUrl || req.url,
    method: req.method,
    userAgent: req.headers?.['user-agent'],
  });
};

// Format error objects for logging
export const formatError = (error: any): any => {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...(error as any),
    };
  }
  
  return error;
};

// Utility function to handle objects or errors in logs
export const formatLogObject = (obj: any): any => {
  if (obj === undefined) return undefined;
  
  if (obj instanceof Error) {
    return formatError(obj);
  }
  
  // Handle nested errors
  if (obj && typeof obj === 'object') {
    const formatted = { ...obj };
    
    if (obj.error instanceof Error) {
      formatted.error = formatError(obj.error);
    }
    
    return formatted;
  }
  
  return obj;
};

// Create HTTP logger middleware function
export const httpLogger = () => {
  return (req: any, res: any, next: Function) => {
    // Log request
    const start = Date.now();
    const requestLogger = createRequestLogger(req);
    
    requestLogger.debug(`${req.method} ${req.url}`);
    
    // Add response logging
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      
      const logLevel = statusCode >= 500 ? 'error' 
                     : statusCode >= 400 ? 'warn' 
                     : 'debug';
      
      requestLogger[logLevel](`${req.method} ${req.url} ${statusCode} ${duration}ms`);
      
      return originalEnd.apply(this, args);
    };
    
    next();
  };
};

// Export logger and convenience methods
export default {
  debug: (message: string, meta?: any) => logger.debug(message, formatLogObject(meta)),
  info: (message: string, meta?: any) => logger.info(message, formatLogObject(meta)),
  warn: (message: string, meta?: any) => logger.warn(message, formatLogObject(meta)),
  error: (message: string, meta?: any) => logger.error(message, formatLogObject(meta)),
  
  // HTTP level logs
  http: (message: string, meta?: any) => logger.http(message, formatLogObject(meta)),
  
  // Stream for Morgan HTTP request logging middleware
  stream: {
    write: (message: string) => {
      logger.http(message.trim());
    },
  },
  
  // Original Winston logger
  winston: logger,
  
  // Create context-aware loggers
  createTenantLogger,
  createRequestLogger,
  
  // HTTP logger middleware
  httpLogger,
  
  // Add LogDNA transport manually (for dynamic configuration)
  addLogDNATransport: (apiKey: string) => {
    if (!logger.transports.some(t => t instanceof LogDNATransport)) {
      logger.add(new LogDNATransport({
        apiKey,
        hostname: os.hostname(),
        app: APP_NAME,
        env: NODE_ENV,
        index_meta: true,
      }));
    }
  },
};