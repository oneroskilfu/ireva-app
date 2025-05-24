/**
 * Ultra-minimal server for Replit that binds to port 3000 immediately,
 * then starts the main application with staged loading.
 */

const net = require('net');
const { spawn } = require('child_process');

console.log('[STARTUP] Binding to port 3000 immediately...');

// Create a simple TCP server 
const server = net.createServer(socket => {
  socket.end('HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n' +
    '<html><body style="font-family: system-ui; padding: 2rem; max-width: 800px; margin: 0 auto;">' +
    '<h1>Starting Real Estate Investment Platform</h1>' +
    '<p>The application is initializing, please wait...</p>' +
    '<script>setTimeout(() => location.reload(), 5000);</script>' +
    '</body></html>');
});

// Bind to port 3000 and start main application after binding succeeds
server.listen(3000, '0.0.0.0', () => {
  console.log('[STARTUP] TCP server running on port 3000');
  
  // Start the main application directly
  console.log('[STARTUP] Starting main application with staged loading...');
  
  // Set environment variables for staged loading
  process.env.NODE_ENV = 'development';
  process.env.STAGED_LOADING = 'true';
  
  // Start the main application
  const mainApp = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=512'
    }
  });
  
  mainApp.on('error', (err) => {
    console.error('[ERROR] Failed to start main application:', err);
  });
});

// Handle errors
server.on('error', (err) => {
  console.error('[ERROR] Server error:', err);
});