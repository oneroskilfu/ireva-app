/**
 * Replit Port Binding Test
 * 
 * This script tests if a server is actually binding to port 5000 and
 * properly responding to HTTP requests. It helps diagnose if the issue
 * is with the port binding itself or with Replit's detection mechanism.
 */

const http = require('http');

// Log with timestamps
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

log('Starting port binding test...');

// Function to make a request to localhost:5000
function makeRequest() {
  log('Attempting to connect to localhost:5000...');
  
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/test-port-binding',
    method: 'GET',
    timeout: 5000
  }, (res) => {
    log(`Server responded with status code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      log(`Response body: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
      log('Port binding test complete: PORT IS ACCESSIBLE');
    });
  });
  
  req.on('error', (err) => {
    log(`Error connecting to server: ${err.message}`);
    log('Port binding test failed: SERVER NOT ACCESSIBLE');
  });
  
  req.on('timeout', () => {
    log('Request timed out after 5 seconds');
    log('Port binding test failed: CONNECTION TIMEOUT');
    req.destroy();
  });
  
  req.end();
}

// Make a request immediately and then again after a short delay
makeRequest();

setTimeout(() => {
  log('Making second attempt...');
  makeRequest();
}, 5000);

setTimeout(() => {
  log('Making final attempt...');
  makeRequest();
}, 10000);