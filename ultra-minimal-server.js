/**
 * Ultra-minimal server for Replit webview
 * This is specifically designed to bind to port 3000 immediately
 */

import http from 'http';

// Create an ultra-minimal server
const server = http.createServer((req, res) => {
  // Special routes for Replit
  if (req.url === '/health' || req.url === '/__health' || req.url === '/__repl') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  
  // Serve a simple HTML page for all other requests
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>iREVA Platform</title>
      <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        .loader { border: 8px solid #f3f3f3; border-top: 8px solid #3498db; border-radius: 50%; width: 60px; height: 60px; animation: spin 2s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <h1>iREVA Platform</h1>
      <div class="loader"></div>
      <p>The application is starting. Please wait...</p>
    </body>
    </html>
  `);
});

// Bind to port 3000 immediately
server.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
  console.log('PORT 3000 OPEN AND READY');
});

// Handle errors
server.on('error', (err) => {
  console.error('Server error:', err);
});