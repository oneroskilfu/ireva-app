// Ultra-minimal startup script
const http = require('http');
const { exec } = require('child_process');

// Create minimal HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>iREVA Platform</title>
        <style>
          body { font-family: system-ui; margin: 0; padding: 20px; text-align: center; }
          .container { max-width: 600px; margin: 0 auto; }
          h1 { color: #2563eb; }
          .btn { background: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>iREVA Real Estate Investment Platform</h1>
          <p>Application is starting on port 3001...</p>
          <a href="http://localhost:3001" class="btn">Go to Application →</a>
        </div>
      </body>
    </html>
  `);
});

// Bind immediately to port 3000
server.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
  
  // Start main application on port 3001
  setTimeout(() => {
    exec('PORT=3001 NODE_ENV=development node --import tsx server/index.ts', (error) => {
      if (error) console.error('Error starting application:', error);
    });
  }, 500);
});