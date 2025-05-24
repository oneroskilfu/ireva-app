/**
 * Direct Webview Server for iREVA Platform
 * 
 * This is a minimal Express server that handles Replit's port detection
 * and provides immediate access to the application through the webview.
 * 
 * It works by:
 * 1. Binding to port 5000 immediately for Replit's port detection
 * 2. Providing a redirect mechanism to the main application on port 5001
 * 3. Supporting health checks and connection status information
 */

const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

// Set up server
const app = express();
const PORT = 5000;
const MAIN_APP_PORT = 5001;

// Log with timestamp
function log(message) {
  console.log(message);
}

// Load HTML files
let homepageHtml;
let redirectHtml;
let webviewHtml;

// Try loading our main webview file
try {
  webviewHtml = fs.readFileSync(path.join(__dirname, 'webview.html'), 'utf8');
  log('Webview HTML file loaded successfully');
} catch (err) {
  log(`Error loading webview HTML file: ${err.message}`);
  // Will set a fallback later
}

// Load homepage HTML
try {
  homepageHtml = fs.readFileSync(path.join(__dirname, 'webview-homepage.html'), 'utf8');
  log('Homepage file loaded successfully');
} catch (err) {
  log(`Error loading homepage file: ${err.message}`);
  homepageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>iREVA Platform</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #2563eb; }
      </style>
    </head>
    <body>
      <h1>iREVA Platform</h1>
      <p>Connecting to application server...</p>
      <script>
        setTimeout(() => { window.location.href = window.location.protocol + '//' + window.location.hostname + ':5001'; }, 5000);
      </script>
    </body>
    </html>
  `;
}

// Load redirect HTML
try {
  redirectHtml = fs.readFileSync(path.join(__dirname, 'webview-redirect.html'), 'utf8');
  log('Redirect file loaded successfully');
} catch (err) {
  log(`Error loading redirect file: ${err.message}`);
  redirectHtml = homepageHtml;
}

// If webview HTML wasn't loaded, use redirect HTML as fallback
if (!webviewHtml) {
  webviewHtml = redirectHtml;
}

// Check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
      .once('error', err => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          reject(err);
        }
      })
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port, '0.0.0.0');
  });
}

// Health check routes
app.get('/health', (req, res) => {
  res.send({ status: 'ok', port: PORT, timestamp: new Date().toISOString() });
});

app.get('/__health', (req, res) => {
  res.send({ status: 'ok', service: 'iREVA Direct Webview Server', port: PORT });
});

// Handle Replit special paths
app.get('/__repl', (req, res) => {
  res.send('iREVA Platform is running.');
});

app.get('/__replbuild', (req, res) => {
  res.send('Replit build check passed.');
});

// Support direct port testing
app.get('/port-test-direct', (req, res) => {
  res.send(`iREVA direct webview server on port ${PORT} is working.`);
});

// Special webview handling
app.get('/webview-ready', (req, res) => {
  res.send({ ready: true, mainAppPort: MAIN_APP_PORT });
});

// Special route for webview direct access
app.get('/webview', (req, res) => {
  log('Direct webview access request received');
  
  // Serve our specialized webview HTML file
  log('Serving webview HTML for direct access');
  res.send(webviewHtml);
});

// Force redirect route (used by webview for direct access)
app.get('/force-redirect', (req, res) => {
  log('Force redirect request received');
  
  // Log hostname for debugging
  const host = req.headers.host || req.hostname || '';
  log(`Request host header: ${host}`);
  
  // Handle different hostname formats for Replit
  let targetUrl;
  if (host.includes('replit') || host.includes('repl.co')) {
    // Special handling for Replit domains
    // Extract the repl ID and owner from hostname if possible
    const parts = host.split('.');
    if (parts.length >= 2) {
      // Format: [repl-id]-[owner-username].replit.app or similar
      const replId = parts[0].split('-')[0]; // Get the repl ID portion
      targetUrl = `https://${replId}-${MAIN_APP_PORT}.${parts.slice(1).join('.')}/`;
    } else {
      // Fallback to standard format with port
      targetUrl = `https://${host.split(':')[0]}:${MAIN_APP_PORT}/`;
    }
  } else {
    // Standard format for local or non-Replit domains
    targetUrl = `http://${req.hostname}:${MAIN_APP_PORT}/`;
  }
  
  log(`Force redirecting to: ${targetUrl}`);
  res.redirect(targetUrl);
});

// Check main app availability
app.get('/check-main-app', async (req, res) => {
  try {
    const isInUse = await isPortInUse(MAIN_APP_PORT);
    res.json({ available: isInUse, port: MAIN_APP_PORT });
  } catch (err) {
    res.json({ available: false, error: err.message });
  }
});

// Handle the root path - serve webview HTML for direct access
app.get('/', (req, res) => {
  // Check the host header to determine if this is a webview request
  const host = req.headers.host || '';
  
  // Log the incoming request
  log(`Incoming request from host: ${host}`);
  
  // Check if this appears to be a webview request (Replit domain)
  const isWebviewRequest = host.includes('repl.co') || host.includes('replit');
  
  // Verify main app is available
  isPortInUse(MAIN_APP_PORT)
    .then(isAvailable => {
      if (isAvailable) {
        log(`Main app detected on port ${MAIN_APP_PORT}`);
        
        // If this appears to be a webview request, serve our specialized webview HTML
        if (isWebviewRequest) {
          log('Serving webview HTML for direct access');
          return res.send(webviewHtml);
        }
        
        // Otherwise redirect directly
        const targetUrl = `http://${req.hostname}:${MAIN_APP_PORT}/`;
        log(`Redirecting to: ${targetUrl}`);
        return res.redirect(targetUrl);
      } else {
        // If main app is not available, show loading page
        log(`Main app not detected, showing loading page`);
        res.send(homepageHtml);
      }
    })
    .catch(err => {
      log(`Error checking main app: ${err.message}`);
      res.send(homepageHtml);
    });
});

// Fall back to redirecting to port 5001 if no other routes match
app.use((req, res) => {
  const targetUrl = `http://${req.hostname}:${MAIN_APP_PORT}${req.url}`;
  res.redirect(targetUrl);
});

// Start server
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  log('DIRECT WEBVIEW SERVER INITIALIZATION...');
  log(`Creating direct webview server on port ${PORT}...`);
  log(`DIRECT WEBVIEW SERVER LISTENING ON PORT ${PORT}`);
  log('PORT 5000 OPEN AND READY');
  log('PORT BINDING SUCCESSFUL');
});

// Handle server errors
server.on('error', (error) => {
  log(`SERVER ERROR: ${error.message}`);
  process.exit(1);
});

// Ensure we exit gracefully
process.on('SIGINT', () => {
  log('SHUTTING DOWN DIRECT WEBVIEW SERVER...');
  server.close(() => {
    log('SERVER CLOSED');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  log('TERMINATING DIRECT WEBVIEW SERVER...');
  server.close(() => {
    log('SERVER TERMINATED');
    process.exit(0);
  });
});