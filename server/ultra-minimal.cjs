#!/usr/bin/env node

/**
 * Ultra-minimal HTTP server that binds to a port immediately
 * This is the absolute minimum needed to keep Replit happy
 */

const http = require('http');
const PORT = process.env.PORT || 3000;

// Create a basic server that responds with a simple message
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>iREVA Authentication System</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            max-width: 500px;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          h1 { color: #2563eb; }
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
          <p>The application is starting...</p>
          <div class="loader"></div>
          <p>This page will refresh automatically when ready.</p>
          <script>
            // Refresh after 5 seconds
            setTimeout(() => window.location.reload(), 5000);
          </script>
        </div>
      </body>
    </html>
  `);
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});