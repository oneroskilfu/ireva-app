// Ultra-minimal HTTP server
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('<html><body><h1>iREVA Server</h1><p>Starting application...</p></body></html>');
}).listen(3000, '0.0.0.0', () => {
  console.log('PORT 3000 BOUND');
});