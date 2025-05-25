import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { initializeDb } from "./db";
import { initializeAuth } from "./auth";
import { setupVite } from "./vite";

// Enhanced email system with fallback support - Production Ready

const PORT = parseInt(process.env.PORT || '5000', 10);

// Create express app with essential middleware
const app = express();
app.use(cors());
app.use(express.json());

// Essential health endpoints for service verification
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    platform: 'iREVA - Nigerian Real Estate Investment Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'iREVA Platform API',
    status: 'running',
    endpoints: ['/api/health', '/health']
  });
});

const server = createServer(app);

// Bind port immediately for Replit detection
server.listen(PORT, async () => {
  console.log(`🚀 iREVA Server running on port ${PORT}`);
  
  try {
    // Initialize services
    initializeAuth(app);
    await initializeDb();
    await registerRoutes(app);
    
    // In production, serve static files; in development, use Vite
    if (process.env.NODE_ENV === 'production') {
      const { serveStatic } = await import('./static-serve');
      serveStatic(app);
    } else {
      await setupVite(app, server);
    }
    
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