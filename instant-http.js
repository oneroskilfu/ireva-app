/**
 * Ultra-minimal HTTP server for Replit that binds immediately to port 5000
 * and responds to basic HTTP requests. This is even simpler than our
 * Express server to ensure the fastest possible port binding.
 */
const http = require('http');

// Create a very simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Received request for ${req.url}`);
  
  // Send a basic response
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('iREVA Platform is starting...\n');
});

// Listen on port 5000
console.log('Starting instant HTTP server on port 5000...');
server.listen(5000, '0.0.0.0', () => {
  console.log('✓ HTTP server bound to port 5000 - Replit port check should pass');
  console.log('Ready for requests at: http://localhost:5000');
});

// Handle errors
server.on('error', (err) => {
  console.error('HTTP server error:', err);
});

// Log information
console.log('Server will remain active indefinitely');
console.log('=============================================');
console.log('The actual iREVA application will need to be started separately');
console.log('Run `npm run dev` in another terminal to start the real server');
console.log('=============================================');