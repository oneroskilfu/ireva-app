#!/usr/bin/env node

/**
 * Ultra-minimal startup script for Replit
 * Using CommonJS for maximum compatibility
 */
const http = require('http');
const { exec } = require('child_process');

// Create minimal HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>iREVA Platform</title>
        <style>
          body { font-family: system-ui; margin: 0; padding: 20px; text-align: center; }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { color: #2563eb; }
          .loader { width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
        <meta http-equiv="refresh" content="3">
      </head>
      <body>
        <div class="container">
          <h1>iREVA Real Estate Investment Platform</h1>
          <p>Application is starting, please wait...</p>
          <div class="loader"></div>
          <p>This page will automatically refresh</p>
        </div>
      </body>
    </html>
  `);
});

// Bind immediately to port 3000
server.listen(3000, '0.0.0.0', () => {
  console.log('Quick server running on port 3000');
  
  // Start main application on the same port later
  setTimeout(() => {
    console.log('Starting main application...');
    exec('NODE_ENV=development NODE_OPTIONS="--import tsx" node server/index.ts', (error, stdout, stderr) => {
      if (error) {
        console.error('Error starting application:', error);
        return;
      }
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
    });
  }, 2000);
});