/**
 * API Request Hook
 * 
 * Provides a robust way to make API requests with:
 * - Automatic retries with exponential backoff
 * - Circuit breaker pattern to prevent cascading failures
 * - Performance tracking
 * - Consistent error handling
 * - Request cancellation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import usePerformanceMonitor from './usePerformanceMonitor';

// Default configuration for API requests
const DEFAULT_CONFIG = {
  baseUrl: '/api',
  retries: 3,
  minRetryDelay: 1000,
  maxRetryDelay: 5000,
  retryBackoffFactor: 2,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  credentialsPolicy: 'same-origin',
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,  // Number of failures before circuit opens
    resetTimeout: 30000,  // Time circuit stays open before trying again (30s)
    storageKey: 'api-circuit-state' // localStorage key for circuit state
  }
};

// Circuit breaker state
const CIRCUIT_STATE = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

/**
 * Hook for making API requests with advanced resilience features
 */
export default function useApiRequest(options = {}) {
  // Merge options with defaults
  const config = { ...DEFAULT_CONFIG, ...options };
  
  // Request state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Circuit breaker state
  const [circuitState, setCircuitState] = useState(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined' && config.circuitBreaker.enabled) {
      try {
        const savedState = localStorage.getItem(config.circuitBreaker.storageKey);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          // Check if circuit should be reset based on nextAttemptTime
          if (parsed.state === CIRCUIT_STATE.OPEN && 
              parsed.nextAttemptTime && 
              new Date(parsed.nextAttemptTime) < new Date()) {
            return { 
              state: CIRCUIT_STATE.HALF_OPEN,
              failures: parsed.failures,
              services: parsed.services || {}
            };
          }
          return parsed;
        }
      } catch (err) {
        // Ignore localStorage errors, start with closed circuit
        console.debug('Error loading circuit state', err);
      }
    }
    
    return { 
      state: CIRCUIT_STATE.CLOSED,
      failures: 0,
      services: {},
      lastUpdated: new Date().toISOString()
    };
  });
  
  // Reference to keep track of abortController for cancellation
  const abortControllerRef = useRef(null);
  
  // Performance monitoring
  const { trackOperation } = usePerformanceMonitor('ApiRequest', {
    trackRenders: true,
    trackInteractions: false
  });
  
  // Update localStorage when circuit state changes
  useEffect(() => {
    if (typeof window !== 'undefined' && config.circuitBreaker.enabled) {
      try {
        localStorage.setItem(
          config.circuitBreaker.storageKey, 
          JSON.stringify({
            ...circuitState,
            lastUpdated: new Date().toISOString()
          })
        );
      } catch (err) {
        // Ignore localStorage errors
        console.debug('Error saving circuit state', err);
      }
    }
  }, [circuitState, config.circuitBreaker.enabled, config.circuitBreaker.storageKey]);
  
  /**
   * Calculate backoff delay with jitter
   */
  const calculateBackoff = useCallback((attempt) => {
    // Calculate exponential backoff
    const delay = Math.min(
      config.maxRetryDelay,
      config.minRetryDelay * Math.pow(config.retryBackoffFactor, attempt)
    );
    
    // Add jitter (up to 30%)
    const jitter = delay * 0.3;
    return Math.floor(delay - jitter/2 + Math.random() * jitter);
  }, [config.minRetryDelay, config.maxRetryDelay, config.retryBackoffFactor]);
  
  /**
   * Handle successful request from circuit breaker perspective
   */
  const handleSuccess = useCallback((serviceName) => {
    if (!config.circuitBreaker.enabled) return;
    
    // Reset circuit for this service
    setCircuitState(prev => {
      // Update service state
      const services = { ...prev.services };
      services[serviceName] = {
        state: CIRCUIT_STATE.CLOSED,
        failures: 0,
        lastSuccess: new Date().toISOString()
      };
      
      // If overall circuit was half-open, close it
      const newState = prev.state === CIRCUIT_STATE.HALF_OPEN
        ? CIRCUIT_STATE.CLOSED
        : prev.state;
        
      return {
        ...prev,
        state: newState,
        failures: newState === CIRCUIT_STATE.CLOSED ? 0 : prev.failures,
        services
      };
    });
  }, [config.circuitBreaker.enabled]);
  
  /**
   * Handle failed request from circuit breaker perspective
   */
  const handleFailure = useCallback((serviceName, error) => {
    if (!config.circuitBreaker.enabled) return;
    
    setCircuitState(prev => {
      // Update service state
      const services = { ...prev.services };
      
      // Initialize service if it doesn't exist
      if (!services[serviceName]) {
        services[serviceName] = {
          state: CIRCUIT_STATE.CLOSED,
          failures: 0
        };
      }
      
      // Increment failures
      services[serviceName].failures = (services[serviceName].failures || 0) + 1;
      services[serviceName].lastFailure = new Date().toISOString();
      services[serviceName].lastError = error.message;
      
      // If service reaches threshold, open its circuit
      if (services[serviceName].failures >= config.circuitBreaker.failureThreshold) {
        services[serviceName].state = CIRCUIT_STATE.OPEN;
        services[serviceName].nextAttemptTime = new Date(
          Date.now() + config.circuitBreaker.resetTimeout
        ).toISOString();
      }
      
      // Check if overall circuit should open
      // (This happens when multiple services have failures)
      const totalServiceFailures = Object.values(services)
        .reduce((sum, service) => sum + (service.failures || 0), 0);
      
      // Check if half-open circuit should be reopened
      if (prev.state === CIRCUIT_STATE.HALF_OPEN) {
        return {
          state: CIRCUIT_STATE.OPEN,
          failures: prev.failures + 1,
          services,
          nextAttemptTime: new Date(
            Date.now() + config.circuitBreaker.resetTimeout
          ).toISOString()
        };
      }
      
      // Check if circuit should be opened
      if (totalServiceFailures >= config.circuitBreaker.failureThreshold * 2 ||
          prev.failures + 1 >= config.circuitBreaker.failureThreshold) {
        return {
          state: CIRCUIT_STATE.OPEN,
          failures: prev.failures + 1,
          services,
          nextAttemptTime: new Date(
            Date.now() + config.circuitBreaker.resetTimeout
          ).toISOString()
        };
      }
      
      // Otherwise, just increment failure count
      return {
        ...prev,
        failures: prev.failures + 1,
        services
      };
    });
  }, [config.circuitBreaker.enabled, config.circuitBreaker.failureThreshold, config.circuitBreaker.resetTimeout]);
  
  /**
   * Check if a specific service's circuit is open
   */
  const isServiceCircuitOpen = useCallback((serviceName) => {
    if (!config.circuitBreaker.enabled) return false;
    
    // Global circuit is open
    if (circuitState.state === CIRCUIT_STATE.OPEN) {
      // Check if reset timeout has passed
      if (circuitState.nextAttemptTime && 
          new Date(circuitState.nextAttemptTime) < new Date()) {
        return false; // Allow the request to try again
      }
      return true; // Circuit is open, fast fail
    }
    
    // Check service-specific circuit
    const serviceCircuit = circuitState.services[serviceName];
    if (serviceCircuit && serviceCircuit.state === CIRCUIT_STATE.OPEN) {
      // Check if reset timeout has passed
      if (serviceCircuit.nextAttemptTime && 
          new Date(serviceCircuit.nextAttemptTime) < new Date()) {
        return false; // Allow the request to try again
      }
      return true; // Circuit is open, fast fail
    }
    
    return false; // Circuit is closed
  }, [circuitState, config.circuitBreaker.enabled]);
  
  /**
   * Create a standardized error object
   */
  const createError = useCallback((message, originalError, statusCode = null, metadata = {}) => {
    const error = new Error(message);
    error.originalError = originalError;
    error.statusCode = statusCode;
    error.metadata = metadata;
    return error;
  }, []);
  
  /**
   * Execute a request with retry and circuit breaker logic
   */
  const request = useCallback(async (url, options = {}) => {
    const method = options.method || 'GET';
    const body = options.body;
    const headers = { ...config.headers, ...options.headers };
    const timeout = options.timeout || config.timeout;
    const retries = options.retries !== undefined ? options.retries : config.retries;
    
    // Derive service name from URL for circuit breaker
    const serviceParts = url.split('/');
    const serviceName = serviceParts.length > 1 ? serviceParts[1] : 'default';
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    // Start performance tracking
    const perfOp = trackOperation(`${method} ${url}`);
    perfOp.checkpoint('start');
    
    // Start request state
    setLoading(true);
    setError(null);
    
    // Check circuit breaker state
    if (isServiceCircuitOpen(serviceName)) {
      const circuitError = createError(
        `Circuit is open for service ${serviceName}`,
        null,
        null,
        { circuitBreaker: true }
      );
      
      perfOp.checkpoint('circuit-open');
      perfOp.end('failed');
      
      setLoading(false);
      setError(circuitError);
      return Promise.reject(circuitError);
    }
    
    // Prepare full URL
    let fullUrl = url;
    if (!url.startsWith('http') && !url.startsWith('/')) {
      fullUrl = `${config.baseUrl}/${url}`;
    } else if (!url.startsWith('http') && url.startsWith('/')) {
      fullUrl = `${config.baseUrl}${url}`;
    }
    
    // Initialize retry state
    let attempts = 0;
    let lastError = null;
    
    // Start retry loop
    while (attempts <= retries) {
      try {
        if (attempts > 0) {
          perfOp.checkpoint(`retry-${attempts}`);
          console.debug(`Retrying request (${attempts}/${retries}): ${method} ${fullUrl}`);
        }
        
        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Request timeout after ${timeout}ms`));
          }, timeout);
        });
        
        // Execute the fetch with timeout race
        const response = await Promise.race([
          fetch(fullUrl, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            credentials: config.credentialsPolicy,
            signal
          }),
          timeoutPromise
        ]);
        
        perfOp.checkpoint('response-received');
        
        // Check for HTTP errors
        if (!response.ok) {
          // Check if status code is retryable
          const isRetryableStatus = config.retryableStatusCodes.includes(response.status);
          
          // If status is not retryable or we're out of retries, throw an error
          if (!isRetryableStatus || attempts >= retries) {
            let errorMessage;
            
            try {
              // Try to parse error response as JSON
              const errorData = await response.json();
              errorMessage = errorData.message || errorData.error || `HTTP error ${response.status}`;
            } catch (e) {
              // If parsing fails, use status text
              errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
            }
            
            throw createError(errorMessage, null, response.status);
          }
          
          // For retryable status, throw an error to trigger retry
          throw createError(
            `HTTP error ${response.status}: ${response.statusText}`,
            null,
            response.status
          );
        }
        
        // Parse the response based on content type
        let responseData;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          responseData = await response.json();
          perfOp.checkpoint('json-parsed');
        } else if (contentType?.includes('text/')) {
          responseData = await response.text();
          perfOp.checkpoint('text-parsed');
        } else {
          // For other content types, use raw response
          responseData = response;
          perfOp.checkpoint('raw-response');
        }
        
        // Handle success
        handleSuccess(serviceName);
        perfOp.end('success');
        
        setData(responseData);
        setLoading(false);
        return responseData;
      } catch (error) {
        lastError = error;
        attempts++;
        
        // Check if request was manually cancelled
        if (error.name === 'AbortError') {
          perfOp.checkpoint('aborted');
          perfOp.end('aborted');
          
          setLoading(false);
          setError(createError('Request was cancelled', error));
          
          return Promise.reject(error);
        }
        
        // Check if we've exhausted retries
        if (attempts > retries) {
          // Record failure in circuit breaker
          handleFailure(serviceName, error);
          
          perfOp.checkpoint('max-retries-reached');
          perfOp.end('failed');
          
          setLoading(false);
          setError(error);
          
          return Promise.reject(error);
        }
        
        // Calculate backoff delay
        const delay = calculateBackoff(attempts);
        
        // Log retry
        console.debug(
          `Request failed (${attempts}/${retries}), retrying in ${delay}ms:`,
          method,
          fullUrl,
          error.message
        );
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should never happen due to the checks above
    const finalError = createError(
      'Unexpected error in request retry loop',
      lastError
    );
    
    perfOp.end('failed');
    setLoading(false);
    setError(finalError);
    
    return Promise.reject(finalError);
  }, [
    config, 
    handleSuccess, 
    handleFailure, 
    isServiceCircuitOpen, 
    createError, 
    calculateBackoff, 
    trackOperation
  ]);
  
  /**
   * Cancel the current request
   */
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  /**
   * Reset the circuit breaker state
   */
  const resetCircuitBreaker = useCallback(() => {
    if (!config.circuitBreaker.enabled) return;
    
    setCircuitState({
      state: CIRCUIT_STATE.CLOSED,
      failures: 0,
      services: {},
      lastUpdated: new Date().toISOString()
    });
    
    console.debug('Circuit breaker reset');
  }, [config.circuitBreaker.enabled]);
  
  /**
   * Reset request state
   */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    cancelRequest();
  }, [cancelRequest]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelRequest();
    };
  }, [cancelRequest]);
  
  // Create convenience methods for common HTTP methods
  const get = useCallback((url, options = {}) => 
    request(url, { ...options, method: 'GET' }), [request]);
    
  const post = useCallback((url, data, options = {}) => 
    request(url, { ...options, method: 'POST', body: data }), [request]);
    
  const put = useCallback((url, data, options = {}) => 
    request(url, { ...options, method: 'PUT', body: data }), [request]);
    
  const patch = useCallback((url, data, options = {}) => 
    request(url, { ...options, method: 'PATCH', body: data }), [request]);
    
  const del = useCallback((url, options = {}) => 
    request(url, { ...options, method: 'DELETE' }), [request]);
  
  return {
    // State
    data,
    loading,
    error,
    
    // Circuit breaker state
    circuitState,
    
    // Methods
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    
    // Utilities
    cancelRequest,
    resetCircuitBreaker,
    reset
  };
}