/**
 * Test port binding on port 3000 (alternative to 5000)
 * This script tests if Replit can detect port binding on port 3000 instead of 5000
 */

const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Port 3000 test server active\n');
});

// Log before binding
console.log('Attempting to bind to port 3000...');

// Bind to port 3000
server.listen(3000, '0.0.0.0', () => {
  console.log('PORT 3000 BOUND SUCCESSFULLY');
  console.log('Listening on port 3000');
  console.log('Server running at http://0.0.0.0:3000/');
});

// Handle errors
server.on('error', (err) => {
  console.error('Error binding to port 3000:', err.message);
  process.exit(1);
});

// Keep the process running
setInterval(() => {
  console.log('Server still running on port 3000...');
}, 10000);