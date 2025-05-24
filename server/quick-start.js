// Ultra-lightweight HTTP server for immediate port binding
const http = require('http');

// Create a minimal server that responds immediately
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <head>
        <title>iREVA - Authentication System</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
            color: #333;
          }
          .container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          h1 {
            color: #2563eb;
            margin-bottom: 1rem;
          }
          p {
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }
          .loader {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #2563eb;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>iREVA Authentication System</h1>
          <p>The application server is starting...</p>
          <div class="loader"></div>
          <p>This page will automatically redirect to the main application when ready.</p>
        </div>
        <script>
          // Auto-refresh after 5 seconds to check if the main app is ready
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        </script>
      </body>
    </html>
  `);
});

// Start listening on port 3000
server.listen(3000, '0.0.0.0', () => {
  console.log('Quick-start server running on port 3000');
  
  // Start the actual application
  const { spawn } = require('child_process');
  const mainApp = spawn('node', ['--import', 'tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: {...process.env, PORT: '3001'}
  });
  
  mainApp.on('exit', (code) => {
    console.log(`Main application exited with code ${code}`);
    process.exit(code);
  });
});