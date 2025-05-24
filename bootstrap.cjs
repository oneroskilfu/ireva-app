// bootstrap.cjs (CommonJS version)
const http = require('http');

// Start a minimal server immediately to satisfy Replit's timeout
const warmupServer = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bootstrapping iREVA...');
});

warmupServer.listen(5000, () => {
  console.log('[iREVA] Warmup server started on port 5000');

  // After short delay, replace with full Express server
  setTimeout(() => {
    warmupServer.close(() => {
      console.log('[iREVA] Replacing warmup server with full backend');
      require('./server.cjs'); // Start full Express app
    });
  }, 1000); // 1-second delay before starting full app
});