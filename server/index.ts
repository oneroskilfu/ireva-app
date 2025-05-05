import express from "express";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { db } from "./db";

// Create Express application
const app = express();

// Register routes and get HTTP server
const server = registerRoutes(app);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  
  // Close the server
  server.close(() => {
    console.log('Server closed');
    
    // Close database connection
    db.client.release();
    
    process.exit(0);
  });
});