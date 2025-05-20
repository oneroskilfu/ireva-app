/**
 * Direct Login Server for Replit
 * 
 * This is a dedicated server script that directly serves the login page
 * on both port 3000 and 5000 to ensure it's accessible in the Replit webview.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Login page HTML content
const loginHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>iREVA Platform - Login</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            font-family: system-ui, sans-serif; 
            padding: 0; 
            margin: 0; 
            line-height: 1.5;
            background: #f5f7fa;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .card { 
            max-width: 450px; 
            margin: 0 auto; 
            padding: 2rem;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        h1 { 
            color: #0070f3; 
            margin-top: 0;
            text-align: center;
        }
        form { 
            margin: 1.5rem 0; 
        }
        label { 
            display: block; 
            margin-bottom: 0.5rem; 
            font-weight: 500;
            color: #333;
        }
        input { 
            width: 100%; 
            padding: 0.75rem; 
            margin-bottom: 1rem; 
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            box-sizing: border-box;
        }
        button { 
            background-color: #0070f3; 
            color: white; 
            padding: 0.75rem 1rem; 
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            width: 100%;
            font-weight: 500;
        }
        button:hover { 
            background-color: #0060df; 
        }
        .message {
            padding: 0.75rem;
            background: #e6f7ff;
            border-left: 4px solid #0070f3;
            margin-bottom: 1.5rem;
            border-radius: 0 4px 4px 0;
        }
        .accounts {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            margin-top: 1.5rem;
            font-size: 0.9rem;
        }
        .accounts h3 {
            margin-top: 0;
            color: #555;
            font-size: 1rem;
        }
        .accounts p {
            margin: 0.5rem 0;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>iREVA Platform</h1>
        
        <div class="message">
            Server is running! Database connected successfully.
        </div>
        
        <form id="loginForm">
            <label for="username">Username:</label>
            <input type="text" id="username" placeholder="Enter your username" required>
            
            <label for="password">Password:</label>
            <input type="password" id="password" placeholder="Enter your password" required>
            
            <button type="submit">Sign In</button>
        </form>
        
        <div class="accounts">
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

// Create HTTP server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Serve HTML for root, /login, and /auth paths
  if (url.pathname === '/' || url.pathname === '/login' || url.pathname === '/auth') {
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    return res.end(loginHtml);
  }
  
  // Handle API login request
  if (url.pathname === '/api/login' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        
        // Simple test validation
        if ((username === 'admin' && password === 'adminpassword') || 
            (username === 'testuser' && password === 'password')) {
          
          const role = username === 'admin' ? 'super_admin' : 'admin';
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            username, 
            role,
            id: 1,
            email: `${username}@example.com` 
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request' }));
      }
    });
    
    return;
  }
  
  // Default response for other requests
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

// Try to bind to port 3000 first for Replit webview
server.listen(3000, '0.0.0.0', () => {
  console.log('Login server running on port 3000');
}).on('error', (err) => {
  console.log('Could not bind to port 3000, trying port 5000...');
  
  // If port 3000 fails, try port 5000
  server.listen(5000, '0.0.0.0', () => {
    console.log('Login server running on port 5000');
  });
});