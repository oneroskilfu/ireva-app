/**
 * iREVA Platform - Main Application Server
 * 
 * Configures Express, middleware, routes, and error handling
 * for the real estate investment platform.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Import route modules
const authRoutes = require('./routes/auth-routes');
const propertyRoutes = require('./routes/property-routes');
const investmentRoutes = require('./routes/investment-routes');
const notificationsRoutes = require('./routes/notifications');
const insightsRoutes = require('./routes/insights');

// Initialize Express app
const app = express();

// Set security HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS configuration
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

// Body parser, cookie parser, and request logger
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Compression for responses
app.use(compression());

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'iREVA Platform API is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api', notificationsRoutes);
app.use('/api', insightsRoutes);

// Check authentication status (for frontend)
app.get('/api/is-authenticated', (req, res) => {
  // Delegate to auth controller
  if (req.cookies.jwt) {
    const authController = require('./controllers/auth-controller');
    return authController.isAuthenticated(req, res);
  }
  
  // No token found
  res.status(200).json({
    status: 'success',
    authenticated: false
  });
});

// Static file serving (public folders)
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    }
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

module.exports = app;