/**
 * Zero-overhead Replit startup script
 * This binds to port 3000 immediately with absolute minimal overhead
 */

console.log('ZERO-START: Binding port 3000 immediately...');

// Use HTTP server for better Replit compatibility
const http = require('http');
const { spawn } = require('child_process');

// Create simple HTTP server that responds with a loading page
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
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
  `);
});

// Bind to port 3000 immediately
server.listen(3000, '0.0.0.0', () => {
  console.log('ZERO-START: Successfully bound port 3000');
  
  // Start the main app process
  console.log('ZERO-START: Starting main application...');
  
  // Set environment variables for staged loading
  process.env.NODE_ENV = 'development';
  process.env.STAGED_LOADING = 'true';
  
  const app = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: process.env
  });
  
  app.on('error', (err) => {
    console.error('Failed to start main application:', err);
  });
  
  // Handle clean shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    app.kill();
    server.close();
    process.exit(0);
  });
});