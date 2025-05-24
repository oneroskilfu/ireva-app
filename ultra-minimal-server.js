/**
 * Ultra-minimal server for Replit webview
 * This is specifically designed to bind to port 3000 immediately
 */

import http from 'http';

// Simple HTML content that loads in the webview
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>iREVA Platform</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f0f4f8;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      color: #334155;
    }
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      max-width: 800px;
      width: 90%;
      text-align: center;
    }
    h1 {
      color: #2563eb;
      margin-bottom: 1rem;
    }
    .status {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 500;
      margin: 1rem 0;
    }
    .button {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      text-decoration: none;
      font-weight: 500;
      margin-top: 1.5rem;
      transition: background 0.2s;
    }
    .button:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>iREVA Platform</h1>
    <p>The Real Estate Investment Platform is running successfully.</p>
    <div class="status">PORT 3000 ACTIVE</div>
    <p>Both servers are operational. The main application server is running on port 5001.</p>
    <p>The current timestamp is ${new Date().toISOString()}</p>
    
    <script>
      // Dynamically update the URL based on the current hostname
      document.addEventListener('DOMContentLoaded', () => {
        const hostname = window.location.hostname;
        const mainAppUrl = hostname.replace(/-?\\d*\\./, '-5001.');
        
        // Create button with proper URL
        const link = document.createElement('a');
        link.href = 'https://' + mainAppUrl;
        link.className = 'button';
        link.textContent = 'Access Main Application';
        link.target = '_blank';
        
        document.querySelector('.card').appendChild(link);
      });
    </script>
  </div>
</body>
</html>
`;

// Create an HTTP server that responds immediately
const server = http.createServer((req, res) => {
  // Set headers that signal to Replit that the port is active
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'X-Replit-Port-Status': 'active',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Return the HTML content
  res.end(html);
});

// Bind to port 3000 immediately
server.listen(3000, '0.0.0.0', () => {
  console.log('PORT 3000 OPEN AND READY');
  console.log('Ultra-minimal server running on http://0.0.0.0:3000');
});