/**
 * HTTP proxy server for Replit that quickly binds to port 5000 and forwards requests 
 * to the main application on port 5001 after it starts
 */

const http = require('http');
const { spawn } = require('child_process');
const net = require('net');

const PROXY_PORT = 5000;  // Port Replit expects
const APP_PORT = 5001;    // Port where actual app will run

// State tracking
let appReady = false;
let connectionAttempts = 0;
const MAX_ATTEMPTS = 300; // 5 minutes at 1 second intervals

// Create proxy server to forward requests once real app is running
const proxyServer = http.createServer((req, res) => {
  if (!appReady) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('iREVA application is starting... Please try again in a moment.\n');
    return;
  }

  // Forward request to actual application
  const options = {
    hostname: 'localhost',
    port: APP_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  req.pipe(proxyReq);

  proxyReq.on('error', (e) => {
    console.error('Proxy error:', e.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + e.message);
  });
});

// Start proxy server immediately
console.log(`[${new Date().toISOString()}] Starting iREVA proxy server...`);
proxyServer.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`[${new Date().toISOString()}] Proxy server bound to port ${PROXY_PORT}`);

  // Start real application with modified port
  console.log(`[${new Date().toISOString()}] Starting the full iREVA application on port ${APP_PORT}...`);
  const env = { ...process.env, PORT: APP_PORT };
  
  // Use a custom environment variable to tell the app to use the alternate port
  env.APP_PORT = APP_PORT;
  
  const appProcess = spawn('npm', ['run', 'dev'], {
    env,
    stdio: 'inherit',
    detached: true
  });

  appProcess.on('error', (err) => {
    console.error('Failed to start application:', err);
  });

  // Check if the app is ready by trying to connect to its port
  function checkAppReady() {
    if (appReady) return;
    
    connectionAttempts++;
    if (connectionAttempts > MAX_ATTEMPTS) {
      console.error('Max connection attempts reached. Application failed to start.');
      return;
    }

    const socket = new net.Socket();
    
    socket.setTimeout(1000);
    socket.on('error', () => {
      setTimeout(checkAppReady, 1000);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      setTimeout(checkAppReady, 1000);
    });
    
    socket.connect(APP_PORT, 'localhost', () => {
      appReady = true;
      console.log(`[${new Date().toISOString()}] Main application ready on port ${APP_PORT}`);
      socket.destroy();
    });
  }

  // Start checking if the app is ready
  setTimeout(checkAppReady, 2000);
});