/**
 * Ultra-lightweight HTTP server for Replit workflow
 */

const http = require('http');
const PORT = process.env.PORT || 3000;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
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
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          h1 { color: #2563eb; margin-bottom: 10px; }
          .info { margin: 20px 0; color: #666; }
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
          <p>Secure authentication for real estate investments</p>
          <div class="loader"></div>
          <p class="info">Server running on port ${PORT}</p>
          <p>Our full application is starting soon...</p>
        </div>
      </body>
    </html>
  `);
});

// Listen on the specified port and all interfaces
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});