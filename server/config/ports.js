/**
 * Port Configuration for iREVA Platform
 * 
 * This file centralizes port configuration to make it easier to modify
 * and maintain port settings across the application.
 */

// Port used by the minimal TCP server for Replit detection
exports.MINIMAL_SERVER_PORT = 5000;

// Port used by the main application server
exports.MAIN_APP_PORT = 5001;

// Flag to indicate whether we're running in Replit environment
exports.IS_REPLIT = process.env.REPL_ID !== undefined;

/**
 * Determines the appropriate port to use based on environment
 * and whether a minimal server is running on the primary port
 */
exports.getAppPort = function(isMinimalServerRunning) {
  // If running in Replit and minimal server is active, use the secondary port
  if (exports.IS_REPLIT && isMinimalServerRunning) {
    return exports.MAIN_APP_PORT;
  }
  
  // Default to the primary port
  return exports.MINIMAL_SERVER_PORT;
};