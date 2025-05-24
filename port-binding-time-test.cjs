/**
 * Port Binding Time Test
 * 
 * This script is useful for diagnosing exactly how long it takes
 * to bind to port 5000, helping to identify if there are any
 * performance issues or delays in the binding process.
 */

const http = require('http');

// Record start time
const startTime = process.hrtime();
console.log(`Starting port binding test at ${new Date().toISOString()}`);

// Create minimal server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('OK');
});

// Attempt to bind to port 5000
console.log('Attempting to bind to port 5000...');
server.listen(5000, '0.0.0.0', () => {
  // Calculate elapsed time in milliseconds
  const elapsed = process.hrtime(startTime);
  const elapsedMs = (elapsed[0] * 1000) + (elapsed[1] / 1000000);
  
  console.log(`PORT 5000 SUCCESSFULLY BOUND in ${elapsedMs.toFixed(2)}ms`);
  console.log(`Binding completed at ${new Date().toISOString()}`);
  
  // Make the timing information very visible
  console.log('\n=======================================================');
  console.log(`  PORT BINDING TIME: ${elapsedMs.toFixed(2)}ms`);
  console.log('=======================================================\n');
  
  // Keep server running
  console.log('Server listening on port 5000. Press Ctrl+C to terminate.');
});

// Handle server errors
server.on('error', (err) => {
  // Calculate elapsed time in milliseconds
  const elapsed = process.hrtime(startTime);
  const elapsedMs = (elapsed[0] * 1000) + (elapsed[1] / 1000000);
  
  console.error(`ERROR binding to port 5000 after ${elapsedMs.toFixed(2)}ms: ${err.message}`);
  
  if (err.code === 'EADDRINUSE') {
    console.error('Port 5000 is already in use by another process.');
  }
  
  process.exit(1);
});