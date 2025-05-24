/**
 * Port Configuration Helper for iREVA Platform
 * This module ensures consistent port configuration across the application
 */

// Default configuration
const DEFAULT_PORT = 5001;
const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_VITE_PORT = 3000;

// Get port configuration from environment variables
export function getPortConfig() {
  return {
    // Main server port
    port: parseInt(process.env.PORT || `${DEFAULT_PORT}`, 10),
    
    // Host to bind to
    host: process.env.HOST || DEFAULT_HOST,
    
    // Vite development server port
    vitePort: parseInt(process.env.VITE_PORT || `${DEFAULT_VITE_PORT}`, 10),
    
    // Vite host to bind to
    viteHost: process.env.VITE_HOST || DEFAULT_HOST
  };
}

// Log the port configuration
export function logPortConfig() {
  const config = getPortConfig();
  console.log('[PORT_CONFIG] Server binding configuration:');
  console.log(`[PORT_CONFIG] - Main API server: ${config.host}:${config.port}`);
  console.log(`[PORT_CONFIG] - Vite dev server: ${config.viteHost}:${config.vitePort}`);
  return config;
}

// Export the port configuration
export default getPortConfig();