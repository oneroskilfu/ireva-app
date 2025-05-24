import { Request, Response, NextFunction } from 'express';
import { createHmac } from 'crypto';
import { rateLimit } from 'express-rate-limit';

// Rate limiting middleware for webhook endpoints
export const webhookRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.',
  },
  skip: (req) => {
    // Skip rate limiting for trusted IPs if needed
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    return trustedIPs.includes(req.ip);
  },
});

// Webhook signature verification middleware
export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['coingate-signature'] as string;
  
  // If no webhook secret is set, warn and continue in development
  if (!process.env.COINGATE_WEBHOOK_SECRET) {
    console.warn('COINGATE_WEBHOOK_SECRET is not set. Signature verification skipped.');
    
    // In production, reject requests without signature verification
    if (process.env.NODE_ENV === 'production') {
      return res.status(401).json({
        error: 'Webhook signature verification failed: No secret configured',
      });
    }
    
    return next();
  }
  
  // If no signature in header, reject the request
  if (!signature) {
    return res.status(401).json({
      error: 'Webhook signature verification failed: No signature provided',
    });
  }
  
  try {
    // Verify signature with HMAC
    const rawBody = JSON.stringify(req.body);
    const expectedSignature = createHmac('sha256', process.env.COINGATE_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    
    // Use timing-safe comparison to prevent timing attacks
    const isValid = timingSafeCompare(signature, expectedSignature);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Webhook signature verification failed: Invalid signature',
      });
    }
    
    next();
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return res.status(401).json({
      error: 'Webhook signature verification failed: Internal error',
    });
  }
};

// Simple timing-safe comparison function
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// Transaction verification middleware
export const validateCryptoTransaction = (req: Request, res: Response, next: NextFunction) => {
  const { id, status, price_amount, price_currency, receive_currency } = req.body;
  
  // Basic validation of required fields
  if (!id || !status || !price_amount || !price_currency) {
    return res.status(400).json({
      error: 'Invalid webhook payload: Missing required fields',
    });
  }
  
  // Validate status - only allow processing for valid status values
  const validStatuses = ['paid', 'confirmed', 'completed'];
  if (req.method === 'POST' && !validStatuses.includes(status)) {
    console.log(`Payment ${id} has status ${status} - not processing funds`);
    return res.status(200).json({
      message: `Payment status ${status} acknowledged but not processed`,
    });
  }
  
  // Add payment data to request object for later use
  req.cryptoPayment = {
    id,
    status,
    amount: parseFloat(price_amount),
    currency: receive_currency || price_currency,
  };
  
  next();
};

// Extend Express Request to include custom cryptoPayment
declare global {
  namespace Express {
    interface Request {
      cryptoPayment?: {
        id: string;
        status: string;
        amount: number;
        currency: string;
      };
    }
  }
}