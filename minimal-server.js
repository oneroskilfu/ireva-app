/**
 * Ultra-minimal TCP server for Replit that binds to port 5000 immediately.
 * This is the absolute minimum needed to bind a port in Node.js.
 */

const net = require('net');
const port = 5000;

// Create a minimal TCP server that does nothing but bind to the port
const server = net.createServer();

// Bind to port immediately
server.listen(port, '0.0.0.0', () => {
  console.log(`TCP server bound to port ${port}`);
});