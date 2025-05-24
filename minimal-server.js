/**
 * Ultra-minimal HTTP server that handles port binding for Replit
 * This is an ES module compatible version for seamless use with package.json type:module
 */

import { createServer } from 'http';

const PORT = process.env.PORT || 3000;

// Create a basic HTTP server
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>iREVA - Real Estate Investment Platform</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f7f9fc;
          }
          .container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          h1 { color: #2563eb; margin-bottom: 10px; }
          .subtitle { color: #4b5563; margin-bottom: 24px; }
          .info { margin: 20px 0; color: #6b7280; font-size: 0.9rem; }
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
          <p class="subtitle">Secure access for real estate investments</p>
          <div class="loader"></div>
          <p class="info">Server running on port ${PORT}</p>
          <p>Please wait while the application initializes...</p>
        </div>
      </body>
    </html>
  `);
});

// Listen on all interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
});

// Handle termination signals
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});