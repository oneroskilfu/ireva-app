/**
 * Session Configuration
 * 
 * This file sets up session management with Redis for better scalability.
 * It supports distributed sessions across multiple application instances.
 */

import session, { SessionData } from 'express-session';
import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import * as connectRedis from 'connect-redis';

// Extend the session type to include our custom fields
declare module 'express-session' {
  interface SessionData {
    lastActive?: Date;
    lastActivityUpdate?: number;
  }
}

// Environment variables
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || 'ireva-session-secret';
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '86400000', 10); // Default: 24 hours
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create Redis client for sessions
const redisClient = createClient({
  url: REDIS_URL,
  password: REDIS_PASSWORD,
  socket: {
    reconnectStrategy: (retries: number) => {
      return Math.min(retries * 100, 10000);
    },
  },
});

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('Redis session client connected');
});

redisClient.on('error', (err) => {
  console.error('Redis session client error:', err);
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis for sessions:', err);
  }
})();

// Create Redis store
const RedisStore = connectRedis.default(session);
const redisStore = new RedisStore({
  client: redisClient as any, // Type workaround due to library compatibility
  prefix: 'ireva:sess:',
});

// Configure session options
const sessionOptions: session.SessionOptions = {
  store: redisStore,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'ireva.sid',
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    sameSite: 'lax',
  },
};

// Create session middleware
export const sessionMiddleware = session(sessionOptions);

// Track active sessions for user activity monitoring
export const trackUserActivity = (req: Request, res: Response, next: NextFunction) => {
  // If user is authenticated, update last activity timestamp
  if (req.session && req.user) {
    req.session.lastActive = new Date();
    
    // Every 5 minutes, update the user's lastActiveAt in the database
    const now = Date.now();
    const lastUpdate = req.session.lastActivityUpdate || 0;
    
    if (now - lastUpdate > 5 * 60 * 1000) {
      req.session.lastActivityUpdate = now;
      
      // If we have tenant context, update the tenant user's last activity
      if (req.tenant) {
        import('./lib/tenant-db')
          .then(({ createTenantDb }) => {
            const tenantDb = createTenantDb(req.tenant.id);
            const { tenantUsers } = require('@shared/schema-tenant-tables');
            const { eq, and } = require('drizzle-orm');
            
            tenantDb
              .update(tenantUsers)
              .set({ lastActiveAt: new Date() })
              .where(
                and(
                  eq(tenantUsers.tenantId, req.tenant.id),
                  eq(tenantUsers.userId, req.user.id)
                )
              )
              .then(() => {})
              .catch((error: Error) => console.error('Failed to update user activity:', error));
          })
          .catch((error: Error) => console.error('Failed to import tenant-db:', error));
      }
    }
  }
  
  next();
};

export default sessionMiddleware;