import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import express from "express";
import cors from "cors";
import { storage } from "./storage";
import { db } from "./db";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Register essential routes that don't depend on database/authentication
 * This can be called early in the startup process
 */
export function registerEssentialRoutes(app: Express) {
  // API routes that don't need auth or database
  app.get('/api/health', (req, res) => {
    const dbStatus = 'db' in db ? 'initialized' : 'pending';
    res.status(200).json({ 
      status: 'ok', 
      message: 'Server is running',
      dbStatus,
      timestamp: new Date().toISOString()
    });
  });
  
  // Serve static files from public directory with caching disabled
  app.use(express.static(path.join(__dirname, 'public'), {
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
  }));
  
  // Serve the login.html file directly at multiple paths for maximum compatibility
  const serveLoginPage = (req: any, res: any) => {
    res.sendFile(path.join(__dirname, 'public/login.html'), {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  };
  
  // Register multiple routes to ensure login page is accessible
  app.get('/', serveLoginPage);
  app.get('/login', serveLoginPage);
  app.get('/auth', serveLoginPage);
}

/**
 * Register all authenticated routes that depend on the database
 * This should be called after db initialization
 */
export function registerAuthenticatedRoutes(app: Express) {
  // Get current user's profile
  app.get('/api/profile', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.json(req.user);
  });

  // Admin-only route for user management
  app.get('/api/admin/users', async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Investor dashboard data route
  app.get('/api/investor/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Basic dashboard data
    const dashboardData = {
      username: req.user.username,
      role: req.user.role,
      lastLogin: new Date().toISOString(),
      investments: []
    };
    
    res.json(dashboardData);
  });
}

/**
 * Main function to register all routes and create HTTP server
 */
export function registerRoutes(app: Express): Server {
  // Add middleware - these should already be applied in index.ts
  if (!app._router) {
    app.use(express.json());
    app.use(cors({
      origin: true,
      credentials: true
    }));
  }

  // Register essential routes that don't require auth/db
  registerEssentialRoutes(app);

  // Set up authentication routes
  setupAuth(app);

  // Register authenticated routes
  registerAuthenticatedRoutes(app);

  // Handle any remaining routes with React's router
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}