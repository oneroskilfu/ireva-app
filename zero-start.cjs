/**
 * Ultra-optimized zero-overhead Replit startup script
 * This binds to port 3000 immediately with the absolute minimal overhead possible
 */

console.log('ZERO-START: Binding port 3000 immediately...');

// Use bare TCP socket for fastest possible binding
const net = require('net');
const http = require('http');
const { spawn } = require('child_process');

// Create TCP server - faster than HTTP for immediate binding
const server = net.createServer((socket) => {
  // Simple TCP response for any connections
  socket.end('HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nServer starting...');
});

// Use HTTP server as fallback if needed
let httpServer;

// HTML loading template for HTTP fallback
const loadingHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Real Estate Investment Platform</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.5; }
        h1 { color: #0070f3; }
        .progress { width: 100%; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; margin: 1rem 0; }
        .progress-bar { height: 100%; width: 0; background: #0070f3; animation: progress 5s ease-in-out; }
        @keyframes progress { to { width: 100%; } }
      </style>
    </head>
    <body>
      <h1>Real Estate Investment Platform</h1>
      <p>The application is starting up, please wait...</p>
      <div class="progress"><div class="progress-bar"></div></div>
      <p>This page will automatically reload when the application is ready.</p>
      <script>setTimeout(() => location.reload(), 5000);</script>
    </body>
  </html>
`;

// Function to start the main application
function startMainApp() {
  // Set environment variables for ultra-fast staged loading
  process.env.NODE_ENV = 'development';
  process.env.STAGED_LOADING = 'true';
  process.env.MINIMAL_STARTUP = 'true'; // New flag for ultra-minimal mode
  
  // Start main app with optimized environment
  console.log('ZERO-START: Starting main application with minimal mode...');
  const app = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: process.env
  });
  
  // Handle clean shutdown and error conditions
  app.on('error', (err) => {
    console.error('Failed to start main application:', err);
  });
  
  // Set up signal handlers for clean shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    app.kill();
    server.close();
    if (httpServer) httpServer.close();
    process.exit(0);
  });
  
  return app;
}

// Bind to port 3000 immediately with TCP
server.listen(3000, '0.0.0.0', () => {
  console.log('ZERO-START: Successfully bound port 3000 (TCP)');
  startMainApp();
});

// If TCP binding fails, fall back to HTTP
server.on('error', (err) => {
  console.error('TCP binding failed, falling back to HTTP:', err);
  
  httpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(loadingHtml);
  });
  
  httpServer.listen(3000, '0.0.0.0', () => {
    console.log('ZERO-START: Successfully bound port 3000 (HTTP fallback)');
    startMainApp();
  });
});