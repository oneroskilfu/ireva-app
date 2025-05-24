/**
 * Vite Port Configuration Helper
 * 
 * This file is loaded by the development server to configure
 * Vite's port and host settings. It reads from environment variables
 * set in the workflow script.
 */

// Export the configuration object
module.exports = {
  // Default to port 3000 if the environment variable is not set
  port: parseInt(process.env.VITE_PORT || '3000', 10),
  
  // Bind to all network interfaces for Replit compatibility
  host: process.env.VITE_HOST || '0.0.0.0',
  
  // Allow accessing the dev server from the network
  strictPort: true,
  
  // Add headers for better Replit webview compatibility
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
};