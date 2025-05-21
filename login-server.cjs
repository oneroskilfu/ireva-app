// Ultra-minimal server for quick port binding on Replit
const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Set up constants
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'server/public');
const STARTUP_TIME = Date.now();

// Function to log with timestamp for performance tracking
function logWithTime(message) {
  const elapsed = Date.now() - STARTUP_TIME;
  console.log(`[${elapsed}ms] ${message}`);
}

// Create minimal HTTP server - binds to port almost instantly
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;
  
  // Track request timing
  logWithTime(`Request: ${req.method} ${pathname}`);
  
  // Handle API requests
  if (req.method === 'POST' && pathname === '/api/login') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        
        // Basic authentication
        if (username === 'admin' && password === 'adminpassword') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            username: 'admin',
            role: 'admin',
            name: 'Admin User',
            email: 'admin@ireva.com'
          }));
        } else if (username === 'testuser' && password === 'password') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            username: 'testuser',
            role: 'investor',
            name: 'Test Investor',
            email: 'investor@ireva.com'
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    return;
  }
  
  // Define routes and file mappings
  const routes = {
    '/': sendLoginPage,
    '/login': sendLoginPage,
    '/auth': sendLoginPage,
    '/admin/dashboard': sendFile.bind(null, 'admin/dashboard.html'),
    '/investor/dashboard': sendFile.bind(null, 'investor/dashboard.html')
  };
  
  // Check if the route is defined, otherwise try to serve a static file
  if (routes[pathname]) {
    routes[pathname](res);
  } else {
    // Try to serve as a static file
    sendStaticFile(pathname, res);
  }
});

// Helper function to send the login page
function sendLoginPage(res) {
  sendFile('direct-login.html', res);
}

// Helper function to send a file
function sendFile(filename, res) {
  const filePath = path.join(PUBLIC_DIR, filename);
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1><p>The page you requested does not exist.</p>');
      return;
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filePath);
    const contentType = getContentType(ext);
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

// Helper function to serve static files
function sendStaticFile(pathname, res) {
  // Remove leading slash
  const relativePath = pathname.startsWith('/') ? pathname.substring(1) : pathname;
  const filePath = path.join(PUBLIC_DIR, relativePath);
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1><p>The file you requested does not exist.</p>');
      return;
    }
    
    const ext = path.extname(filePath);
    const contentType = getContentType(ext);
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

// Helper function to determine content type
function getContentType(ext) {
  switch (ext) {
    case '.html': return 'text/html';
    case '.css': return 'text/css';
    case '.js': return 'text/javascript';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg': return 'image/jpg';
    case '.jpeg': return 'image/jpeg';
    case '.svg': return 'image/svg+xml';
    default: return 'text/plain';
  }
}

// Start server immediately with 0.0.0.0 binding for maximum compatibility
server.listen(PORT, '0.0.0.0', () => {
  logWithTime(`Ultra-fast server running on port ${PORT}`);
  
  // Load full server functionality after port binding is established
  // Use a minimal timeout to ensure port binding is registered by Replit
  setTimeout(() => {
    logWithTime('Starting full application server...');
    try {
      // Path is relative to where this script is run - use CJS version
      require('./server/bootstrap.cjs');
      logWithTime('Bootstrap process initiated successfully');
    } catch (err) {
      console.error('Error loading bootstrap module:', err);
      logWithTime('Running in minimal server mode only due to bootstrap error');
    }
  }, 100);
});