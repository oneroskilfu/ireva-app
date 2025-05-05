/**
 * Direct Proxy Server for Replit Webview
 * 
 * This server acts as a direct reverse proxy between port 3000 (webview port)
 * and port 5001 (application port). Instead of using iframe or redirect,
 * it fetches the content directly and serves it, ensuring the webview
 * always displays the actual homepage.
 */

const http = require('http');
const https = require('https');
const { createProxyServer } = require('http-proxy');

// Create a proxy server instance
const proxy = createProxyServer({
  target: {
    host: 'localhost',
    port: 5001
  },
  ws: true // Support WebSockets
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  
  // If the main app isn't ready, show a loading page instead
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>iREVA Platform - Loading</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          text-align: center; 
          padding: 0; 
          margin: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
          color: #334155;
        }
        .container { 
          max-width: 600px; 
          width: 90%; 
          background-color: white; 
          padding: 40px; 
          border-radius: 16px; 
          box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
        }
        .logo { 
          font-size: 3rem; 
          font-weight: bold; 
          color: #2563eb; 
          margin-bottom: 10px;
          letter-spacing: -1px;
        }
        .logo span { 
          color: #64748b; 
        }
        h1 {
          font-size: 1.8rem;
          margin-top: 0;
          margin-bottom: 20px;
          color: #1e293b;
        }
        .progress-container {
          height: 6px;
          background-color: #e2e8f0;
          border-radius: 3px;
          margin: 30px 0;
          overflow: hidden;
          position: relative;
        }
        .progress-bar {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #3b82f6);
          animation: progress-animation 2s infinite;
          transform-origin: left;
        }
        @keyframes progress-animation {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .loader { 
          border: 8px solid #e2e8f0; 
          border-top: 8px solid #2563eb; 
          border-radius: 50%; 
          width: 60px; 
          height: 60px; 
          animation: spin 1.5s linear infinite; 
          margin: 30px auto; 
        }
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        .message {
          color: #64748b;
          font-size: 1.1rem;
          margin-bottom: 10px;
        }
        .status {
          font-size: 0.9rem;
          color: #94a3b8;
          margin-top: 30px;
        }
        .refresh-btn { 
          display: inline-block; 
          margin-top: 25px; 
          background-color: #2563eb; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
        }
        .refresh-btn:hover {
          background-color: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(37, 99, 235, 0.25);
        }
        .progress-percentage {
          font-weight: bold;
          color: #2563eb;
        }
      </style>
      <script>
        // Auto-refresh the page every 3 seconds until the app is ready
        let refreshCount = 0;
        const maxRefreshes = 20;
        
        function refreshPage() {
          refreshCount++;
          if (refreshCount <= maxRefreshes) {
            // Update progress percentage
            const progressPercentage = Math.min(95, Math.floor((refreshCount / maxRefreshes) * 100));
            const percentEl = document.getElementById('progress-percentage');
            if (percentEl) {
              percentEl.textContent = progressPercentage + '%';
            }
            
            // Schedule next refresh
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        }
        
        window.onload = refreshPage;
      </script>
    </head>
    <body>
      <div class="container">
        <div class="logo">i<span>REVA</span></div>
        <h1>Welcome to iREVA Platform</h1>
        <p class="message">The application is starting up. Please wait a moment...</p>
        
        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>
        
        <div class="loader"></div>
        
        <p class="message">Loading application resources: <span id="progress-percentage">0%</span></p>
        <p class="status">This page will refresh automatically when the app is ready.</p>
        
        <button class="refresh-btn" onclick="window.location.reload()">Refresh Now</button>
      </div>
    </body>
    </html>
  `);
});

// Create the server to handle requests
const server = http.createServer((req, res) => {
  // Add CORS headers to allow embedding
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Special handling for status routes that Replit uses to check port binding
  if (req.url === '/health' || req.url === '/__health' || req.url === '/__repl') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Try to proxy the request directly
  // This simplifies the process and reduces extra checks
  try {
    proxy.web(req, res, {}, (err) => {
      if (err) {
        console.log('Error proxying request:', err.message);
        // Show loading page when proxy fails
        proxy.emit('error', err, req, res);
      }
    });
  } catch (error) {
    console.log('Exception while proxying:', error.message);
    proxy.emit('error', error, req, res);
  }
});

// Support WebSockets
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// Start the server
server.listen(3000, '0.0.0.0', () => {
  console.log('Direct proxy server running on port 3000');
  console.log('PORT 3000 OPEN AND READY');
  console.log('WEBVIEW PROXY ACTIVE');
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port 3000 is already in use');
  } else {
    console.error('Server error:', err);
  }
});