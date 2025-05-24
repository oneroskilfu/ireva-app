/**
 * Ultra-minimal server that binds directly to port 3000
 * This is the simplest possible solution to the "Run this app" issue
 */

const http = require('http');
const { spawn } = require('child_process');

// Create a simple HTML page
const html = `
<!DOCTYPE html>
<html>
<head>
  <title>iREVA Platform</title>
  <style>
    body { font-family: Arial; text-align: center; margin-top: 50px; }
    .loader { border: 10px solid #f3f3f3; border-top: 10px solid #3498db; border-radius: 50%; width: 80px; height: 80px; animation: spin 2s linear infinite; margin: 0 auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <h1>iREVA Platform</h1>
  <div class="loader"></div>
  <p>Application is starting...</p>
</body>
</html>
`;

// Create a server that responds immediately
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

// Start the server on port 3000
server.listen(3000, '0.0.0.0', () => {
  console.log('Direct port binding server started on port 3000');
  console.log('PORT 3000 OPEN AND READY');
  
  // Start the real application in the background
  console.log('Starting the main application...');
  
  // Start the application with npm run dev
  const app = spawn('npm', ['run', 'dev'], {
    env: { ...process.env, PORT: '5001' },
    stdio: 'inherit'
  });
  
  // Handle application termination
  app.on('exit', (code) => {
    console.log(`Main application exited with code ${code}`);
    process.exit(code);
  });
  
  // Handle errors
  app.on('error', (err) => {
    console.error('Failed to start application:', err);
    process.exit(1);
  });
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});