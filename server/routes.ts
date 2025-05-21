import express from 'express';
import path from 'path';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { setupAuth } from './auth.cjs';
import { storage } from './storage.cjs';
import { tenantContext } from './middleware/tenant-context';

// Import routes
const authRoutes = require('./routes/auth-routes');
const propertyRoutes = require('./routes/property-routes');
const investmentRoutes = require('./routes/investment-routes');
const walletRoutes = require('./routes/wallet-routes');
const notificationRoutes = require('./routes/notification-routes');
const userRoutes = require('./routes/user-routes');
const twoFactorRoutes = require('./routes/two-factor-routes');
const auditRoutes = require('./routes/audit-routes');
const ledgerRoutes = require('./routes/ledger-routes');
const aiInsightsRoutes = require('./routes/ai-insights-routes');

// Tenant routes
const tenantController = require('./controllers/tenant-controller');

export function registerRoutes(app: express.Express) {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  
  // Enable CORS
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://ireva.com', 'https://www.ireva.com'] 
      : true,
    credentials: true
  }));
  
  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });

  // Apply rate limiting to API routes
  app.use('/api', apiLimiter);
  
  // Body parser, cookie parser
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser());
  
  // Setup authentication
  setupAuth(app, storage);
  
  // Tenant management routes (admin only)
  app.get('/api/tenants', tenantController.getAllTenants);
  app.post('/api/tenants', tenantController.createTenant);
  app.get('/api/tenants/:id', tenantController.getTenantById);
  app.get('/api/tenants/slug/:slug', tenantController.getTenantBySlug);
  app.put('/api/tenants/:id', tenantController.updateTenant);
  app.delete('/api/tenants/:id', tenantController.deleteTenant);
  
  // Apply tenant context middleware to tenant-scoped routes
  // This will extract tenant info and attach to request
  app.use(tenantContext({ required: false }));
  
  // API Routes (tenant-scoped)
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', tenantContext(), propertyRoutes);
  app.use('/api/investments', tenantContext(), investmentRoutes);
  app.use('/api/wallet', tenantContext(), walletRoutes);
  app.use('/api/notifications', tenantContext(), notificationRoutes);
  app.use('/api/users', tenantContext({ required: false }), userRoutes);
  app.use('/api/2fa', tenantContext({ required: false }), twoFactorRoutes);
  app.use('/api/audit', tenantContext(), auditRoutes);
  app.use('/api/ledger', tenantContext(), ledgerRoutes);
  app.use('/api/insights', tenantContext(), aiInsightsRoutes);
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'iREVA Platform API is running',
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Static files - serve public directory
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Create and return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}