import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware to verify webhook signatures from CoinGate.
 * This ensures that webhook calls are actually coming from CoinGate
 * by validating the signature in the X-CoinGate-Signature header.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export function verifyCoinGateSignature(req: Request, res: Response, next: NextFunction) {
  // Get the signature from the headers
  const signature = req.headers['x-coingate-signature'];
  
  if (!signature) {
    console.error('Webhook error: No signature found in headers');
    return res.status(401).json({ error: 'No signature found in headers' });
  }
  
  // Get the webhook secret from environment variables
  const webhookSecret = process.env.COINGATE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('Webhook error: COINGATE_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }
  
  try {
    // Get the raw body as a string (Express should be configured to provide raw body)
    const rawBody = JSON.stringify(req.body);
    
    // Compute the HMAC using the webhook secret
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(rawBody);
    const computedSignature = hmac.digest('hex');
    
    // Verify that the computed signature matches the one in the headers
    const signatureMatches = crypto.timingSafeEqual(
      Buffer.from(computedSignature),
      Buffer.from(signature as string)
    );
    
    if (!signatureMatches) {
      console.error('Webhook error: Signature verification failed');
      return res.status(401).json({ error: 'Signature verification failed' });
    }
    
    // If verification passes, proceed to the route handler
    next();
  } catch (error) {
    console.error('Webhook error during signature verification:', error);
    return res.status(500).json({ error: 'Error verifying webhook signature' });
  }
}

/**
 * Development-only middleware for testing webhooks.
 * In development mode, we bypass signature verification for easier testing.
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export function bypassSignatureVerificationInDevelopment(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'development') {
    console.log('DEVELOPMENT MODE: Bypassing webhook signature verification');
    next();
  } else {
    verifyCoinGateSignature(req, res, next);
  }
}