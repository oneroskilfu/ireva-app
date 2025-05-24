/**
 * Replit Port Detection Test
 * 
 * This script helps identify exactly how Replit detects port binding by
 * creating multiple servers with different characteristics to see which
 * one(s) Replit can detect.
 * 
 * Run with: node replit-port-detection-test.js
 */

// CommonJS format for maximum compatibility
const http = require('http');
const net = require('net');

// Log with timestamps
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

log('REPLIT PORT DETECTION TEST: Starting multiple server types...');

// ==========================================
// 1. Create a minimal TCP server on port 5001
// ==========================================
const tcpServer = net.createServer();
tcpServer.listen(5001, '0.0.0.0', () => {
  log('TCP server bound to port 5001');
  log('TCP READY ON PORT 5001');
});

tcpServer.on('error', (err) => {
  log(`TCP server error: ${err.message}`);
});

// ==========================================
// 2. Create a basic HTTP server on port 5000
// ==========================================
const httpServer = http.createServer((req, res) => {
  log(`HTTP server received request: ${req.method} ${req.url}`);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Basic HTTP server is running\n');
});

httpServer.listen(5000, '0.0.0.0', () => {
  log('HTTP server bound to port 5000');
  log('HTTP READY ON PORT 5000');
  console.log('Server started on port 5000'); // Standard format
  console.log('Listening on port 5000'); // Alternative format
});

httpServer.on('error', (err) => {
  log(`HTTP server error: ${err.message}`);
});

// ==========================================
// 3. Create an HTTP server with special headers on port 5002
// ==========================================
const httpHeadersServer = http.createServer((req, res) => {
  log(`Headers server received request: ${req.method} ${req.url}`);
  
  // Add a variety of headers that Replit might be checking
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'X-Powered-By': 'Node.js',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'X-Replit-Ready': 'true'
  });
  
  res.end('<!DOCTYPE html><html><body><h1>Server with special headers is running</h1></body></html>');
});

httpHeadersServer.listen(5002, '0.0.0.0', () => {
  log('HTTP server with special headers bound to port 5002');
  log('HEADERS SERVER READY ON PORT 5002');
});

httpHeadersServer.on('error', (err) => {
  log(`Headers server error: ${err.message}`);
});

// ==========================================
// Summary and self-test section
// ==========================================
setTimeout(() => {
  log('REPLIT PORT DETECTION TEST: All servers started');
  log('REPLIT PORT DETECTION TEST: Summary of servers:');
  log('  - TCP server on port 5001 (raw TCP)');
  log('  - HTTP server on port 5000 (plain text response)');
  log('  - HTTP server on port 5002 (HTML with special headers)');
  
  log('REPLIT PORT DETECTION TEST: Testing self-connection to HTTP servers...');
  
  // Test connectivity to our own servers
  testHttpConnection('localhost', 5000, '/test');
  testHttpConnection('localhost', 5002, '/test');
  
  log('REPLIT PORT DETECTION TEST: Watch the Replit workflow to see which servers are detected');
}, 2000);

// Helper function to test HTTP connectivity
function testHttpConnection(host, port, path) {
  const req = http.request({
    hostname: host,
    port: port,
    path: path,
    method: 'GET',
    timeout: 3000
  }, (res) => {
    log(`Self-test to ${host}:${port} got response: HTTP ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      log(`Response body length: ${data.length} bytes`);
    });
  });
  
  req.on('error', (err) => {
    log(`Self-test error to ${host}:${port}: ${err.message}`);
  });
  
  req.end();
}