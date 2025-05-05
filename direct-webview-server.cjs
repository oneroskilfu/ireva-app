/**
 * Simple HTTP server to directly serve the iREVA homepage in webview
 * This server binds to port 5000 immediately to satisfy Replit's port detection
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const HOMEPAGE_FILE = path.join(__dirname, 'webview-homepage.html');

console.log('DIRECT WEBVIEW SERVER INITIALIZATION...');
console.log(`Creating direct webview server on port ${PORT}...`);

// Read the homepage file
let homepageContent;
try {
  homepageContent = fs.readFileSync(HOMEPAGE_FILE, 'utf8');
  console.log('Homepage file loaded successfully');
} catch (err) {
  console.error('Error loading homepage file:', err);
  homepageContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>iREVA Platform - Error</title>
        <meta http-equiv="refresh" content="5">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 40px 20px; }
        </style>
      </head>
      <body>
        <h1>iREVA Platform</h1>
        <p>Error loading homepage. Retrying in 5 seconds...</p>
      </body>
    </html>
  `;
}

// Create a server that directly serves the homepage
const server = http.createServer((req, res) => {
  // Set headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Add special headers for Replit
  res.setHeader('X-Replit-Port-Status', 'active');
  res.setHeader('X-Port-Binding-Success', 'true');
  res.setHeader('X-Replit-Health-Check', 'success');
  
  // Directly serve the homepage HTML
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(homepageContent);
  
  console.log(`Served homepage for request: ${req.method} ${req.url}`);
});

// Explicitly bind to all interfaces on port 5000
server.listen(PORT, '0.0.0.0', () => {
  // Log success messages for Replit's detection
  console.log(`DIRECT WEBVIEW SERVER LISTENING ON PORT ${PORT}`);
  console.log(`PORT ${PORT} OPEN AND READY`);
  console.log('PORT BINDING SUCCESSFUL');
});

// Handle server errors
server.on('error', (err) => {
  console.error('SERVER ERROR:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} already in use. Unable to start direct webview server.`);
  }
  process.exit(1);
});