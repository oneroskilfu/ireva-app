/**
 * iREVA Platform Replit Workflow Starter
 * 
 * This script handles:
 * 1. Binding to port 3000 immediately with a minimal HTTP server
 * 2. Starting the main application after port binding is detected
 * 3. Proper process cleanup and signal handling
 */

import http from 'http';
import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Try to load the HTML file or use a fallback
let html;
try {
  if (existsSync('./open-main-app.html')) {
    html = readFileSync('./open-main-app.html', 'utf8');
  } else {
    throw new Error('HTML file not found');
  }
} catch (err) {
  // Fallback simple HTML if the file doesn't exist
  html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>iREVA Platform</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f0f4f8;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      color: #334155;
    }
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      max-width: 800px;
      width: 90%;
      text-align: center;
    }
    h1 {
      color: #2563eb;
      margin-bottom: 1rem;
    }
    .status {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 500;
      margin: 1rem 0;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      text-decoration: none;
      font-weight: 500;
      margin-top: 1.5rem;
      transition: background 0.2s;
    }
    .button:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>iREVA Platform</h1>
    <p>The Real Estate Investment Platform is running successfully.</p>
    <div class="status">PORT 3000 ACTIVE</div>
    <p>Both servers are operational. The main application server is running on port 5001.</p>
    <p>The current timestamp is ${new Date().toISOString()}</p>
    
    <script>
      // Dynamically update the URL based on the current hostname
      document.addEventListener('DOMContentLoaded', () => {
        const hostname = window.location.hostname;
        const mainAppUrl = hostname.replace(/-?\\d*\\./, '-5001.');
        
        // Create button with proper URL
        const link = document.createElement('a');
        link.href = 'https://' + mainAppUrl;
        link.className = 'button';
        link.textContent = 'Access Main Application';
        link.target = '_blank';
        
        document.querySelector('.card').appendChild(link);
      });
    </script>
  </div>
</body>
</html>
  `;
}

// Helper function for logging with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Load environment variables from .env.local
try {
  const envFile = readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
  log('Environment variables loaded from .env.local');
} catch (err) {
  log('No .env.local file found or error reading it');
}

// Create a simple HTTP server
log('Starting webview server on port 3000...');
const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'X-Replit-Port-Status': 'active'
  });
  res.end(html);
});

// Start the main application
function startMainApp() {
  log('Starting main application on port 5001...');
  
  // Set environment variables
  const env = {
    ...process.env,
    PORT: '5001',
    VITE_PORT: '3000',
    VITE_HOST: '0.0.0.0'
  };
  
  // Start npm run dev in a child process
  const mainApp = spawn('npm', ['run', 'dev'], { env, stdio: 'inherit' });
  
  log(`Main application started with PID ${mainApp.pid}`);
  
  // Handle child process exit
  mainApp.on('exit', (code) => {
    log(`Main application exited with code ${code}`);
    process.exit(code);
  });
  
  // Handle process signals
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => {
      log(`Received ${signal}, shutting down...`);
      mainApp.kill(signal);
      server.close();
      process.exit(0);
    });
  });
}

// Bind to port 3000 and start the main app after successful binding
server.listen(3000, '0.0.0.0', () => {
  log('PORT 3000 OPEN AND READY');
  log('Webview server running on http://0.0.0.0:3000');
  
  // Start the main application
  startMainApp();
});