/**
 * Configuration Module
 * 
 * Centralizes environment variables and configuration settings
 * for the iREVA platform with proper production/development modes.
 */

// Base configuration with defaults
const config = {
  // Server settings
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || '0.0.0.0',
    webviewPort: parseInt(process.env.WEBVIEW_PORT || '3000', 10),
    bootstrapPort: parseInt(process.env.BOOTSTRAP_PORT || '3001', 10),
    apiPrefix: '/api'
  },
  
  // Environment settings
  env: {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    stagedLoading: process.env.STAGED_LOADING === 'true',
    minimalStartup: process.env.MINIMAL_STARTUP === 'true', 
    ultraMinimalDb: process.env.ULTRA_MINIMAL_DB === 'true',
    replitPortBinding: process.env.REPLIT_PORT_BINDING === 'true',
    logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
  },
  
  // Database settings
  database: {
    url: process.env.DATABASE_URL,
    poolMax: parseInt(process.env.DB_POOL_MAX || '2', 10),
    poolMin: parseInt(process.env.DB_POOL_MIN || '0', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '5000', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '300', 10),
    statementTimeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '2000', 10)
  },
  
  // Auth settings
  auth: {
    sessionSecret: process.env.SESSION_SECRET || 'ireva-platform-secret-key',
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || String(24 * 60 * 60 * 1000), 10), // 24 hours
    secureCookies: process.env.SECURE_COOKIES === 'true' || process.env.NODE_ENV === 'production',
    jwtSecret: process.env.JWT_SECRET || 'ireva-jwt-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10)
  },
  
  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count', 'X-Pagination-Total']
  },
  
  // Rate limiting settings
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || String(15 * 60 * 1000), 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // Cache settings
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || String(60 * 1000), 10), // 1 minute
    checkperiod: parseInt(process.env.CACHE_CHECK_PERIOD || String(120 * 1000), 10) // 2 minutes
  }
};

// Environment-specific overrides
if (config.env.isDevelopment) {
  // Development environment specifics
  config.server.corsEnabled = true;
  config.auth.passwordMinLength = 4; // Less strict for development
  config.database.idleTimeout = 10000; // Longer idle timeout in development
} else if (config.env.isProduction) {
  // Production environment specifics
  config.server.corsEnabled = false;
  config.auth.secureCookies = true;
  config.rateLimit.max = 50; // More restrictive in production
  config.auth.passwordMinLength = 8; // Stricter for production
} else if (config.env.isTest) {
  // Test environment specifics
  config.server.port = 5001; // Different port for tests
  config.auth.sessionMaxAge = 60000; // Shorter session for tests (1 minute)
  config.database.poolMax = 1; // Minimal pool for tests
}

// Replit specific configurations
if (process.env.REPL_ID) {
  // We're in Replit environment
  config.env.isReplit = true;
  config.server.replUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  
  // Adjust settings for Replit
  if (config.env.minimalStartup) {
    config.database.poolMax = 1;
    config.database.connectionTimeout = 200;
  }
}

// Export the configuration
module.exports = config;

// For dual module compatibility
if (typeof exports !== 'undefined') {
  exports.config = config;
}