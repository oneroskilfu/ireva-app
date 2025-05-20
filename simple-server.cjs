/**
 * Simple Express server for Replit using CommonJS
 */
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'server/public')));

// Basic routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/public/direct-login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/public/direct-login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/public/admin/dashboard.html'));
});

app.get('/investor/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'server/public/investor/dashboard.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});