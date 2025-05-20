// Simple server for the login system
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'server/public')));
app.use(express.json());

// Basic routes
app.get(['/', '/login', '/auth'], (req, res) => {
  res.sendFile(path.join(__dirname, 'server/public/direct-login.html'));
});

// Dashboard routes
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/public/admin/dashboard.html'));
});

app.get('/investor/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/public/investor/dashboard.html'));
});

// Simple login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Basic authentication
  if (username === 'admin' && password === 'adminpassword') {
    return res.json({
      username: 'admin',
      role: 'admin',
      name: 'Admin User',
      email: 'admin@ireva.com'
    });
  } else if (username === 'testuser' && password === 'password') {
    return res.json({
      username: 'testuser',
      role: 'investor',
      name: 'Test Investor',
      email: 'investor@ireva.com'
    });
  }
  
  // Invalid credentials
  res.status(401).json({ error: 'Invalid credentials' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});