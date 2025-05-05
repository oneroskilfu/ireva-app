#!/usr/bin/env node

/**
 * Ultra-lightweight Express server for immediate port binding
 * - This binds to port 3000 immediately to satisfy Replit's port detection
 * - It serves a minimal, styled landing page while the main app starts
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());

// Simple welcome page
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>iREVA - Authentication System</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
            color: #333;
          }
          .container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          h1 {
            color: #2563eb;
            margin-bottom: 1rem;
          }
          p {
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }
          .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #2563eb;
            border-radius: 50%;
            width: 30px;
            height: 30px;
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
          <h1>iREVA Authentication System</h1>
          <p>The application server is starting...</p>
          <div class="loader"></div>
          <p>This page will automatically redirect to the main application when ready.</p>
        </div>
        <script>
          // Auto-refresh after 5 seconds to check if the main app is ready
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        </script>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running on port ${PORT}`);
  
  // After binding to the port, start the main application
  setTimeout(() => {
    const { exec } = require('child_process');
    console.log('Starting main application...');
    
    // Use exec instead of spawn for simplicity
    exec('NODE_ENV=development tsx server/index.ts', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting main app: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Main app stderr: ${stderr}`);
      }
      console.log(`Main app stdout: ${stdout}`);
    });
  }, 1000); // Wait 1 second before starting the main app
});