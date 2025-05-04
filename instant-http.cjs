/**
 * Ultra-minimal HTTP server for Replit that binds immediately to port 5000
 * and responds to basic HTTP requests. This is even simpler than our
 * Express server to ensure the fastest possible port binding.
 */

const http = require('http');
const port = 5000;

// Create a minimal HTTP server
const server = http.createServer((req, res) => {
  // Handle health check
  if (req.url === '/api/health') {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' 
    });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    }));
    return;
  }
  
  // Default response
  res.writeHead(200, { 
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  });
  res.end('iREVA platform is starting...\n');
});

// Bind to port immediately - this must happen as fast as possible
console.log(`[${new Date().toISOString()}] Starting iREVA HTTP server...`);
server.listen(port, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] Server bound to port ${port}`);
});

// We're deliberately not starting the full application here
// to ensure the fastest possible port binding