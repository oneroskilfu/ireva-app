/**
 * Port Configuration for iREVA Platform
 * 
 * This file centralizes port configuration to make it easier to modify
 * and maintain port settings across the application.
 */

// Port used by the minimal TCP server for Replit detection
export const MINIMAL_SERVER_PORT = 5000;

// Port used by the main application server
export const MAIN_APP_PORT = 5001;

// Flag to indicate whether we're running in Replit environment
export const IS_REPLIT = process.env.REPL_ID !== undefined;

/**
 * Determines the appropriate port to use based on environment
 * and whether a minimal server is running on the primary port
 */
export function getAppPort(isMinimalServerRunning: boolean): number {
  // If running in Replit and minimal server is active, use the secondary port
  if (IS_REPLIT && isMinimalServerRunning) {
    return MAIN_APP_PORT;
  }
  
  // Default to the primary port
  return MINIMAL_SERVER_PORT;
}