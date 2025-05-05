#!/usr/bin/env node

/**
 * Minimal Express server using CommonJS syntax
 * for maximum compatibility
 */
const express = require('express');
const app = express();
const { exec } = require('child_process');
const PORT = 3000;

// Serve static welcome page
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
          <p>The main application is running on port 3001.</p>
          <p><a href="http://localhost:3001" style="display: inline-block; padding: 10px 16px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; font-weight: 500;">Go to Main Application</a></p>
        </div>
      </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running on port ${PORT}`);
  
  // Start the main application
  setTimeout(() => {
    const mainApp = exec('PORT=3001 NODE_ENV=development npx tsx server/index.ts', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting main app: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Main app stderr: ${stderr}`);
      }
      console.log(`Main app stdout: ${stdout}`);
    });
    
    // Log any output from the main app process
    mainApp.stdout?.on('data', (data) => {
      console.log(`Main app: ${data}`);
    });
    
    mainApp.stderr?.on('data', (data) => {
      console.error(`Main app error: ${data}`);
    });
    
  }, 1000);
});