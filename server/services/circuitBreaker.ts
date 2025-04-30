/**
 * Circuit Breaker Pattern Implementation
 * 
 * This service implements the circuit breaker pattern to prevent cascading failures
 * in automated financial and system operations. It monitors for failures and
 * automatically opens the circuit when error thresholds are exceeded.
 * 
 * States:
 * - CLOSED: System operates normally
 * - OPEN: Requests fail fast without attempting operation
 * - HALF_OPEN: Limited traffic allowed to test recovery
 */

import { getSocketIo } from '../socketio';
import { db } from '../db';
import { sql } from 'drizzle-orm';

// Circuit states
export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

// Circuit breaker configuration
export interface CircuitBreakerConfig {
  failureThreshold: number;      // Number of failures before opening circuit
  resetTimeout: number;          // Time in ms until circuit goes from OPEN to HALF_OPEN
  halfOpenSuccessThreshold: number;  // Successes needed to close circuit
  monitorTimeout: number;        // Time window in ms to monitor failures
}

// Default configuration
const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  halfOpenSuccessThreshold: 3,
  monitorTimeout: 120000 // 2 minutes
};

// Store circuit state for each service
const circuits: Record<string, {
  name: string;
  state: CircuitState;
  failures: number;
  lastFailure: Date | null;
  lastSuccess: Date | null;
  halfOpenSuccesses: number;
  resetTimer: NodeJS.Timeout | null;
  config: CircuitBreakerConfig;
}> = {};

/**
 * Initialize circuit breaker monitoring table
 */
export async function initializeCircuitBreaker() {
  // Create circuit_breaker_logs table if it doesn't exist
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS circuit_breaker_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service_name VARCHAR(100) NOT NULL,
      state VARCHAR(20) NOT NULL,
      previous_state VARCHAR(20),
      failure_count INTEGER,
      details JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  
  console.log('Circuit breaker system initialized');
}

/**
 * Register a service with the circuit breaker
 */
export function registerCircuit(serviceName: string, config?: Partial<CircuitBreakerConfig>) {
  if (circuits[serviceName]) {
    return circuits[serviceName];
  }
  
  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...config
  };
  
  circuits[serviceName] = {
    name: serviceName,
    state: CircuitState.CLOSED,
    failures: 0,
    lastFailure: null,
    lastSuccess: null,
    halfOpenSuccesses: 0,
    resetTimer: null,
    config: mergedConfig
  };
  
  // Log to database
  logCircuitStateChange(serviceName, CircuitState.CLOSED, null);
  
  return circuits[serviceName];
}

/**
 * Record a successful operation
 */
export function recordSuccess(serviceName: string) {
  const circuit = getOrCreateCircuit(serviceName);
  
  circuit.lastSuccess = new Date();
  
  if (circuit.state === CircuitState.HALF_OPEN) {
    circuit.halfOpenSuccesses++;
    
    // Check if we can close the circuit
    if (circuit.halfOpenSuccesses >= circuit.config.halfOpenSuccessThreshold) {
      changeState(serviceName, CircuitState.CLOSED);
    }
  }
  
  return circuit.state;
}

/**
 * Record a failed operation
 */
export function recordFailure(serviceName: string, error?: any) {
  const circuit = getOrCreateCircuit(serviceName);
  circuit.lastFailure = new Date();
  
  if (circuit.state === CircuitState.CLOSED) {
    circuit.failures++;
    
    // Check if recent failures exceed threshold
    const recentFailures = getRecentFailures(circuit);
    
    if (recentFailures >= circuit.config.failureThreshold) {
      changeState(serviceName, CircuitState.OPEN);
      
      // Set timer to attempt recovery
      circuit.resetTimer = setTimeout(() => {
        if (circuit.state === CircuitState.OPEN) {
          changeState(serviceName, CircuitState.HALF_OPEN);
        }
      }, circuit.config.resetTimeout);
    }
  } else if (circuit.state === CircuitState.HALF_OPEN) {
    // Any failure in half-open state should reopen the circuit
    changeState(serviceName, CircuitState.OPEN);
    
    // Set timer to attempt recovery again
    circuit.resetTimer = setTimeout(() => {
      if (circuit.state === CircuitState.OPEN) {
        changeState(serviceName, CircuitState.HALF_OPEN);
      }
    }, circuit.config.resetTimeout);
  }
  
  // Log the failure details
  logCircuitFailure(serviceName, error);
  
  return circuit.state;
}

/**
 * Check if a circuit is closed and operation can proceed
 */
export function canExecute(serviceName: string): boolean {
  const circuit = getOrCreateCircuit(serviceName);
  
  // Allow execution if circuit is closed or half-open
  return circuit.state === CircuitState.CLOSED || 
    circuit.state === CircuitState.HALF_OPEN;
}

/**
 * Execute a function with circuit breaker protection
 */
export async function executeWithCircuitBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  if (!canExecute(serviceName)) {
    if (fallback) {
      return fallback();
    }
    throw new Error(`Circuit for ${serviceName} is OPEN. Operation rejected.`);
  }
  
  try {
    const result = await fn();
    recordSuccess(serviceName);
    return result;
  } catch (error) {
    recordFailure(serviceName, error);
    
    if (fallback) {
      return fallback();
    }
    throw error;
  }
}

/**
 * Get the current state of a circuit
 */
export function getCircuitState(serviceName: string): CircuitState {
  const circuit = circuits[serviceName];
  if (!circuit) {
    return CircuitState.CLOSED; // Default state
  }
  return circuit.state;
}

/**
 * Reset a circuit to closed state (manual override)
 */
export function resetCircuit(serviceName: string) {
  const circuit = circuits[serviceName];
  if (!circuit) {
    return;
  }
  
  if (circuit.resetTimer) {
    clearTimeout(circuit.resetTimer);
    circuit.resetTimer = null;
  }
  
  circuit.failures = 0;
  circuit.halfOpenSuccesses = 0;
  changeState(serviceName, CircuitState.CLOSED);
}

/**
 * Get recent failures within the monitoring window
 */
function getRecentFailures(circuit: any): number {
  if (!circuit.lastFailure) {
    return 0;
  }
  
  const monitorStart = new Date(Date.now() - circuit.config.monitorTimeout);
  
  if (circuit.lastFailure > monitorStart) {
    return circuit.failures;
  }
  
  // Reset failures outside monitoring window
  circuit.failures = 0;
  return 0;
}

/**
 * Get or create a circuit for a service
 */
function getOrCreateCircuit(serviceName: string) {
  if (!circuits[serviceName]) {
    return registerCircuit(serviceName);
  }
  return circuits[serviceName];
}

/**
 * Change circuit state and notify
 */
function changeState(serviceName: string, newState: CircuitState) {
  const circuit = circuits[serviceName];
  if (!circuit) {
    return;
  }
  
  const previousState = circuit.state;
  circuit.state = newState;
  
  // Reset counters
  if (newState === CircuitState.CLOSED) {
    circuit.failures = 0;
  } else if (newState === CircuitState.HALF_OPEN) {
    circuit.halfOpenSuccesses = 0;
  }
  
  // Log state change to database
  logCircuitStateChange(serviceName, newState, previousState);
  
  // Emit state change via WebSockets
  const io = getSocketIo();
  if (io) {
    io.emit('circuit-state-change', {
      service: serviceName,
      state: newState,
      previousState,
      timestamp: new Date()
    });
  }
  
  console.log(`Circuit breaker for ${serviceName} changed from ${previousState} to ${newState}`);
}

/**
 * Log circuit state change to database
 */
async function logCircuitStateChange(
  serviceName: string,
  state: CircuitState,
  previousState: CircuitState | null
) {
  try {
    const circuit = circuits[serviceName];
    
    await db.execute(sql`
      INSERT INTO circuit_breaker_logs (
        service_name, state, previous_state, failure_count, details
      ) VALUES (
        ${serviceName}, 
        ${state}, 
        ${previousState || null}, 
        ${circuit?.failures || 0}, 
        ${JSON.stringify({
          lastFailure: circuit?.lastFailure,
          lastSuccess: circuit?.lastSuccess,
          halfOpenSuccesses: circuit?.halfOpenSuccesses,
          config: circuit?.config
        })}
      )
    `);
  } catch (error) {
    console.error('Failed to log circuit state change:', error);
  }
}

/**
 * Log circuit failure details
 */
async function logCircuitFailure(serviceName: string, error: any) {
  try {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    
    await db.execute(sql`
      INSERT INTO circuit_breaker_logs (
        service_name, state, failure_count, details
      ) VALUES (
        ${serviceName}, 
        ${circuits[serviceName]?.state || CircuitState.CLOSED}, 
        ${circuits[serviceName]?.failures || 0}, 
        ${JSON.stringify({
          error: errorDetails,
          timestamp: new Date()
        })}
      )
    `);
  } catch (logError) {
    console.error('Failed to log circuit failure:', logError);
  }
}

/**
 * Example usage with financial operations
 */
export async function executeFinancialOperation(
  operationName: string, 
  operation: () => Promise<any>,
  fallback?: () => Promise<any>
) {
  const serviceName = `finance.${operationName}`;
  
  return executeWithCircuitBreaker(
    serviceName,
    operation,
    fallback
  );
}