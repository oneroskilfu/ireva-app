/**
 * Special server that binds directly to port 3000 (Replit's webview port)
 * This solves the "Run this app to see the results here" issue by providing
 * an immediate response on the port that Replit's webview specifically checks.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3000;
const MAIN_APP_PORT = 5001;

// Create a simple HTML page with auto-refresh functionality
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="5">
  <title>iREVA Platform</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      text-align: center;
      background-color: #f5f7fa;
    }
    .logo {
      font-size: 2.5rem;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 20px;
    }
    .logo span {
      color: #64748b;
    }
    .spinner {
      border: 5px solid #f3f3f3;
      border-top: 5px solid #2563eb;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 2s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .card {
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-top: 20px;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      margin-top: 20px;
      font-weight: bold;
    }
  </style>
  <script>
    // Function to detect Replit environment
    function detectReplitEnv() {
      try {
        const url = new URL(window.location.href);
        const hostParts = url.hostname.split('.');
        const replId = hostParts[0].split('-')[0]; // Extract just the repl ID part
        
        return {
          replId,
          domain: hostParts.slice(1).join('.'),
          isReplit: hostParts.length > 1 && url.hostname.includes('replit')
        };
      } catch (error) {
        console.error('Error detecting Replit environment:', error);
        return { isReplit: false };
      }
    }
    
    // Function to redirect to the main app
    function redirectToMainApp() {
      const replInfo = detectReplitEnv();
      if (replInfo.isReplit) {
        const mainAppUrl = \`https://\${replInfo.replId}-5001.\${replInfo.domain}/\`;
        console.log('Redirecting to:', mainAppUrl);
        window.location.href = mainAppUrl;
      }
    }
    
    // Attempt to redirect after page loads
    window.onload = function() {
      // Wait a bit then try to redirect
      setTimeout(redirectToMainApp, 3000);
    };
  </script>
</head>
<body>
  <div class="logo">i<span>REVA</span></div>
  <div class="card">
    <h1>Starting iREVA Platform</h1>
    <div class="spinner"></div>
    <p>The application is initializing...</p>
    <p>You will be redirected automatically when it's ready.</p>
    <a href="javascript:redirectToMainApp()" class="button">Click here if not redirected</a>
  </div>
</body>
</html>
`;

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Special routes for Replit
  if (req.url === '/health' || req.url === '/__health' || req.url === '/__repl') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', port: PORT }));
    return;
  }
  
  // Serve HTML page for all other requests
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] REPLIT WEBVIEW FIX SERVER STARTED ON PORT ${PORT}`);
  console.log(`[${new Date().toISOString()}] PORT ${PORT} IS OPEN AND READY`);
  // These special messages are essential for Replit to detect the port
  console.log(`Server is running at: http://localhost:${PORT}/`);
  console.log(`Server started on port ${PORT}`);
  console.log(`Listening on port ${PORT}`);
  console.log(`PORT ${PORT} OPEN AND READY`);
});

// Handle errors gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[${new Date().toISOString()}] Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    console.error(`[${new Date().toISOString()}] Server error:`, err);
  }
});

// Log a message every 10 seconds to prevent timeouts
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Server is still running on port ${PORT}`);
}, 10000);