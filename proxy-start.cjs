// proxy-start.cjs - Special launcher for Replit
// This immediately binds to port 5000, then starts the real server
// Use this with: run = "node proxy-start.cjs"

const http = require('http');
const { spawn } = require('child_process');
const port = 5000;

console.log('[iREVA] Starting proxy server for Replit...');

// Create and start a minimal HTTP server first
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>iREVA Platform - Starting</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 0;
            padding: 50px 20px;
            background: #f5f5f5;
          }
          h1 {
            color: #2a52be;
          }
          .loading {
            display: inline-block;
            width: 30px;
            height: 30px;
            border: 3px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top-color: #2a52be;
            animation: spin 1s ease-in-out infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <h1>iREVA Platform</h1>
        <p>Starting the application...</p>
        <div class="loading"></div>
        <p><small>Starting at: ${new Date().toISOString()}</small></p>
      </body>
    </html>
  `);
});

// Bind to port immediately
server.listen(port, '0.0.0.0', () => {
  console.log(`[iREVA] Proxy server bound to port ${port}`);
  
  // Start the actual application in the background
  console.log('[iREVA] Starting the actual server...');
  const npm = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    detached: false
  });
  
  npm.on('error', (err) => {
    console.error('[iREVA] Failed to start application:', err);
  });
});