/**
 * Replit Webview Bridge for iREVA Platform
 * 
 * This creates a simple server on port 3000 that Replit's webview can detect,
 * while redirecting users to your main iREVA application on port 5000.
 */

const http = require('http');
const httpProxy = require('http-proxy-middleware');
const express = require('express');

const app = express();

// Create proxy middleware to forward requests to your main app
const proxy = httpProxy.createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  ws: true, // Enable websocket proxying for hot reload
  onError: (err, req, res) => {
    console.log('Proxy error:', err.message);
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>iREVA Platform Loading...</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .loading { 
              font-size: 24px; 
              margin: 20px 0;
            }
            .retry {
              background: rgba(255,255,255,0.2);
              border: 1px solid rgba(255,255,255,0.3);
              color: white;
              padding: 10px 20px;
              cursor: pointer;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <h1>🏠 iREVA Platform Starting...</h1>
          <div class="loading">Your real estate investment platform is loading</div>
          <button class="retry" onclick="window.location.reload()">Retry</button>
          <script>
            // Auto-refresh every 3 seconds until main app is ready
            setTimeout(() => window.location.reload(), 3000);
          </script>
        </body>
      </html>
    `);
  }
});

// Use proxy for all requests
app.use('/', proxy);

// Start webview bridge server
const server = app.listen(3000, '0.0.0.0', () => {
  console.log('🌐 Replit Webview Bridge running on port 3000');
  console.log('📱 Redirecting to iREVA Platform on port 5000');
  console.log('🎯 Your iREVA homepage should now be visible in webview!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down webview bridge...');
  server.close();
});