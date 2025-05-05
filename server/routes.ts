import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import express from "express";
import cors from "cors";
import { storage } from "./storage";

export function registerRoutes(app: Express): Server {
  // Add middleware
  app.use(express.json());
  app.use(cors({
    origin: true,
    credentials: true
  }));

  // Set up authentication routes
  setupAuth(app);

  // API routes 
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
  });

  // Get current user's profile
  app.get('/api/profile', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.json(req.user);
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}