// server.cjs (CommonJS version)
// This is the one loaded by bootstrap.cjs

const express = require('express');
const app = express();

// Basic middleware and routes
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'CommonJS'
  });
});

// Simple home route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>iREVA Platform</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 0;
            padding: 50px 20px;
            background: linear-gradient(to right, #f8f9fa, #e9ecef);
          }
          h1 {
            color: #2a52be;
            margin-bottom: 20px;
          }
          .card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>iREVA Platform (CJS)</h1>
          <p>Real Estate Investment Platform</p>
          <p>Server is running successfully!</p>
          <p><small>Startup Time: ${new Date().toISOString()}</small></p>
        </div>
      </body>
    </html>
  `);
});

// Debug route for testing
app.get('/api/debug/info', (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    serverType: 'CommonJS'
  });
});

// Start server
app.listen(5000, () => {
  console.log('[iREVA] Full CommonJS backend started on port 5000');
});