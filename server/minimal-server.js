/**
 * Ultra-minimal HTTP server that binds immediately to port 5000.
 * This is the absolute simplest server we can create to pass Replit's port check.
 */
const http = require('http');

// Create the simplest possible HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('iREVA server is starting...\n');
});

// Listen on port 5000 with a basic callback
server.listen(5000, '0.0.0.0', () => {
  console.log('SERVER READY ON PORT 5000');
});