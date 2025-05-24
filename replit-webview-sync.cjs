/**
 * Ultra-minimal HTTP server for Replit webview detection
 * This server binds to port 3000 (Replit's default) immediately to ensure
 * the webview can detect our application.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Bind immediately to port 3000
const PORT = 3000;
const MAIN_SERVER_PORT = 3000; // Where the real server will be running

// Create a very simple HTML page that shows loading and refreshes automatically
const html = `
<!DOCTYPE html>
<html>
<head>
  <title>iREVA Platform - Starting</title>
  <meta http-equiv="refresh" content="5">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8fafc;
      color: #334155;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .container {
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
      padding: 40px;
      max-width: 600px;
      width: 100%;
      text-align: center;
    }
    .logo {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #2563eb;
      letter-spacing: -0.05em;
    }
    .logo span {
      color: #64748b;
      font-weight: 500;
    }
    .spinner {
      border: 4px solid rgba(37, 99, 235, 0.1);
      border-radius: 50%;
      border-top: 4px solid #2563eb;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">i<span>REVA</span></div>
    <p>Real Estate Investment Platform</p>
    <div class="spinner"></div>
    <p>The iREVA Platform is starting up...</p>
    <p>This page will refresh automatically.</p>
  </div>
</body>
</html>
`;

// Log function
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Log the request
  log(`Request: ${req.method} ${req.url}`);
  
  // Health check routes for Replit
  if (req.url === '/health' || req.url === '/__health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', port: PORT }));
    return;
  }
  
  // Special routes for Replit
  if (req.url === '/__repl') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('iREVA Platform initializing...');
    return;
  }
  
  // Serve the HTML page for any other request
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  log(`REPLIT WEBVIEW SYNC SERVER STARTED ON PORT ${PORT}`);
  log(`BINDING SUCCESSFUL - PORT ${PORT} READY`);
  
  // Signal that we've started the server for Replit
  console.log(`Webview sync server running on port ${PORT}`);
  console.log(`PORT ${PORT} OPENED SUCCESSFULLY`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    log(`PORT ${PORT} IS ALREADY IN USE - THIS IS EXPECTED IF THE MAIN SERVER HAS STARTED`);
    log('WEBVIEW SYNC SERVER WILL EXIT GRACEFULLY');
    process.exit(0);
  } else {
    log(`SERVER ERROR: ${error.message}`);
    process.exit(1);
  }
});