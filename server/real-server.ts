/**
 * Real server implementation for iREVA platform
 * This file is loaded dynamically after the minimal server starts
 */
import express, { Router, Request, Response } from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Dynamic imports
const debugAuthRouterPromise = import('./routes/debug-auth')
  .catch(err => {
    console.error("Failed to load debug auth router:", err);
    return { default: Router() };
  });

console.log("Initializing full iREVA server...");

// Temporary patch for authentication issues
// Create a router for admin routes
const adminRouter = Router();

// Debug endpoint to create admin user
adminRouter.post('/create-admin', async (req: Request, res: Response) => {
  try {
    // Mock a successful response until the real implementation is fixed
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

// Attach the various routers to global Express app
// We can't export anything as this is loaded dynamically
const app = express();
app.use('/api/admin', adminRouter);

// Attach debug auth router when it's loaded
debugAuthRouterPromise.then(module => {
  console.log("Attaching debug auth router");
  app.use('/api/debug', module.default);
});

// Register enhanced endpoints

// Admin dashboard endpoint
app.get('/api/admin/dashboard', (req: Request, res: Response) => {
  res.json({
    stats: {
      totalUsers: 1250,
      totalInvestments: 534,
      totalProperties: 48,
      pendingKyc: 23
    },
    recentActivity: [
      { type: 'user_joined', timestamp: new Date(), details: { username: 'investor54' } },
      { type: 'investment_made', timestamp: new Date(), details: { amount: 5000, property: 'Premium Villa' } }
    ]
  });
});

// Add a catch-all route for API endpoints
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: 'The requested API endpoint does not exist or is not yet implemented',
    path: req.originalUrl
  });
});

console.log("Full iREVA server initialization complete");