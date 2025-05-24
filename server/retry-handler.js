/**
 * Retry Handler
 * 
 * Provides robust retry mechanisms for external API calls and operations:
 * - Configurable retry strategies
 * - Exponential backoff
 * - Jitter for request distribution
 * - Circuit breaker integration
 */

// Import dependencies with fallbacks
let logger;
try {
  logger = require('./logger.cjs');
} catch (err) {
  // Fallback logger
  logger = {
    info: (msg, category = 'RETRY') => console.log(`[${category}] ${msg}`),
    warn: (msg, category = 'RETRY') => console.warn(`[${category}] ${msg}`),
    error: (msg, category = 'RETRY') => console.error(`[${category}] ${msg}`)
  };
}

// Try to import circuit breaker
let circuitBreaker;
try {
  circuitBreaker = require('./circuit-breaker');
} catch (err) {
  // Create dummy circuit breaker if not available
  circuitBreaker = {
    createCircuitBreaker: (name) => ({
      execute: async (fn) => fn()
    })
  };
}

// Default retry options
const DEFAULT_OPTIONS = {
  retries: 3,                   // Number of retry attempts
  minTimeout: 1000,             // Min delay between retries (ms)
  maxTimeout: 10000,            // Max delay between retries (ms)
  factor: 2,                    // Exponential backoff factor
  randomize: true,              // Add jitter to prevent thundering herd
  retryableStatusCodes: [       // HTTP status codes to retry for
    408, 429, 500, 502, 503, 504
  ],
  retryableErrors: [            // Error types to retry for
    'ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND'
  ],
  onRetry: null,                // Callback before retry
  useCircuitBreaker: true,      // Integrate with circuit breaker
  timeout: 10000                // Timeout per attempt (ms)
};

/**
 * Create a retry handler function
 * @param {string} serviceName - Service name for tracking
 * @param {Object} options - Retry options
 * @returns {Function} - Retry handler function
 */
function createRetryHandler(serviceName, options = {}) {
  // Merge options with defaults
  const retryOptions = { ...DEFAULT_OPTIONS, ...options };
  
  logger.info(`Creating retry handler for ${serviceName} with ${retryOptions.retries} max retries`);
  
  // Create circuit breaker if enabled
  const breaker = retryOptions.useCircuitBreaker 
    ? circuitBreaker.createCircuitBreaker(serviceName, {
        failureThreshold: retryOptions.retries + 2, // Set threshold higher than retries
        resetTimeout: retryOptions.maxTimeout * 2,
        timeoutDuration: retryOptions.timeout * 1.5
      })
    : null;
  
  // Return retry function
  return async function retry(operation, fallback = null) {
    // Current retry count
    let attempts = 0;
    
    // Last error for tracking
    let lastError;
    
    // Operation timeout handler
    const withTimeout = async (fn, timeout) => {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeout}ms`));
        }, timeout);
      });
      
      // Race operation against timeout
      return Promise.race([fn(), timeoutPromise]);
    };
    
    // Check if error is retryable
    const isRetryableError = (error) => {
      // Check HTTP status code
      if (error.status || error.statusCode) {
        const status = error.status || error.statusCode;
        if (retryOptions.retryableStatusCodes.includes(status)) {
          return true;
        }
      }
      
      // Check error code
      if (error.code && retryOptions.retryableErrors.includes(error.code)) {
        return true;
      }
      
      // Check error message
      const errorMessage = error.message || String(error);
      const isTimeout = errorMessage.includes('timeout') || 
                        errorMessage.includes('timed out');
      const isConnection = errorMessage.includes('connection') ||
                           errorMessage.includes('network') ||
                           errorMessage.includes('ECONNRESET');
      
      return isTimeout || isConnection;
    };
    
    // Calculate backoff delay with jitter
    const getBackoffDelay = (attempt) => {
      // Base delay with exponential backoff
      const delay = Math.min(
        retryOptions.maxTimeout,
        retryOptions.minTimeout * Math.pow(retryOptions.factor, attempt)
      );
      
      // Add jitter if enabled
      if (retryOptions.randomize) {
        // Add up to 30% randomization
        const jitter = delay * 0.3;
        return Math.floor(delay - (jitter / 2) + (Math.random() * jitter));
      }
      
      return delay;
    };
    
    // Execute with circuit breaker and retries
    const executeWithRetries = async () => {
      while (attempts <= retryOptions.retries) {
        try {
          // First attempt or retry
          const isRetry = attempts > 0;
          
          // Invoke retry callback if provided
          if (isRetry && typeof retryOptions.onRetry === 'function') {
            retryOptions.onRetry(attempts, lastError);
          }
          
          // Log retry attempt
          if (isRetry) {
            logger.info(`Retry attempt ${attempts}/${retryOptions.retries} for ${serviceName}`);
          }
          
          // Execute operation with timeout
          const result = await withTimeout(operation, retryOptions.timeout);
          
          // If we get here, the operation succeeded
          if (isRetry) {
            logger.info(`${serviceName} operation succeeded after ${attempts} retries`);
          }
          
          return result;
        } catch (error) {
          lastError = error;
          attempts++;
          
          // Check if we've exhausted retries
          if (attempts > retryOptions.retries) {
            logger.error(`${serviceName} operation failed after ${retryOptions.retries} retries: ${error.message}`);
            throw error;
          }
          
          // Check if error is retryable
          if (!isRetryableError(error)) {
            logger.warn(`Non-retryable error for ${serviceName}: ${error.message}`);
            throw error;
          }
          
          // Calculate delay for next retry
          const delay = getBackoffDelay(attempts);
          
          logger.warn(`${serviceName} operation failed (${error.message}), retrying in ${delay}ms...`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      // This should never be reached due to the throw in the loop
      throw new Error(`Unexpected retry loop exit for ${serviceName}`);
    };
    
    try {
      // Execute with circuit breaker if enabled
      if (breaker) {
        return await breaker.execute(executeWithRetries, fallback);
      } else {
        return await executeWithRetries();
      }
    } catch (error) {
      // If fallback is provided, use it
      if (typeof fallback === 'function') {
        logger.warn(`Using fallback for ${serviceName} after ${attempts} failed attempts`);
        return fallback(error);
      }
      
      // No fallback, propagate the error
      throw error;
    }
  };
}

/**
 * Create a retry function for HTTP requests
 * @param {string} serviceName - Service name
 * @param {Object} options - Retry options
 * @returns {Function} - HTTP retry function
 */
function createHttpRetryHandler(serviceName, options = {}) {
  // Create base retry handler
  const retryHandler = createRetryHandler(serviceName, options);
  
  // Return HTTP-specific wrapper
  return async function httpRetry(requestFn, requestOptions = {}, fallback = null) {
    return retryHandler(
      async () => {
        // Execute HTTP request
        const response = await requestFn(requestOptions);
        
        // Check for error status codes if response is returned
        if (response && response.status && response.status >= 400) {
          // Create error object with status code
          const error = new Error(`HTTP Error ${response.status}`);
          error.status = response.status;
          error.response = response;
          throw error;
        }
        
        return response;
      },
      fallback
    );
  };
}

/**
 * Create an Axios retry interceptor
 * @param {Object} axios - Axios instance
 * @param {Object} options - Retry options
 */
function createAxiosRetryInterceptor(axios, options = {}) {
  if (!axios || !axios.interceptors) {
    logger.error('Invalid Axios instance provided');
    return;
  }
  
  // Merge options with defaults
  const retryOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Add request interceptor for timeout
  axios.interceptors.request.use(config => {
    // Set timeout if not already set
    if (!config.timeout) {
      config.timeout = retryOptions.timeout;
    }
    return config;
  });
  
  // Add response interceptor for retries
  axios.interceptors.response.use(
    // Success handler - just return the response
    response => response,
    
    // Error handler with retry logic
    async error => {
      // Extract request configuration
      const config = error.config;
      
      // Check if retry information exists
      config.retryCount = config.retryCount || 0;
      
      // Check if we've hit the retry limit
      if (config.retryCount >= retryOptions.retries) {
        return Promise.reject(error);
      }
      
      // Check if error is retryable
      const isRetryable = shouldRetryAxiosRequest(error, retryOptions);
      
      if (!isRetryable) {
        return Promise.reject(error);
      }
      
      // Increment retry count
      config.retryCount += 1;
      
      // Calculate retry delay with jitter
      const delay = calculateBackoffDelay(
        config.retryCount,
        retryOptions.minTimeout,
        retryOptions.maxTimeout,
        retryOptions.factor,
        retryOptions.randomize
      );
      
      // Log retry attempt
      logger.warn(`Axios request failed, retry ${config.retryCount}/${retryOptions.retries} in ${delay}ms`);
      
      // Invoke retry callback if provided
      if (typeof retryOptions.onRetry === 'function') {
        retryOptions.onRetry(config.retryCount, error);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return axios(config);
    }
  );
  
  logger.info('Axios retry interceptor registered');
  
  return {
    // Function to reset interceptors
    reset: () => {
      axios.interceptors.request.eject(0);
      axios.interceptors.response.eject(0);
      logger.info('Axios retry interceptor reset');
    }
  };
}

/**
 * Determine if an Axios request should be retried
 * @param {Error} error - Axios error
 * @param {Object} options - Retry options
 * @returns {boolean} - Whether to retry
 */
function shouldRetryAxiosRequest(error, options) {
  // Network errors should be retried
  if (error.message && (
    error.message.includes('timeout') ||
    error.message.includes('Network Error') ||
    error.message.includes('socket hang up')
  )) {
    return true;
  }
  
  // Check error code if available
  if (error.code && options.retryableErrors.includes(error.code)) {
    return true;
  }
  
  // Check status code if available
  if (error.response && error.response.status) {
    return options.retryableStatusCodes.includes(error.response.status);
  }
  
  // Don't retry if no match
  return false;
}

/**
 * Calculate backoff delay with optional jitter
 * @param {number} attempt - Retry attempt
 * @param {number} minTimeout - Minimum timeout
 * @param {number} maxTimeout - Maximum timeout
 * @param {number} factor - Backoff factor
 * @param {boolean} randomize - Whether to add jitter
 * @returns {number} - Delay in ms
 */
function calculateBackoffDelay(attempt, minTimeout, maxTimeout, factor, randomize) {
  // Base delay with exponential backoff
  const delay = Math.min(
    maxTimeout,
    minTimeout * Math.pow(factor, attempt)
  );
  
  // Add jitter if enabled
  if (randomize) {
    // Add up to 30% randomization
    const jitter = delay * 0.3;
    return Math.floor(delay - (jitter / 2) + (Math.random() * jitter));
  }
  
  return delay;
}

// Export functions
module.exports = {
  createRetryHandler,
  createHttpRetryHandler,
  createAxiosRetryInterceptor
};

// Support dual module usage
if (typeof exports !== 'undefined') {
  exports.createRetryHandler = createRetryHandler;
  exports.createHttpRetryHandler = createHttpRetryHandler;
  exports.createAxiosRetryInterceptor = createAxiosRetryInterceptor;
}