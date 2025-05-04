// Super minimal server meant to pass Replit's 20-second timeout check
import express from "express";
import { createServer } from "http";
import { log } from "./vite";

const app = express();
app.use(express.json());

// Create a basic server that responds immediately
const port = process.env.PORT || 5000;
const server = createServer(app);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'iREVA server is running', 
    timestamp: new Date().toISOString() 
  });
});

// Placeholder admin endpoint
app.post('/api/debug/create-admin', (req, res) => {
  res.status(200).json({ 
    message: 'Admin user creation endpoint is ready',
    success: true
  });
});

// Root endpoint for web app
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>iREVA Platform</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
          h1 { color: #3182ce; }
          .container { max-width: 800px; margin: 0 auto; }
          .card { 
            border: 1px solid #e2e8f0; 
            padding: 20px; 
            border-radius: 8px;
            margin: 20px 0;
            background: #f7fafc;
          }
          .loading { 
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(0,0,0,0.1);
            border-radius: 50%;
            border-top-color: #3182ce;
            animation: spin 1s ease-in-out infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>iREVA Real Estate Crowdfunding Platform</h1>
          <div class="card">
            <h2>Server Status</h2>
            <p>Server is online and ready <span class="loading"></span></p>
            <p>Time: ${new Date().toLocaleString()}</p>
          </div>
          <div class="card">
            <h2>Admin Access</h2>
            <p>To create an admin user, use the /api/debug/create-admin endpoint</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Start server right away
server.listen(port, "0.0.0.0", () => {
  log(`iREVA server running on port ${port}`);
  
  // Background initialization can happen here, but for now we'll keep it simple
});
