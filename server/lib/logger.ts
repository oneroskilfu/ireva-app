/**
 * Centralized Logging System
 * 
 * This module provides a consistent logging interface throughout the application
 * using Winston. It supports different log levels based on environment, file
 * rotation, and can be extended to support remote logging services.
 */

import * as winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Define log directory path
const LOG_DIR = path.join(process.cwd(), 'logs');

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

// Create log level based on environment
const getLogLevel = (): string => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return 'info';
    case 'development':
      return 'debug';
    case 'test':
      return 'debug';
    default:
      return 'silly'; // Most verbose level
  }
};

// Configure base logger
const logger = winston.createLogger({
  level: getLogLevel(),
  format: structuredFormat,
  defaultMeta: { 
    service: 'ireva-platform',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
  },
  transports: [
    // Always log to console in development
    new winston.transports.Console({
      format: colorConsoleFormat,
    }),
    // Always log to files
    dailyRotateFileTransport,
    errorFileTransport,
  ],
  // Don't exit on uncaught exceptions, just log them
  exitOnError: false,
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
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    path: req.originalUrl || req.url,
    method: req.method,
  });
};

// Utility function to handle objects or errors in logs
export const formatLogObject = (obj: any): any => {
  if (obj instanceof Error) {
    return {
      message: obj.message,
      name: obj.name,
      stack: obj.stack,
      ...(obj as any),
    };
  }
  
  return obj;
};

// Export logger and convenience methods
export default {
  debug: (message: string, meta?: any) => logger.debug(message, formatLogObject(meta)),
  info: (message: string, meta?: any) => logger.info(message, formatLogObject(meta)),
  warn: (message: string, meta?: any) => logger.warn(message, formatLogObject(meta)),
  error: (message: string, meta?: any) => logger.error(message, formatLogObject(meta)),
  
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
};