/**
 * Simplified Direct Webview Server for Replit
 * This server will directly bind to port 3000 for the Replit webview
 */

const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  res.writeHead(200, { 
    'Content-Type': 'text/html',
    'X-Replit-Port-Status': 'active'
  });
  
  // Send a simple HTML page
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>iREVA Platform</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background-color: #f0f4f8;
          color: #333;
          line-height: 1.6;
        }
        .container {
          max-width: 800px;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          margin: 2rem;
        }
        h1 {
          color: #2563eb;
          margin-bottom: 1rem;
        }
        p {
          margin-bottom: 1.5rem;
        }
        .btn {
          display: inline-block;
          background-color: #2563eb;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          text-decoration: none;
          font-weight: bold;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>iREVA Platform</h1>
        <p>Welcome to the iREVA Real Estate Investment Platform</p>
        <p>The application is running successfully.</p>
        <p>Server on port 3000 is responding correctly.</p>
        <a href="#" class="btn">Explore Platform</a>
      </div>
    </body>
    </html>
  `);
});

// Start the server on port 3000
console.log('Starting direct webview server on port 3000...');
server.listen(3000, '0.0.0.0', () => {
  console.log('Direct webview server is running on port 3000');
  console.log('PORT 3000 OPEN AND READY');
});