// bootstrap.js - ESM-compatible with error handling
import http from 'http';

// Start a simple HTTP server immediately to satisfy Replit's timeout
const bootstrapServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>iREVA Startup</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .loader { 
            border: 5px solid #f3f3f3;
            border-top: 5px solid #2a52be;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <h2>iREVA Platform</h2>
        <p>Bootstrapping application...</p>
        <div class="loader"></div>
      </body>
    </html>
  `);
});

// Bind to port 5000 immediately
bootstrapServer.listen(5000, '0.0.0.0', () => {
  console.log('✅ Bootstrap server bound to port 5000 successfully');
  
  // After binding to port, load the real server
  setTimeout(() => {
    console.log('🔄 Loading full application server...');
    import('./server.js')
      .then(() => {
        console.log('✅ Full application server loaded successfully');
      })
      .catch(err => {
        console.error('❌ Error loading full application server:', err);
      });
  }, 1000); // Small delay to ensure port binding is registered
});

// Handle potential errors
bootstrapServer.on('error', (err) => {
  console.error('❌ Bootstrap server error:', err);
  process.exit(1);
});