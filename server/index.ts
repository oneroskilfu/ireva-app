import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { initializeDb } from "./db";
import { initializeAuth } from "./auth";
import { setupVite } from "./vite";

const PORT = process.env.PORT || 5000;

// Create express app with essential middleware
const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);

// Bind port immediately for Replit detection
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 iREVA Server running on port ${PORT}`);
  
  try {
    // Initialize services
    initializeAuth(app);
    await initializeDb();
    registerRoutes(app);
    await setupVite(app, server);
    
    console.log('✅ iREVA Platform Ready - Nigerian Real Estate Investment Platform Online!');
  } catch (error) {
    console.error('Initialization error:', error);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});