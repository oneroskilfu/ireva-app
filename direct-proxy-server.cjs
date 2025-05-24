/**
 * Ultra-minimal Direct Port Proxy Server for Replit
 * 
 * This server binds directly to port 3000 and serves a minimal
 * HTML page with embedded iframe for the main application.
 * This is the most direct solution to the Replit webview issue.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// HTML content with embedded iframe
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>iREVA Platform</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .iframe-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    .loading {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: #f8fafc;
      z-index: 10;
      transition: opacity 0.5s ease-in-out;
    }
    .loading.hidden {
      opacity: 0;
      pointer-events: none;
    }
    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #e2e8f0;
      border-top: 5px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 {
      color: #1e293b;
      margin-bottom: 10px;
    }
    p {
      color: #64748b;
      text-align: center;
      max-width: 80%;
    }
  </style>
</head>
<body>
  <div class="loading" id="loadingScreen">
    <div class="spinner"></div>
    <h2>iREVA Platform</h2>
    <p>Loading the real estate investment platform...</p>
  </div>
  
  <div class="iframe-container">
    <iframe src="https://YOUR_REPLIT_DOMAIN-5001.repl.co" id="mainAppFrame" 
            onload="document.getElementById('loadingScreen').classList.add('hidden')"></iframe>
  </div>
  
  <script>
    // Dynamically update iframe URL based on current domain
    window.addEventListener('DOMContentLoaded', () => {
      const iframe = document.getElementById('mainAppFrame');
      const currentDomain = window.location.hostname;
      
      // Generate the main app URL by replacing the port number in the domain
      const mainAppDomain = currentDomain.replace(/-?\\d*\\./, '-5001.');
      iframe.src = \`https://\${mainAppDomain}\`;
      
      console.log('Main app URL:', iframe.src);
    });
  </script>
</body>
</html>`;

// Create the direct access HTML file
fs.writeFileSync(path.join(__dirname, 'direct-app-access.html'), htmlContent);

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  
  // Set headers for Replit port detection
  res.writeHead(200, { 
    'Content-Type': 'text/html',
    'X-Replit-Port-Status': 'active',
    'X-Replit-Health-Check': 'success'
  });
  
  // Serve the HTML content
  res.end(htmlContent);
});

// Start server on port 3000
console.log('Starting direct proxy server on port 3000...');
server.listen(3000, '0.0.0.0', () => {
  console.log('PORT 3000 OPEN AND READY');
  console.log('Direct proxy server running on http://0.0.0.0:3000');
  
  // Create a timestamp for logging
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Server successfully bound to port 3000`);
});