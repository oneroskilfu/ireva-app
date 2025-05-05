/**
 * iREVA Platform Standalone Server for Replit Webview
 * 
 * This server serves as a specialized proxy for Replit's Webview system:
 * 1. Binds to port 3000 (Replit's default webview port)
 * 2. Proxies all requests to the main application on port 5001
 * 3. Provides helpful loading screens when the main app is not yet available
 * 4. Handles cross-origin and websocket proxying
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

// Create Express app
const app = express();

// Configure ports
const PORT = 3000;               // Replit's default webview port
const MAIN_APP_PORT = 5001;      // Main iREVA application
const DIRECT_SERVER_PORT = 5000; // Direct webview server

// Log function with timestamps
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Load HTML files
let homepageHtml;
let webviewHtml;

// Load webview.html first - this is our specialized page for Replit webview
try {
  webviewHtml = fs.readFileSync(path.join(__dirname, 'webview.html'), 'utf8');
  log('Webview HTML file loaded successfully');
} catch (err) {
  log(`Error loading webview HTML file: ${err.message}`);
  // We'll set a fallback later if needed
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
        .container { max-width: 600px; margin: 0 auto; }
        h1 { color: #2563eb; }
        .loader { display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; 
                border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px 0; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
      <meta http-equiv="refresh" content="5">
    </head>
    <body>
      <div class="container">
        <h1>iREVA Platform</h1>
        <p>Connecting to application server...</p>
        <div class="loader"></div>
        <p>The main application is starting. This page will automatically refresh when ready.</p>
      </div>
    </body>
    </html>
  `;
}

// If webview HTML wasn't loaded, use homepage HTML as fallback
if (!webviewHtml) {
  webviewHtml = homepageHtml;
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
      .listen(port, '127.0.0.1');
  });
}

// Health check route
app.get('/health', (req, res) => {
  res.send({ 
    status: 'ok', 
    service: 'iREVA Proxy Server',
    port: PORT,
    target: MAIN_APP_PORT,
    timestamp: new Date().toISOString() 
  });
});

// Special routes for Replit webview
app.get('/__repl', (req, res) => {
  res.send('iREVA Platform - Proxy Server is running.');
});

app.get('/__replbuild', (req, res) => {
  res.send('Replit build check passed.');
});

// Main app availability check
app.get('/check-main-app', async (req, res) => {
  try {
    // Check if main app port is in use (negated because isPortInUse returns true if NOT available)
    const isMainAppAvailable = await isPortInUse(MAIN_APP_PORT);
    // Get port 5000 status too
    const isDirectServerAvailable = await isPortInUse(DIRECT_SERVER_PORT);
    
    res.json({ 
      mainApp: { port: MAIN_APP_PORT, available: isMainAppAvailable },
      directServer: { port: DIRECT_SERVER_PORT, available: isDirectServerAvailable },
      proxy: { port: PORT, available: true },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({ 
      error: err.message, 
      mainApp: { port: MAIN_APP_PORT, available: false },
      directServer: { port: DIRECT_SERVER_PORT, available: false }, 
      timestamp: new Date().toISOString() 
    });
  }
});

// Special route for Replit webview root access
app.get('/', (req, res, next) => {
  const host = req.headers.host || '';
  
  // Check if this is likely a Replit webview request
  if (host.includes('replit') || host.includes('repl.co')) {
    log(`Detected probable Replit webview request from: ${host}`);
    
    // Directly serve our specialized webview HTML file
    return res.send(webviewHtml);
  }
  
  // Not a Replit webview request, continue to the proxy middleware
  next();
});

// Add special route to handle Replit webview before the proxy middleware
app.get('/webview-helper', (req, res) => {
  const host = req.headers.host || '';
  log(`Webview helper request from: ${host}`);
  
  // Generate proper URLs based on the hostname
  let mainUrl, directUrl, proxyUrl;
  
  if (host.includes('replit') || host.includes('repl.co')) {
    // For Replit domains, we need special formatting
    const parts = host.split('.');
    const domainSuffix = parts.slice(1).join('.');
    let replPrefix = parts[0];
    
    // Check if the hostname already has a port prefix
    if (replPrefix.includes('-')) {
      // Extract just the repl ID part
      replPrefix = replPrefix.split('-')[0];
    }
    
    mainUrl = `https://${replPrefix}-${MAIN_APP_PORT}.${domainSuffix}/`;
    directUrl = `https://${replPrefix}-${PORT}.${domainSuffix}/`;
    proxyUrl = `https://${replPrefix}-3000.${domainSuffix}/`;
  } else {
    // For local/standard domains
    mainUrl = `http://${host.split(':')[0]}:${MAIN_APP_PORT}/`;
    directUrl = `http://${host.split(':')[0]}:${PORT}/`;
    proxyUrl = `http://${host.split(':')[0]}:3000/`;
  }
  
  // Send back the URLs
  res.json({
    mainUrl,
    directUrl,
    proxyUrl,
    detected: {
      host,
      isReplit: host.includes('replit') || host.includes('repl.co')
    }
  });
});

// Route to directly forward to the main application
app.get('/goto-main-app', (req, res) => {
  // This special HTML renders and then redirects to the main app using client-side JS
  // which is more reliable than server-side redirects in Replit's environment
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>iREVA Platform - Redirecting</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        h1 { color: #2563eb; }
        .loader { display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; 
                 border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px 0; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>iREVA Platform</h1>
        <p>Redirecting to main application...</p>
        <div class="loader"></div>
        <p id="message">Calculating the best connection path...</p>
      </div>
      <script>
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        function log(msg) {
          console.log(msg);
          document.getElementById('message').textContent = msg;
        }
        
        // Generate appropriate URL for Replit domains
        function getMainAppUrl() {
          if (hostname.includes('replit') || hostname.includes('repl.co')) {
            const parts = hostname.split('.');
            const domainSuffix = parts.slice(1).join('.');
            let replPrefix = parts[0];
            
            if (replPrefix.includes('-')) {
              replPrefix = replPrefix.split('-')[0];
            }
            
            const url = \`\${protocol}//\${replPrefix}-5001.\${domainSuffix}/\`;
            log('Generated URL: ' + url);
            return url;
          }
          
          return \`\${protocol}//\${hostname.split(':')[0]}:5001/\`;
        }
        
        // Redirect after a short delay
        setTimeout(() => {
          const url = getMainAppUrl();
          log('Redirecting to: ' + url);
          window.location.href = url;
        }, 1500);
      </script>
    </body>
    </html>
  `);
});

// Set up proxy to main application
app.use('/', createProxyMiddleware({
  target: `http://localhost:${MAIN_APP_PORT}`,
  changeOrigin: true,
  ws: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/(.*)': '/$1', // rewrite path if needed
  },
  // Fix for Replit webview proxy error - use a simplified approach
  router: function(req) {
    // Log hostname and requested URL for debugging
    const host = req.headers.host || '';
    log(`Incoming request from: ${host} for ${req.url}`);
    
    // Always use localhost for the proxy target to avoid DNS issues
    return `http://localhost:${MAIN_APP_PORT}`;
  },
  // Add CORS headers for Replit webview
  onProxyRes: (proxyRes, req, res) => {
    // Set CORS headers for browser access
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
    
    // Log successful proxy
    log(`Successfully proxied: ${req.method} ${req.url} to port ${MAIN_APP_PORT}`);
  },
  onProxyReq: (proxyReq, req) => {
    // Modify request headers if needed
    proxyReq.setHeader('X-Proxied-By', 'iREVA-Proxy');
    log(`Proxying ${req.method} ${req.url} to port ${MAIN_APP_PORT}`);
  },
  onError: (err, req, res) => {
    log(`Proxy error: ${err.message} for ${req.url}`);
    
    // For specific Replit errors, try direct redirect instead
    if (err.message.includes('Error occurred while trying to proxy')) {
      log('Detected Replit proxy error, using client-side redirect');
      return res.redirect('/goto-main-app');
    }
    
    // Serve the loading page when the main app is not available
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(homepageHtml);
  }
}));

// Start server
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  log(`STARTING iREVA PROXY SERVER ON PORT ${PORT}`);
  log(`FORWARDING REQUESTS TO PORT ${MAIN_APP_PORT}`);
  log(`SERVER READY: http://localhost:${PORT}`);
});

// Handle errors
server.on('error', (err) => {
  log(`SERVER ERROR: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    log(`PORT ${PORT} IS ALREADY IN USE`);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  log('SHUTTING DOWN SERVER...');
  server.close(() => {
    log('SERVER CLOSED');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  log('TERMINATING SERVER...');
  server.close(() => {
    log('SERVER TERMINATED');
    process.exit(0);
  });
});