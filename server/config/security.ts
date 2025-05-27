import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Express } from 'express';

// Security configuration for production deployment
export const configureSecurityMiddleware = (app: Express) => {
  // Content Security Policy and security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Required for Vite in development
          "https://js.stripe.com",
          "https://checkout.paystack.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "https://res.cloudinary.com" // For property images
        ],
        connectSrc: [
          "'self'",
          "https://api.ireva.ng",
          "https://api.stripe.com",
          "https://api.paystack.co"
        ],
        frameSrc: [
          "'self'",
          "https://js.stripe.com",
          "https://checkout.paystack.com"
        ]
      },
    },
    crossOriginEmbedderPolicy: false // Allow embedding for payment frames
  }));

  // CORS configuration
  const corsOptions = {
    origin: function (origin: string | undefined, callback: Function) {
      const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://ireva.ng',
        'https://www.ireva.ng',
        'https://admin.ireva.ng'
      ];

      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key'
    ]
  };

  app.use(cors(corsOptions));

  // Rate limiting
  const createRateLimit = (windowMs: number, max: number, message: string) => {
    return rateLimit({
      windowMs,
      max,
      message: { error: message },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: message,
          retryAfter: Math.round(windowMs / 1000)
        });
      }
    });
  };

  // General rate limiting
  app.use('/api/', createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // limit each IP to 100 requests per windowMs
    'Too many requests from this IP, please try again later'
  ));

  // Stricter rate limiting for auth endpoints
  app.use('/api/auth/', createRateLimit(
    15 * 60 * 1000, // 15 minutes
    10, // limit each IP to 10 auth requests per windowMs
    'Too many authentication attempts, please try again later'
  ));

  // Very strict rate limiting for password reset
  app.use('/api/auth/forgot-password', createRateLimit(
    60 * 60 * 1000, // 1 hour
    3, // limit each IP to 3 password reset requests per hour
    'Too many password reset attempts, please try again later'
  ));

  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);
};

// Environment validation
export const validateEnvironmentVariables = () => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'SESSION_SECRET'
  ];

  const productionEnvVars = [
    'CORS_ORIGIN',
    'NODE_ENV'
  ];

  const missingVars: string[] = [];

  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Check production-specific variables
  if (process.env.NODE_ENV === 'production') {
    productionEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    });
  }

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  // Validate JWT secret strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long for security');
    process.exit(1);
  }

  // Validate session secret strength
  const sessionSecret = process.env.SESSION_SECRET;
  if (sessionSecret && sessionSecret.length < 32) {
    console.error('❌ SESSION_SECRET must be at least 32 characters long for security');
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
};

// Security headers for API responses
export const securityHeaders = (req: any, res: any, next: any) => {
  // Remove server signature
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: any, res: any, next: any) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potentially dangerous characters
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object') {
        obj[key] = sanitizeObject(obj[key]);
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

export default {
  configureSecurityMiddleware,
  validateEnvironmentVariables,
  securityHeaders,
  sanitizeInput
};