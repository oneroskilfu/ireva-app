import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware to verify CoinGate webhook signatures
 * 
 * CoinGate signs webhook payloads with a shared secret known to both
 * CoinGate and our application. This middleware verifies that signature
 * to ensure the webhook is authentic.
 */
export const webhookSignatureVerifier = (req: Request, res: Response, next: NextFunction) => {
  // The signature sent by CoinGate in the headers
  const signature = req.headers['x-coingate-signature'];
  // The raw body of the request (this should be the raw JSON string)
  const payload = JSON.stringify(req.body);
  
  // Get the webhook secret from environment variables
  const webhookSecret = process.env.COINGATE_WEBHOOK_SECRET;
  
  // In development mode, allow skipping validation if secret isn't set
  if (!webhookSecret) {
    console.warn('COINGATE_WEBHOOK_SECRET is not set. Webhook signature verification skipped.');
    return next();
  }
  
  if (!signature) {
    console.error('Missing X-Coingate-Signature header');
    return res.status(401).json({ error: 'Missing signature header' });
  }
  
  try {
    // Create an HMAC using the webhook secret
    const hmac = crypto.createHmac('sha256', webhookSecret);
    // Update the HMAC with the payload
    hmac.update(payload);
    // Get the digest in hex format
    const expectedSignature = hmac.digest('hex');
    
    // Compare the expected signature with the one provided in the request
    // Using a time-constant comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature as string, 'hex')
    );
    
    if (isValid) {
      // If signature is valid, proceed to the route handler
      next();
    } else {
      console.error('Invalid webhook signature');
      res.status(401).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    res.status(500).json({ error: 'Signature verification failed' });
  }
};