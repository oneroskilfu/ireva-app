import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import express from "express";
import cors from "cors";
import { storage } from "./storage";
import { db } from "./db";
import path from "path";
import { requireAuth, requireAdmin, requireInvestor } from "./middleware/auth-middleware";
import { User } from "@shared/schema";

// Use standard Node.js __dirname since we're not using ES modules
const __dirname = process.cwd() + '/server';

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
  
  // Serve static files from public directory with improved caching options
  app.use(express.static(path.join(__dirname, 'public'), {
    etag: false,
    lastModified: false,
    index: false, // Prevent automatic index.html serving
    setHeaders: (res) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
  }));
  
  // Serve the direct-login.html file directly at multiple paths for maximum compatibility
  const serveLoginPage = (req: any, res: any) => {
    res.sendFile(path.join(__dirname, 'public/direct-login.html'), {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  };
  
  // Define explicit handlers for dashboard pages
  const serveAdminDashboard = (req: any, res: any) => {
    res.sendFile(path.join(__dirname, 'public/admin/dashboard.html'), {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  };
  
  const serveInvestorDashboard = (req: any, res: any) => {
    res.sendFile(path.join(__dirname, 'public/investor/dashboard.html'), {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  };
  
  // Register all page routes
  app.get('/', (req, res) => {
    // If already authenticated, redirect to appropriate dashboard
    if (req.isAuthenticated()) {
      const user = req.user as Express.User;
      if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'superadmin') {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/investor/dashboard');
      }
    }
    // Otherwise serve login page
    serveLoginPage(req, res);
  });
  
  app.get('/login', (req, res) => {
    // If already authenticated, redirect to appropriate dashboard
    if (req.isAuthenticated()) {
      const user = req.user as Express.User;
      if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'superadmin') {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/investor/dashboard');
      }
    }
    // Otherwise serve login page
    serveLoginPage(req, res);
  });
  
  app.get('/auth', (req, res) => {
    // If already authenticated, redirect to appropriate dashboard
    if (req.isAuthenticated()) {
      const user = req.user as Express.User;
      if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'superadmin') {
        return res.redirect('/admin/dashboard');
      } else {
        return res.redirect('/investor/dashboard');
      }
    }
    // Otherwise serve login page
    serveLoginPage(req, res);
  });
  
  app.get('/admin/dashboard', requireAdmin, serveAdminDashboard);
  app.get('/investor/dashboard', requireInvestor, serveInvestorDashboard);
}

/**
 * Register all authenticated routes that depend on the database
 * This should be called after db initialization
 */
export function registerAuthenticatedRoutes(app: Express) {
  // Get current user's profile
  app.get('/api/profile', requireAuth, (req, res) => {
    // User is guaranteed to be authenticated due to requireAuth middleware
    res.json(req.user);
  });

  // Admin-only route for user management
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Investor dashboard data route
  app.get('/api/investor/dashboard', requireAuth, async (req, res) => {
    // req.user is guaranteed to exist here because of requireAuth middleware
    const user = req.user as Express.User;
    
    // Basic dashboard data
    const dashboardData = {
      username: user.username,
      role: user.role,
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