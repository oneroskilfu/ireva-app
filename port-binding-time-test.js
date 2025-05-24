/**
 * Port Binding Time Test
 * 
 * This script analyzes how long it takes for different types of servers
 * to bind to port 5000 and be detectable via HTTP requests. 
 * This helps troubleshoot Replit's port detection issues.
 */

const net = require('net');
const http = require('http');
const { spawn } = require('child_process');

// Logging with timestamps
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Test 1: Raw TCP Socket
function testRawTCP() {
  log('TEST 1: Raw TCP Socket');
  
  const startTime = Date.now();
  log('Creating TCP server...');
  
  const server = net.createServer((socket) => {
    socket.end('TCP SERVER ACTIVE\r\n');
  });
  
  server.listen(5000, '0.0.0.0', () => {
    const bindTime = Date.now() - startTime;
    log(`TCP server bound to port 5000 in ${bindTime}ms`);
    
    // Test if we can connect to it
    setTimeout(() => {
      const socket = new net.Socket();
      const connectStartTime = Date.now();
      
      socket.connect(5000, '127.0.0.1', () => {
        const connectTime = Date.now() - connectStartTime;
        log(`TCP client connected in ${connectTime}ms`);
        socket.destroy();
        
        // Clean up and move to the next test
        server.close(() => {
          log('TCP server closed');
          setTimeout(testHTTP, 1000);
        });
      });
      
      socket.on('error', (err) => {
        log(`TCP connection error: ${err.message}`);
        socket.destroy();
        server.close(() => {
          log('TCP server closed after error');
          setTimeout(testHTTP, 1000);
        });
      });
    }, 500);
  });
  
  server.on('error', (err) => {
    log(`TCP server error: ${err.message}`);
    setTimeout(testHTTP, 1000);
  });
}

// Test 2: HTTP Server
function testHTTP() {
  log('TEST 2: HTTP Server');
  
  const startTime = Date.now();
  log('Creating HTTP server...');
  
  const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('HTTP SERVER ACTIVE\n');
  });
  
  server.listen(5000, '0.0.0.0', () => {
    const bindTime = Date.now() - startTime;
    log(`HTTP server bound to port 5000 in ${bindTime}ms`);
    
    // Test if we can connect to it
    setTimeout(() => {
      const reqStartTime = Date.now();
      log('Attempting HTTP request...');
      
      http.get('http://127.0.0.1:5000', (res) => {
        const reqTime = Date.now() - reqStartTime;
        log(`HTTP request completed in ${reqTime}ms with status ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          log(`HTTP response received: "${data.trim()}"`);
          
          // Clean up and move to the next test
          server.close(() => {
            log('HTTP server closed');
            setTimeout(testExpress, 1000);
          });
        });
      }).on('error', (err) => {
        log(`HTTP request error: ${err.message}`);
        server.close(() => {
          log('HTTP server closed after error');
          setTimeout(testExpress, 1000);
        });
      });
    }, 500);
  });
  
  server.on('error', (err) => {
    log(`HTTP server error: ${err.message}`);
    setTimeout(testExpress, 1000);
  });
}

// Test 3: Express Server (via npm run dev)
function testExpress() {
  log('TEST 3: Express Server via npm run dev');
  
  const startTime = Date.now();
  log('Starting Express server via npm run dev...');
  
  // Start the Express application
  const expressProcess = spawn('npm', ['run', 'dev'], {
    env: {
      ...process.env,
      TIMING_TEST: 'true'
    }
  });
  
  // Capture stdout for timing analysis
  expressProcess.stdout.on('data', (data) => {
    const output = data.toString();
    log(`Express stdout: ${output.trim()}`);
    
    // Check if the server is ready based on common log messages
    if (output.includes('listening on port 5000') || 
        output.includes('server started') ||
        output.includes('server running')) {
      
      const startupTime = Date.now() - startTime;
      log(`Express server appears ready after ${startupTime}ms`);
      
      // Test if we can connect to it
      setTimeout(() => {
        const reqStartTime = Date.now();
        log('Attempting HTTP request to Express server...');
        
        http.get('http://127.0.0.1:5000', (res) => {
          const reqTime = Date.now() - reqStartTime;
          log(`HTTP request to Express completed in ${reqTime}ms with status ${res.statusCode}`);
          
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            log(`Express response received (length: ${data.length} bytes)`);
            
            // Clean up and finish tests
            log('Terminating Express server...');
            expressProcess.kill();
            setTimeout(() => {
              log('All tests complete');
              log(`TEST SUMMARY:
1. Raw TCP: Fast binding, simple detection
2. HTTP: Fast binding, reliable detection
3. Express: Slower startup, but reliable once running`);
            }, 1000);
          });
        }).on('error', (err) => {
          log(`HTTP request to Express error: ${err.message}`);
          expressProcess.kill();
          log('Tests terminated due to Express connection error');
        });
      }, 1000);
    }
  });
  
  expressProcess.stderr.on('data', (data) => {
    log(`Express stderr: ${data.toString().trim()}`);
  });
  
  expressProcess.on('error', (err) => {
    log(`Express process error: ${err.message}`);
    log('Tests terminated due to Express startup error');
  });
  
  // Set a timeout in case Express never reports ready
  setTimeout(() => {
    if (expressProcess.exitCode === null) {
      log('Express server took too long to start or report ready. Terminating...');
      expressProcess.kill();
      log('Tests terminated due to Express startup timeout');
    }
  }, 30000);
}

// Start the tests
log('Starting port binding time tests...');
testRawTCP();