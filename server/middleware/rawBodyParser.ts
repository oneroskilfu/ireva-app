import { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';

// Define a custom interface that extends Request to include rawBody
declare global {
  namespace Express {
    interface Request {
      rawBody?: string;
    }
  }
}

/**
 * Middleware to capture the raw request body before it's parsed.
 * This is necessary for webhook signature verification, as we need
 * to compute the HMAC on the exact raw body that was sent.
 */
export const rawBodyParser = bodyParser.json({
  verify: (req: Request, res: Response, buf: Buffer) => {
    req.rawBody = buf.toString();
  }
});

/**
 * Alternative middleware for capturing raw body when not using bodyParser.json()
 * This can be used directly if you need more control over the body parsing process.
 */
export function captureRawBody(req: Request, res: Response, next: NextFunction) {
  let data = '';
  
  req.on('data', (chunk) => {
    data += chunk;
  });
  
  req.on('end', () => {
    req.rawBody = data;
    next();
  });
}