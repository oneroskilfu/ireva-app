/**
 * Ultra-Minimal Replit Port Binder
 * 
 * This script creates the simplest possible HTTP server to ensure Replit
 * detects port 5000 as being open. It contains no imports, dependencies,
 * or complex code - just the absolute minimum needed to bind the port.
 */

// Use native http module with no dependencies
const http = require('http');

// Log with standardized format that Replit might be looking for
console.log('Starting server on port 5000...');

// Create the most minimal HTTP server possible
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Server is running\n');
});

// Bind to port 5000 with the 0.0.0.0 address to ensure external visibility
server.listen(5000, '0.0.0.0', () => {
  // Use common logging patterns that Replit might detect
  console.log('Server ready on port 5000');
  console.log('Server listening at http://localhost:5000');
  console.log('Listening on port 5000');
});

// Keep the process running indefinitely
setInterval(() => {
  // This keeps the Node.js process alive
}, 1000);