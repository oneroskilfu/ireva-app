/**
 * Environment Setup Script
 * 
 * Configures environment variables based on the current environment
 * and handles initialization of necessary services.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load logger if available
let logger;
try {
  logger = require('./logger.cjs');
} catch (err) {
  // Fallback to console
  logger = {
    info: (msg, category) => console.log(`[${category || 'ENV'}] ${msg}`),
    warn: (msg, category) => console.warn(`[${category || 'ENV'}] ${msg}`),
    error: (msg, category) => console.error(`[${category || 'ENV'}] ${msg}`)
  };
}

/**
 * Setup environment variables based on current environment
 * @returns {Object} - Environment configuration
 */
function setupEnvironment() {
  logger.info('Setting up environment variables', 'ENV');
  
  // Determine environment
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  // Load appropriate .env file
  const envFiles = [
    '.env',                     // Base .env file
    `.env.${nodeEnv}`,          // Environment-specific .env file
    '.env.local'                // Local overrides
  ];
  
  // Load each env file if it exists
  envFiles.forEach(file => {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      logger.info(`Loading environment from ${file}`, 'ENV');
      dotenv.config({ path: envPath });
    }
  });
  
  // Set default environment variables if not already set
  setDefaultEnvVars();
  
  // Validate critical environment variables
  validateRequiredEnvVars();
  
  // Return current environment info
  return {
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    isReplit: Boolean(process.env.REPL_ID)
  };
}

/**
 * Set default environment variables if not set
 */
function setDefaultEnvVars() {
  // Server defaults
  process.env.PORT = process.env.PORT || '5000';
  process.env.HOST = process.env.HOST || '0.0.0.0';
  process.env.WEBVIEW_PORT = process.env.WEBVIEW_PORT || '3000';
  
  // Security defaults
  if (!process.env.SESSION_SECRET) {
    // Use a fixed secret in development, but warn about it
    if (process.env.NODE_ENV !== 'production') {
      process.env.SESSION_SECRET = 'ireva-dev-session-secret';
      logger.warn('Using default SESSION_SECRET in development. For production, set a strong secret.', 'ENV');
    } else {
      // In production, generate a random secret if missing
      const crypto = require('crypto');
      process.env.SESSION_SECRET = crypto.randomBytes(32).toString('hex');
      logger.warn('Generated random SESSION_SECRET. This will change on restart, invalidating sessions.', 'ENV');
    }
  }
  
  // Database defaults for performance
  process.env.DB_POOL_MAX = process.env.DB_POOL_MAX || '2';
  process.env.DB_POOL_MIN = process.env.DB_POOL_MIN || '0';
  process.env.DB_IDLE_TIMEOUT = process.env.DB_IDLE_TIMEOUT || '5000';
  
  // Replit-specific optimizations
  if (process.env.REPL_ID) {
    process.env.REPLIT_PORT_BINDING = process.env.REPLIT_PORT_BINDING || 'true';
    process.env.STAGED_LOADING = process.env.STAGED_LOADING || 'true';
    
    // Ultra-minimal DB in Replit by default (for fast startup)
    if (process.env.NODE_ENV !== 'production') {
      process.env.ULTRA_MINIMAL_DB = process.env.ULTRA_MINIMAL_DB || 'true';
    }
  }
}

/**
 * Validate that required environment variables are set
 */
function validateRequiredEnvVars() {
  // Array of critical environment variables
  const requiredVars = [];
  
  // Add database URL only in production or if specifically needed
  if (process.env.NODE_ENV === 'production' || process.env.REQUIRE_DB === 'true') {
    requiredVars.push('DATABASE_URL');
  }
  
  // In production, require session secret
  if (process.env.NODE_ENV === 'production') {
    requiredVars.push('SESSION_SECRET');
  }
  
  // Check each required variable
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    
    if (process.env.NODE_ENV === 'production') {
      // In production, fail fast if critical variables are missing
      logger.error(errorMessage, 'ENV');
      throw new Error(errorMessage);
    } else {
      // In development, just warn
      logger.warn(errorMessage, 'ENV');
    }
  }
}

/**
 * Load environment variables from files
 * @param {string} filename - Name of the environment file
 */
function loadEnvFile(filename) {
  const filePath = path.resolve(process.cwd(), filename);
  
  if (fs.existsSync(filePath)) {
    try {
      const result = dotenv.config({ path: filePath });
      if (result.error) {
        logger.error(`Error loading ${filename}: ${result.error.message}`, 'ENV');
      } else {
        logger.info(`Successfully loaded environment from ${filename}`, 'ENV');
      }
    } catch (error) {
      logger.error(`Failed to load ${filename}: ${error.message}`, 'ENV');
    }
  } else {
    logger.info(`Environment file ${filename} not found, skipping`, 'ENV');
  }
}

/**
 * Create default environment files if they don't exist
 */
function createDefaultEnvFiles() {
  const envFilePath = path.resolve(process.cwd(), '.env');
  const envExamplePath = path.resolve(process.cwd(), '.env.example');
  
  // Only create if .env doesn't exist but .env.example does
  if (!fs.existsSync(envFilePath) && fs.existsSync(envExamplePath)) {
    try {
      fs.copyFileSync(envExamplePath, envFilePath);
      logger.info('Created .env file from .env.example', 'ENV');
    } catch (error) {
      logger.error(`Failed to create .env file: ${error.message}`, 'ENV');
    }
  }
}

// Export utility functions
module.exports = {
  setupEnvironment,
  loadEnvFile,
  createDefaultEnvFiles
};

// Run setup when this file is executed directly
if (require.main === module) {
  const env = setupEnvironment();
  logger.info(`Environment setup complete: ${env.nodeEnv} mode`, 'ENV');
}