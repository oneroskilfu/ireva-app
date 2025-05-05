/**
 * Ultra-Minimal Replit Port Binding Script
 * This script does nothing except bind port 5000 in the simplest way possible.
 * Use it to test if Replit can detect even the most basic port binding.
 */

const http = require('http');

// Log with standardized format
console.log('Starting server on port 5000...');

// Create minimal HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Server is running\n');
});

// Bind to port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('Server ready on port 5000');
});

// Keep the process running
setInterval(() => {}, 1000);