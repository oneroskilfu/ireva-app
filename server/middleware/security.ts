/**
 * Security Middleware for iREVA platform
 * 
 * This middleware implements various security headers and protection mechanisms
 * to safeguard the application against common web vulnerabilities.
 */
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { randomBytes } from 'crypto';

/**
 * Generate a CSP nonce for use with inline scripts
 * This adds an additional security layer by allowing only specific inline scripts
 */
export function generateNonce(req: Request): string {
  const nonce = randomBytes(16).toString('base64');
  if (!req.locals) {
    req.locals = {};
  }
  req.locals.cspNonce = nonce;
  return nonce;
}

/**
 * Custom security headers middleware
 * Implements various security headers with properly configured values
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Generate nonce for Content-Security-Policy
  const nonce = generateNonce(req);
  
  // Set security headers
  res.set({
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
    'Content-Security-Policy': `
      default-src 'self'; 
      script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://maps.googleapis.com https://*.coingate.com; 
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
      img-src 'self' data: https://res.cloudinary.com https://secure.gravatar.com;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://*.coingate.com https://api.stripe.com https://maps.googleapis.com;
      frame-src 'self' https://js.stripe.com https://*.coingate.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s+/g, ' ').trim()
  });
  
  next();
};

/**
 * Rate limiting configuration for different API routes
 */
export const configureRateLimiting = (app: any, rateLimiter: any) => {
  // General API rate limit
  app.use('/api/', rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  }));
  
  // More strict rate limit for authentication endpoints
  app.use('/api/auth/', rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again later.' }
  }));
  
  // Very strict rate limit for password reset endpoints
  app.use('/api/auth/reset-password', rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many password reset attempts, please try again later.' }
  }));
};

/**
 * Complete security middleware configuration
 * This sets up all security measures in one function call
 */
export const configureSecurityMiddleware = (app: any) => {
  // Use Helmet for secure headers (with customization)
  app.use(helmet({
    contentSecurityPolicy: false, // We'll use our custom CSP setting
  }));
  
  // Custom security headers
  app.use(securityHeaders);
  
  // Import and use rate limiter if provided
  try {
    const rateLimit = require('express-rate-limit');
    configureRateLimiting(app, rateLimit);
  } catch (error) {
    console.warn('express-rate-limit is not installed, rate limiting is disabled');
  }
  
  // Disable X-Powered-By header
  app.disable('x-powered-by');
};

/**
 * CORS configuration middleware with appropriate settings
 */
export const configureCors = (app: any, cors: any) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'https://ireva.replit.app'];
    
  app.use(cors({
    origin: function(origin: string, callback: Function) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in whitelist
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      } else {
        return callback(new Error('CORS policy violation'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
  }));
};

/**
 * Middleware to implement security measures for file uploads
 */
export const secureFileUploads = (req: Request, res: Response, next: NextFunction) => {
  // Only allow specific routes to upload files
  const allowedPaths = ['/api/kyc/documents', '/api/properties/images', '/api/users/avatar'];
  const isAllowedPath = allowedPaths.some(path => req.path.startsWith(path));
  
  // Check if current request is multipart/form-data
  const contentType = req.headers['content-type'] || '';
  const isFileUpload = contentType.includes('multipart/form-data');
  
  if (isFileUpload && !isAllowedPath) {
    return res.status(403).json({ error: 'File uploads are not allowed on this endpoint' });
  }
  
  next();
};

// Add type declaration for the req.locals object
declare global {
  namespace Express {
    interface Request {
      locals?: {
        cspNonce?: string;
        [key: string]: any;
      };
    }
  }
}