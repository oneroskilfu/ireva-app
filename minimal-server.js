/**
 * Ultra-minimal TCP server for Replit that binds to port 5000 immediately.
 * This is the absolute minimum needed to bind a port in Node.js.
 */

import net from 'net';

console.log(`[${new Date().toISOString()}] Starting minimal TCP server...`);

// Create a TCP server that does nothing except bind to the port
const server = net.createServer();

// Bind to port 5000 immediately
server.listen(5000, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] TCP server bound to port 5000`);
});