#!/bin/bash

# Replit-specific workflow script for iREVA platform
echo "==== STARTING REPLIT OPTIMIZED SERVER ===="
echo "Date: $(date)"
echo "Opening port 3000 immediately for Replit Webview..."

# Create a flag file to indicate we're running
touch replit_running_flag.txt

# Create a very simple HTTP server on port 3000 that also imports our real app
node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple HTML page with auto-redirect to main app
const html = \`
<!DOCTYPE html>
<html>
<head>
  <title>iREVA Platform - Starting</title>
  <meta http-equiv='refresh' content='5;url=https://\${process.env.REPL_SLUG}-5001.\${process.env.REPL_SLUG.split('-')[0]}.repl.co'>
  <style>
    body { font-family: Arial; max-width: 800px; margin: 50px auto; text-align: center; }
    .logo { font-size: 2rem; font-weight: bold; margin-bottom: 20px; }
    .spinner { border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 2s linear infinite; margin: 20px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class='logo'>iREVA Platform</div>
  <div class='spinner'></div>
  <p>The application is starting...</p>
  <p>You will be redirected automatically in a few seconds.</p>
  <p>If not redirected, please click <a href='https://\${process.env.REPL_SLUG}-5001.\${process.env.REPL_SLUG.split('-')[0]}.repl.co'>here</a> to access the application.</p>
</body>
</html>
\`;

// Create simple HTTP server on port 3000
const server = http.createServer((req, res) => {
  console.log(\`[\${new Date().toISOString()}] Request: \${req.method} \${req.url}\`);
  
  // Serve HTML for most requests
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(html);
});

// Start the server on port 3000
server.listen(3000, '0.0.0.0', () => {
  console.log(\`[\${new Date().toISOString()}] Server running on port 3000\`);
  console.log('PORT 3000 OPEN AND READY');
  
  // Now start the main application server on port 5001
  const { spawn } = require('child_process');
  
  // Set environment variables for the main application
  process.env.PORT = '5001';
  process.env.MAIN_APP_PORT = '5001';
  
  console.log(\`[\${new Date().toISOString()}] Starting main application on port 5001...\`);
  
  // Start the main application (adjust command as needed)
  const mainApp = spawn('npm', ['run', 'dev'], {
    env: { ...process.env, PORT: '5001' },
    stdio: 'inherit'
  });
  
  mainApp.on('error', (err) => {
    console.error(\`[\${new Date().toISOString()}] Failed to start main application: \${err.message}\`);
  });
  
  // Clean up when the script is terminated
  process.on('SIGINT', () => {
    console.log(\`[\${new Date().toISOString()}] Terminating servers...\`);
    server.close();
    mainApp.kill();
    process.exit(0);
  });
});
" &

# Keep the script running
echo "Replit webview server running on port 3000"
echo "Main application starting on port 5001"
echo "Press Ctrl+C to terminate"

# Keep this script running until we get a termination signal
wait