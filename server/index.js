/**
 * iREVA Platform - Server Entry Point
 * 
 * Initializes the application server, handles environment variables,
 * and sets up graceful shutdown.
 */

// Load environment variables
require('dotenv').config();

const http = require('http');
const app = require('./app');

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`iREVA Platform server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  
  // Close server gracefully
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  
  server.close(() => {
    console.log('Process terminated!');
    // Process naturally ends here
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  
  server.close(() => {
    console.log('Process terminated by user!');
    process.exit(0);
  });
});