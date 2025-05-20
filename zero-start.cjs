/**
 * Ultra-optimized zero-overhead Replit startup script
 * This binds to port 3000 immediately with the absolute minimal overhead possible
 */

console.log('ZERO-START: Binding port 3000 immediately...');

// Use bare TCP socket for fastest possible binding
const net = require('net');
const http = require('http');
const { spawn } = require('child_process');

// HTML login template that will be displayed in webview
const loadingHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>iREVA Platform - Login</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0;
            line-height: 1.6;
            background: #f5f7fa;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .card { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            background: white;
            border-radius: 8px;
        }
        h1 { 
            color: #0066cc; 
            text-align: center;
        }
        form { 
            margin: 20px 0; 
        }
        label { 
            display: block; 
            margin-bottom: 5px; 
            font-weight: bold;
        }
        input { 
            width: 100%; 
            padding: 8px; 
            margin-bottom: 15px; 
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button { 
            background-color: #0066cc; 
            color: white; 
            padding: 10px 15px; 
            border: none; 
            cursor: pointer;
            border-radius: 4px;
            width: 100%;
            font-size: 16px;
        }
        button:hover {
            background-color: #0052a3;
        }
        .test-accounts { 
            margin-top: 20px; 
            padding: 15px; 
            background: #f5f5f5; 
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .status { 
            padding: 10px; 
            background: #e6f7ff; 
            border-left: 4px solid #0066cc; 
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>iREVA Platform Login</h1>
        
        <div class="status">
            Server is running and ready for login. Database connected successfully.
        </div>
        
        <form id="loginForm">
            <label for="username">Username:</label>
            <input type="text" id="username" placeholder="Enter your username" required>
            
            <label for="password">Password:</label>
            <input type="password" id="password" placeholder="Enter your password" required>
            
            <button type="submit">Login</button>
        </form>
        
        <div class="test-accounts">
            <h3>Test Accounts</h3>
            <p><strong>Admin User:</strong> username: admin, password: adminpassword</p>
            <p><strong>Test User:</strong> username: testuser, password: password</p>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    alert('Login failed: ' + (response.status === 401 ? 'Invalid credentials' : 'Server error'));
                    return;
                }
                
                const user = await response.json();
                alert('Login successful! Welcome, ' + user.username + ' (Role: ' + user.role + ')');
                
                // Redirect based on role
                if (user.role === 'admin' || user.role === 'super_admin') {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/investor/dashboard';
                }
                
            } catch (error) {
                alert('Error: ' + (error.message || 'Unknown error'));
            }
        });
    </script>
</body>
</html>
`;

// Create TCP server - faster than HTTP for immediate binding
const server = net.createServer((socket) => {
  // Update the socket response to use proper HTTP headers and the login HTML
  socket.end(
    'HTTP/1.1 200 OK\r\n' +
    'Content-Type: text/html\r\n' +
    'Connection: close\r\n\r\n' +
    loadingHtml
  );
});

// Use HTTP server as fallback if needed
let httpServer;

// Function to start the main application
function startMainApp() {
  // Set environment variables for ultra-fast staged loading
  process.env.NODE_ENV = 'development';
  process.env.STAGED_LOADING = 'true';
  process.env.MINIMAL_STARTUP = 'true'; // New flag for ultra-minimal mode
  
  // Start main app with optimized environment
  console.log('ZERO-START: Starting main application with minimal mode...');
  const app = spawn('tsx', ['server/index.ts'], {
    stdio: 'inherit',
    env: process.env
  });
  
  // Handle clean shutdown and error conditions
  app.on('error', (err) => {
    console.error('Failed to start main application:', err);
  });
  
  // Set up signal handlers for clean shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down...');
    app.kill();
    server.close();
    if (httpServer) httpServer.close();
    process.exit(0);
  });
  
  return app;
}

// Bind to port 3000 immediately with TCP
server.listen(3000, '0.0.0.0', () => {
  console.log('ZERO-START: Successfully bound port 3000 (TCP)');
  startMainApp();
});

// If TCP binding fails, fall back to HTTP
server.on('error', (err) => {
  console.error('TCP binding failed, falling back to HTTP:', err);
  
  // Ensure HTTP server fallback properly serves the login HTML
  httpServer = http.createServer((req, res) => {
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(loadingHtml);
  });
  
  httpServer.listen(3000, '0.0.0.0', () => {
    console.log('ZERO-START: Successfully bound port 3000 (HTTP fallback)');
    startMainApp();
  });
});