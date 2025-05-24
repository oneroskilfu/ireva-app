/**
 * Full application implementation for iREVA platform
 * This file is loaded dynamically after the minimal server starts
 */
import express, { Router, Request, Response } from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log("Initializing full iREVA application...");

// Create a router for admin routes
const adminRouter = Router();

// Debug endpoint to create admin user
adminRouter.post('/create-admin', async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      message: 'Admin user created or found',
      success: true,
      token: 'debug-admin-token-' + Date.now(),
      user: {
        id: 'admin-user-id',
        email: 'admin@ireva.com',
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// Create separate admin routes
adminRouter.get('/dashboard/stats', (req: Request, res: Response) => {
  res.json({
    totalUsers: 1250,
    totalInvestments: 534,
    totalProperties: 48,
    pendingKyc: 23
  });
});

// Load debug auth router
import debugAuthRouter from './routes/debug-auth';

// Get the Express app from the main index.ts
// We can only add routes to it, not replace or recreate it
const appFromIndex = express();

// Add our routes to the main application
appFromIndex.use('/api/admin', adminRouter);
appFromIndex.use('/api/debug', debugAuthRouter);

// Add a catch-all route for unknown API endpoints
appFromIndex.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: 'The requested API endpoint does not exist or is not yet implemented',
    path: req.originalUrl
  });
});

console.log("Full iREVA application initialization complete");