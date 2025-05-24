#!/usr/bin/env node

/**
 * Ultra-minimal script to handle Replit's port binding requirements
 * This script immediately binds to port 3000 with a static server
 */
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Static content
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>iREVA Authentication System</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }
          h1 { color: #2563eb; }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 2rem;
            margin: 2rem 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .btn {
            display: inline-block;
            background: #2563eb;
            color: white;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            margin-top: 1rem;
          }
          .btn:hover {
            background: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <h1>iREVA Real Estate Investment Platform</h1>
        
        <div class="card">
          <h2>Authentication System</h2>
          <p>This application provides a secure authentication system for:</p>
          <ul>
            <li><strong>Investors</strong> - Access investment opportunities and portfolio</li>
            <li><strong>Administrators</strong> - Manage platform and investment offerings</li>
            <li><strong>Super Admins</strong> - Configure system settings and user roles</li>
          </ul>
          <p>Role-based access control ensures each user only sees appropriate content.</p>
        </div>
        
        <div class="card">
          <h2>Implementation Details</h2>
          <p>The authentication system includes:</p>
          <ul>
            <li>JWT token-based authentication</li>
            <li>Secure password hashing with bcrypt</li>
            <li>Role-based routing protection</li>
            <li>Session management</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});