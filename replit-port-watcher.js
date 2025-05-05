/**
 * Replit Port Watcher
 * 
 * This script watches for port binding activity and verifies that
 * Replit's port detection mechanism can see our server. It logs detailed
 * information about the HTTP server and whether it can receive requests.
 */

const http = require('http');
const { exec } = require('child_process');

// Simple logger with timestamps
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  log(`>> Received request: ${req.method} ${req.url}`);
  
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'X-Replit-Port-Status': 'active'
  });
  
  res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>Replit Port Watcher</title>
  <style>
    body { font-family: sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: #333; }
    .info { background: #f5f5f5; padding: 20px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Replit Port Watcher</h1>
  <div class="info">
    <p>Server is running and has received your request.</p>
    <p>Request path: ${req.url}</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
  </div>
</body>
</html>
  `);
});

// Bind to port 5000
log('Starting HTTP server on port 5000...');
server.listen(5000, '0.0.0.0', () => {
  log('✅ Server bound to port 5000 successfully!');
  log('Server URL: http://localhost:5000');
  
  // Log multiple port binding messages in different formats
  console.log('PORT 5000 BOUND SUCCESSFULLY');
  console.log('Listening on port 5000');
  console.log('Server started on port 5000');
  console.log('PORT BINDING SUCCESSFUL');
  
  // Test if we can connect to ourselves
  setTimeout(testSelfConnection, 1000);
  
  // Check process listening on ports every 5 seconds
  setInterval(checkProcesses, 5000);
});

// Test if we can connect to our own server
function testSelfConnection() {
  log('Testing self connection to http://localhost:5000...');
  
  http.get('http://localhost:5000/self-test', (res) => {
    log(`Self-connection successful! Status: ${res.statusCode}`);
    
    // Collect response data
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      log(`Response received (${data.length} bytes)`);
    });
  }).on('error', (err) => {
    log(`❌ Self-connection error: ${err.message}`);
  });
}

// Check which processes are listening on ports
function checkProcesses() {
  exec('netstat -tulpn', (error, stdout, stderr) => {
    if (error) {
      log(`Error checking processes: ${error.message}`);
      return;
    }
    
    log('Checking for processes listening on ports:');
    
    // Parse the output to find port 5000
    const lines = stdout.split('\n');
    const port5000Line = lines.find(line => line.includes(':5000'));
    
    if (port5000Line) {
      log(`Found process on port 5000: ${port5000Line.trim()}`);
    } else {
      log('❌ No process found listening on port 5000!');
    }
  });
}

// Handle errors
server.on('error', (err) => {
  log(`❌ Server error: ${err.message}`);
  
  if (err.code === 'EADDRINUSE') {
    log('Port 5000 is already in use by another process.');
    
    // Check what's using the port
    exec('netstat -tulpn | grep 5000', (error, stdout, stderr) => {
      if (stdout) {
        log(`Process using port 5000: ${stdout.trim()}`);
      }
    });
  }
  
  process.exit(1);
});

// Handle process signals
process.on('SIGINT', () => {
  log('Received SIGINT, shutting down server...');
  server.close(() => {
    log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down server...');
  server.close(() => {
    log('Server closed.');
    process.exit(0);
  });
});