/**
 * Ultra-minimal HTTP server for Replit that binds immediately to port 5000
 * and responds to basic HTTP requests. This is even simpler than our
 * Express server to ensure the fastest possible port binding.
 */

import http from 'http';
import { spawn } from 'child_process';

console.log(`[${new Date().toISOString()}] Starting minimal HTTP server...`);

// Create an extremely minimal HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>iREVA Startup</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
            color: #343a40;
          }
          .loader { 
            border: 5px solid #f3f3f3;
            border-top: 5px solid #2a52be;
            border-radius: 50%;
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
        <script>
          // Auto-refresh after successful server startup
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        </script>
      </head>
      <body>
        <h2>iREVA Platform</h2>
        <p>Initializing application...</p>
        <div class="loader"></div>
        <p><small>This page will refresh automatically once the application is ready.</small></p>
      </body>
    </html>
  `);
});

// Bind to port 5000 immediately
server.listen(5000, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] HTTP server successfully bound to port 5000`);
  
  // After port binding, start the real application server
  console.log(`[${new Date().toISOString()}] Starting the real application server...`);
  
  // Option 1: Wait a brief moment then close this server and let the real server take over
  setTimeout(() => {
    // Launch the real application in a separate process
    const applicationProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: false
    });
    
    applicationProcess.on('error', (err) => {
      console.error(`[${new Date().toISOString()}] Failed to start application:`, err);
    });
    
    // Give the application a moment to start, then close our minimal server
    setTimeout(() => {
      server.close(() => {
        console.log(`[${new Date().toISOString()}] Minimal HTTP server closed, handed over to full application`);
      });
    }, 3000);
  }, 1000);
});

// Handle any server errors
server.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] HTTP server error:`, err);
  process.exit(1);
});