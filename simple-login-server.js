// Simple Express server for the login page
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'server/public')));

// Basic routes to serve HTML files
app.get(['/', '/login', '/auth'], (req, res) => {
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
  console.log(`Login server running on http://localhost:${PORT}`);
});