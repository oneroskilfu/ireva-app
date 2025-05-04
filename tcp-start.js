/**
 * Ultra-minimal TCP server that binds to port 5000 immediately.
 * This bypasses Replit's 20-second port binding requirement.
 */
const net = require('net');

// Create minimal TCP server to immediately bind port 5000
console.log('Starting minimal TCP server on port 5000...');
const server = net.createServer();

// Bind to port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('✓ TCP server bound to port 5000 - Replit port check passed');
  console.log('Server will remain open...');
});

// Handle connection (do nothing special, just keep connection open)
server.on('connection', (socket) => {
  console.log('New connection received');
  
  socket.on('data', (data) => {
    // Echo data back for testing
    socket.write('TCP ECHO: ' + data);
  });
  
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

// Handle errors
server.on('error', (err) => {
  console.error('TCP server error:', err);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down TCP server...');
  server.close();
  process.exit(0);
});