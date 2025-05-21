/**
 * Enhanced Logging System
 * 
 * Provides comprehensive logging capabilities with timestamps, 
 * categorization, and performance tracking.
 */

// Track application start time for performance metrics
const APP_START_TIME = Date.now();

// Configure log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4
};

// Set current log level based on environment
const CURRENT_LOG_LEVEL = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.INFO 
  : LOG_LEVELS.DEBUG;

// Store recent logs in memory for debugging
const LOG_HISTORY = [];
const MAX_LOG_HISTORY = 500;

/**
 * Log a message with enhanced details
 * 
 * @param {string} message - The message to log
 * @param {string} category - The category of the log (e.g., 'AUTH', 'DB', 'SERVER')
 * @param {number} level - The log level from LOG_LEVELS
 * @param {Object} [details] - Additional details to include in the log
 */
function log(message, category = 'GENERAL', level = LOG_LEVELS.INFO, details = {}) {
  // Skip if below current log level
  if (level < CURRENT_LOG_LEVEL) return;
  
  // Prepare log entry
  const timestamp = new Date().toISOString();
  const elapsed = Date.now() - APP_START_TIME;
  
  // Create base log entry
  const logEntry = {
    timestamp,
    elapsed: `${elapsed}ms`,
    category,
    level: getLevelName(level),
    message
  };
  
  // Add additional details if provided
  if (Object.keys(details).length > 0) {
    logEntry.details = details;
  }
  
  // Store in history
  LOG_HISTORY.unshift(logEntry);
  if (LOG_HISTORY.length > MAX_LOG_HISTORY) {
    LOG_HISTORY.pop();
  }
  
  // Format for console output
  const logPrefix = `[${timestamp.split('T')[1].slice(0, -1)} | ${elapsed}ms | ${category}]`;
  
  // Log to console based on level
  switch (level) {
    case LOG_LEVELS.DEBUG:
      console.debug(`${logPrefix} 🔍 ${message}`, details);
      break;
    case LOG_LEVELS.INFO:
      console.info(`${logPrefix} ℹ️ ${message}`, details);
      break;
    case LOG_LEVELS.WARN:
      console.warn(`${logPrefix} ⚠️ ${message}`, details);
      break;
    case LOG_LEVELS.ERROR:
    case LOG_LEVELS.FATAL:
      console.error(`${logPrefix} 🔴 ${message}`, details);
      
      // For fatal errors, include stack trace
      if (level === LOG_LEVELS.FATAL && details.error) {
        console.error(details.error.stack || details.error);
      }
      break;
  }
}

// Convenience wrappers for different log levels
const logger = {
  debug: (message, category, details) => log(message, category, LOG_LEVELS.DEBUG, details),
  info: (message, category, details) => log(message, category, LOG_LEVELS.INFO, details),
  warn: (message, category, details) => log(message, category, LOG_LEVELS.WARN, details),
  error: (message, category, details) => log(message, category, LOG_LEVELS.ERROR, details),
  fatal: (message, category, details) => log(message, category, LOG_LEVELS.FATAL, details),
  
  // Category-specific shortcuts
  db: {
    debug: (message, details) => log(message, 'DB', LOG_LEVELS.DEBUG, details),
    info: (message, details) => log(message, 'DB', LOG_LEVELS.INFO, details),
    warn: (message, details) => log(message, 'DB', LOG_LEVELS.WARN, details),
    error: (message, details) => log(message, 'DB', LOG_LEVELS.ERROR, details)
  },
  
  auth: {
    debug: (message, details) => log(message, 'AUTH', LOG_LEVELS.DEBUG, details),
    info: (message, details) => log(message, 'AUTH', LOG_LEVELS.INFO, details),
    warn: (message, details) => log(message, 'AUTH', LOG_LEVELS.WARN, details),
    error: (message, details) => log(message, 'AUTH', LOG_LEVELS.ERROR, details)
  },
  
  server: {
    debug: (message, details) => log(message, 'SERVER', LOG_LEVELS.DEBUG, details),
    info: (message, details) => log(message, 'SERVER', LOG_LEVELS.INFO, details),
    warn: (message, details) => log(message, 'SERVER', LOG_LEVELS.WARN, details),
    error: (message, details) => log(message, 'SERVER', LOG_LEVELS.ERROR, details)
  },
  
  // Performance tracking
  performance: {
    /**
     * Create a performance tracker for a specific operation
     * @param {string} operation - Name of the operation being tracked
     * @param {string} [category] - Category for the logs
     * @returns {Object} - Performance tracking methods
     */
    track: (operation, category = 'PERF') => {
      const startTime = Date.now();
      const checkpoints = [];
      
      return {
        checkpoint: (name) => {
          const elapsedSinceStart = Date.now() - startTime;
          const elapsedSinceLastCheckpoint = checkpoints.length > 0 
            ? elapsedSinceStart - checkpoints[checkpoints.length - 1].elapsed 
            : elapsedSinceStart;
          
          const checkpoint = {
            name,
            elapsed: elapsedSinceStart,
            delta: elapsedSinceLastCheckpoint
          };
          
          checkpoints.push(checkpoint);
          
          log(
            `${operation} - Checkpoint: ${name} (${elapsedSinceStart}ms, +${elapsedSinceLastCheckpoint}ms)`,
            category,
            LOG_LEVELS.DEBUG
          );
          
          return checkpoint;
        },
        
        end: (additionalDetails = {}) => {
          const totalTime = Date.now() - startTime;
          
          log(
            `${operation} - Completed in ${totalTime}ms`,
            category,
            LOG_LEVELS.INFO,
            {
              operation,
              totalTime,
              checkpoints,
              ...additionalDetails
            }
          );
          
          return totalTime;
        }
      };
    }
  },
  
  // Access to log history
  getHistory: () => [...LOG_HISTORY],
  
  // Clear log history
  clearHistory: () => {
    LOG_HISTORY.length = 0;
  }
};

/**
 * Get the string representation of a log level
 * @param {number} level - The log level number
 * @returns {string} - The log level name
 */
function getLevelName(level) {
  return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level) || 'UNKNOWN';
}

// Export the logger
module.exports = logger;