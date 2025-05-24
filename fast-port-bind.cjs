/**
 * Ultra-minimal TCP socket binding for Replit
 * This creates the fastest possible port binding to satisfy Replit's timeout requirements
 */
const net = require('net');

// Create a TCP server with minimal overhead
const server = net.createServer(socket => {
  // When connection received, respond with valid HTTP
  socket.end('HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<html><body><h1>iREVA Platform Initializing...</h1><p>Please wait while the application loads.</p></body></html>');
});

// Bind to port 3000 on all interfaces
server.listen(3000, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] TCP socket bound to port 3000`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => console.log('TCP socket closed'));
});

process.on('SIGINT', () => {
  server.close(() => console.log('TCP socket closed'));
});