/**
 * Circuit Breaker Pattern Implementation
 * 
 * Provides protection against cascading failures when external services fail,
 * with automatic recovery and fallback strategies.
 */

// Try to import logger
let logger;
try {
  logger = require('./logger.cjs');
} catch (err) {
  // Fallback logger
  logger = {
    info: (msg, category = 'CIRCUIT') => console.log(`[${category}] ${msg}`),
    warn: (msg, category = 'CIRCUIT') => console.warn(`[${category}] ${msg}`),
    error: (msg, category = 'CIRCUIT') => console.error(`[${category}] ${msg}`)
  };
}

// Circuit states
const STATE = {
  CLOSED: 'CLOSED',       // Normal operation, requests go through
  OPEN: 'OPEN',           // Circuit open, requests fail fast
  HALF_OPEN: 'HALF_OPEN'  // Testing if service recovered
};

// Default circuit breaker options
const DEFAULT_OPTIONS = {
  failureThreshold: 5,      // Number of failures before opening circuit
  resetTimeout: 30000,      // Time to wait before trying to recover (ms)
  timeoutDuration: 5000,    // Timeout for external service calls (ms)
  monitorInterval: 5000,    // How often to log circuit status (ms)
  fallbackFn: null,         // Optional fallback function when circuit is open
  healthCheckFn: null,      // Optional function to check if service is healthy
  logLevel: 'standard'      // 'none', 'minimal', 'standard', 'verbose'
};

// Store of all circuit breakers
const circuitBreakers = new Map();

/**
 * Create a new circuit breaker for an external service
 * @param {string} serviceName - Name of the service
 * @param {Object} options - Circuit breaker options
 * @returns {Object} - Circuit breaker instance
 */
function createCircuitBreaker(serviceName, options = {}) {
  // Create options by merging defaults with provided options
  const circuitOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Create circuit breaker state
  const circuit = {
    serviceName,
    state: STATE.CLOSED,
    failureCount: 0,
    lastFailureTime: null,
    lastSuccessTime: null,
    nextAttemptTime: null,
    resetTimer: null,
    stats: {
      success: 0,
      failure: 0,
      timeout: 0,
      rejected: 0,
      fallback: 0,
      totalCalls: 0
    },
    options: circuitOptions
  };
  
  // Store in global map
  circuitBreakers.set(serviceName, circuit);
  
  // Set up monitoring if enabled
  if (circuitOptions.monitorInterval > 0) {
    setInterval(() => {
      logCircuitStatus(circuit);
    }, circuitOptions.monitorInterval);
  }
  
  logger.info(`Circuit breaker created for service: ${serviceName}`, 'CIRCUIT');
  
  // Return wrapped methods
  return {
    // Execute a function with circuit breaker protection
    async execute(fn, fallbackFn = circuit.options.fallbackFn) {
      return executeWithCircuitBreaker(circuit, fn, fallbackFn);
    },
    
    // Manually open the circuit
    open() {
      openCircuit(circuit);
      logger.info(`Circuit manually opened for service: ${serviceName}`, 'CIRCUIT');
    },
    
    // Manually close the circuit
    close() {
      closeCircuit(circuit);
      logger.info(`Circuit manually closed for service: ${serviceName}`, 'CIRCUIT');
    },
    
    // Reset the circuit to closed state
    reset() {
      resetCircuit(circuit);
      logger.info(`Circuit manually reset for service: ${serviceName}`, 'CIRCUIT');
    },
    
    // Get current circuit status
    getStatus() {
      return {
        service: circuit.serviceName,
        state: circuit.state,
        metrics: { ...circuit.stats },
        failureCount: circuit.failureCount,
        lastFailure: circuit.lastFailureTime,
        lastSuccess: circuit.lastSuccessTime,
        nextRetry: circuit.nextAttemptTime
      };
    }
  };
}

/**
 * Execute a function with circuit breaker protection
 * @param {Object} circuit - Circuit breaker state
 * @param {Function} fn - Function to execute
 * @param {Function} fallbackFn - Fallback function if circuit is open
 * @returns {Promise<*>} - Result of function or fallback
 */
async function executeWithCircuitBreaker(circuit, fn, fallbackFn) {
  // Track calls
  circuit.stats.totalCalls++;
  
  // Check if circuit is open
  if (circuit.state === STATE.OPEN) {
    // Check if it's time to try recovery
    if (Date.now() > circuit.nextAttemptTime) {
      // Move to half-open state and allow this request through as a test
      circuit.state = STATE.HALF_OPEN;
      logger.info(`Circuit for ${circuit.serviceName} is now HALF_OPEN - testing recovery`, 'CIRCUIT');
    } else {
      // Circuit is open and recovery time hasn't elapsed
      circuit.stats.rejected++;
      
      // If health check function is available, check if service is healthy
      if (circuit.options.healthCheckFn && typeof circuit.options.healthCheckFn === 'function') {
        try {
          const isHealthy = await circuit.options.healthCheckFn();
          if (isHealthy) {
            // Service is healthy, close the circuit
            closeCircuit(circuit);
          }
        } catch (error) {
          // Health check failed, keep circuit open
          logger.debug(`Health check failed for ${circuit.serviceName}: ${error.message}`, 'CIRCUIT');
        }
      }
      
      // Use fallback or throw error
      if (fallbackFn && typeof fallbackFn === 'function') {
        circuit.stats.fallback++;
        return fallbackFn();
      }
      
      // No fallback, throw circuit open error
      throw new Error(`Circuit for ${circuit.serviceName} is OPEN`);
    }
  }
  
  // Circuit is CLOSED or HALF_OPEN, try the call
  try {
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request to ${circuit.serviceName} timed out after ${circuit.options.timeoutDuration}ms`));
      }, circuit.options.timeoutDuration);
    });
    
    // Race the function against timeout
    const result = await Promise.race([
      fn(),
      timeoutPromise
    ]);
    
    // Success! Record it
    handleSuccess(circuit);
    return result;
  } catch (error) {
    // Handle failure
    if (error.message.includes('timed out')) {
      circuit.stats.timeout++;
    }
    
    handleFailure(circuit, error);
    
    // Use fallback if provided
    if (fallbackFn && typeof fallbackFn === 'function') {
      circuit.stats.fallback++;
      return fallbackFn();
    }
    
    // No fallback, propagate the error
    throw error;
  }
}

/**
 * Handle successful execution
 * @param {Object} circuit - Circuit breaker state
 */
function handleSuccess(circuit) {
  circuit.failureCount = 0;
  circuit.lastSuccessTime = new Date().toISOString();
  circuit.stats.success++;
  
  // If circuit was half-open, close it as the service has recovered
  if (circuit.state === STATE.HALF_OPEN) {
    closeCircuit(circuit);
  }
}

/**
 * Handle failed execution
 * @param {Object} circuit - Circuit breaker state
 * @param {Error} error - The error that occurred
 */
function handleFailure(circuit, error) {
  circuit.lastFailureTime = new Date().toISOString();
  circuit.stats.failure++;
  
  // If circuit is half-open, a test request failed, so open the circuit again
  if (circuit.state === STATE.HALF_OPEN) {
    openCircuit(circuit);
    return;
  }
  
  // Increment failure count
  circuit.failureCount++;
  
  // Check if failure threshold is reached
  if (circuit.state === STATE.CLOSED && circuit.failureCount >= circuit.options.failureThreshold) {
    openCircuit(circuit);
  }
}

/**
 * Open the circuit
 * @param {Object} circuit - Circuit breaker state
 */
function openCircuit(circuit) {
  // Clean up any existing timer
  if (circuit.resetTimer) {
    clearTimeout(circuit.resetTimer);
  }
  
  // Set circuit state to OPEN
  circuit.state = STATE.OPEN;
  circuit.nextAttemptTime = Date.now() + circuit.options.resetTimeout;
  
  // Log circuit opening
  logger.warn(`Circuit for ${circuit.serviceName} is now OPEN due to ${circuit.failureCount} failures. Next attempt at ${new Date(circuit.nextAttemptTime).toISOString()}`, 'CIRCUIT');
  
  // Schedule automatic reset to half-open
  circuit.resetTimer = setTimeout(() => {
    if (circuit.state === STATE.OPEN) {
      circuit.state = STATE.HALF_OPEN;
      logger.info(`Circuit for ${circuit.serviceName} is now HALF_OPEN - testing recovery`, 'CIRCUIT');
    }
  }, circuit.options.resetTimeout);
}

/**
 * Close the circuit
 * @param {Object} circuit - Circuit breaker state
 */
function closeCircuit(circuit) {
  // Clean up any existing timer
  if (circuit.resetTimer) {
    clearTimeout(circuit.resetTimer);
    circuit.resetTimer = null;
  }
  
  // Previous state for logging
  const previousState = circuit.state;
  
  // Reset circuit state
  circuit.state = STATE.CLOSED;
  circuit.failureCount = 0;
  circuit.nextAttemptTime = null;
  
  // Log only if state changed
  if (previousState !== STATE.CLOSED) {
    logger.info(`Circuit for ${circuit.serviceName} is now CLOSED - service has recovered`, 'CIRCUIT');
  }
}

/**
 * Reset the circuit to initial state
 * @param {Object} circuit - Circuit breaker state
 */
function resetCircuit(circuit) {
  // Clean up any existing timer
  if (circuit.resetTimer) {
    clearTimeout(circuit.resetTimer);
    circuit.resetTimer = null;
  }
  
  // Reset all circuit state
  circuit.state = STATE.CLOSED;
  circuit.failureCount = 0;
  circuit.lastFailureTime = null;
  circuit.lastSuccessTime = null;
  circuit.nextAttemptTime = null;
  
  // Reset statistics
  circuit.stats = {
    success: 0,
    failure: 0,
    timeout: 0,
    rejected: 0,
    fallback: 0,
    totalCalls: 0
  };
  
  logger.info(`Circuit for ${circuit.serviceName} has been reset to initial state`, 'CIRCUIT');
}

/**
 * Log circuit status based on configured log level
 * @param {Object} circuit - Circuit breaker state
 */
function logCircuitStatus(circuit) {
  // Skip logging if disabled
  if (circuit.options.logLevel === 'none') {
    return;
  }
  
  // Minimal logging only logs state changes
  if (circuit.options.logLevel === 'minimal') {
    // We'd need to store previous state to detect changes, skipping for now
    return;
  }
  
  // Standard logging shows current state
  if (circuit.options.logLevel === 'standard' || circuit.options.logLevel === 'verbose') {
    const stats = circuit.stats;
    const successRate = stats.totalCalls > 0 
      ? Math.round((stats.success / stats.totalCalls) * 100) 
      : 0;
    
    logger.info(`Circuit ${circuit.serviceName}: ${circuit.state}, Success Rate: ${successRate}%, Calls: ${stats.totalCalls}, Failures: ${circuit.failureCount}`, 'CIRCUIT');
  }
  
  // Verbose logging shows detailed metrics
  if (circuit.options.logLevel === 'verbose') {
    logger.info(`Circuit ${circuit.serviceName} detailed metrics: ${JSON.stringify(circuit.stats)}`, 'CIRCUIT');
  }
}

/**
 * Get all circuit breakers
 * @returns {Array} - Array of circuit breaker statuses
 */
function getAllCircuitBreakers() {
  const result = [];
  
  for (const [serviceName, circuit] of circuitBreakers.entries()) {
    result.push({
      service: serviceName,
      state: circuit.state,
      metrics: { ...circuit.stats },
      failureCount: circuit.failureCount,
      lastFailure: circuit.lastFailureTime,
      lastSuccess: circuit.lastSuccessTime,
      nextRetry: circuit.nextAttemptTime
    });
  }
  
  return result;
}

/**
 * Reset all circuits
 */
function resetAllCircuits() {
  for (const circuit of circuitBreakers.values()) {
    resetCircuit(circuit);
  }
  
  logger.info('All circuits have been reset', 'CIRCUIT');
}

// Export functions
module.exports = {
  createCircuitBreaker,
  getAllCircuitBreakers,
  resetAllCircuits,
  STATE // Export states for reference
};

// Support dual module usage
if (typeof exports !== 'undefined') {
  exports.createCircuitBreaker = createCircuitBreaker;
  exports.getAllCircuitBreakers = getAllCircuitBreakers;
  exports.resetAllCircuits = resetAllCircuits;
  exports.STATE = STATE;
}