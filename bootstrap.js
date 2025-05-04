// bootstrap.js
const http = require('http');

// Temporary minimal server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bootstrapping iREVA app...');
});

// Start on port 5000
server.listen(5000, () => {
  console.log('Minimal server started on port 5000 for warm-up');

  // Delay then load full app
  setTimeout(() => {
    server.close(() => {
      console.log('Switching to full iREVA app');
      require('./server'); // Now load your full Express app
    });
  }, 1000); // 1-second delay before starting full app
});