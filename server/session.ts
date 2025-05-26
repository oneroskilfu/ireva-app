/**
 * Session Configuration
 * 
 * This file sets up session management with Redis for better scalability.
 * It supports distributed sessions across multiple application instances.
 * Includes support for Redis Sentinel for high availability.
 */

import session, { SessionData } from 'express-session';
import { Request, Response, NextFunction } from 'express';
import { RedisStore as ConnectRedisStore } from 'connect-redis';

// Import Redis client from our centralized Redis configuration
import redisClient from './redis';

// Extend the session type to include our custom fields
declare module 'express-session' {
  interface SessionData {
    lastActive?: Date;
    lastActivityUpdate?: number;
  }
}

// Environment variables
const SESSION_SECRET = process.env.SESSION_SECRET || 'ireva-session-secret';
const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '86400000', 10); // Default: 24 hours
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_PREFIX = process.env.SESSION_PREFIX || 'ireva:sess:';

// Try to use Redis, but gracefully fall back to default memory store if Redis fails
let sessionStore;
try {
  // Check if Redis client is connected
  if (redisClient.isReady) {
    sessionStore = new ConnectRedisStore({
      client: redisClient,
      prefix: SESSION_PREFIX,
    });
    console.log('Session store: Using Redis for distributed sessions');
  } else {
    throw new Error('Redis not ready');
  }
} catch (error) {
  // Use Express's default memory store (no external dependency needed)
  sessionStore = undefined; // Express will use default memory store
  console.log('Session store: Using default Express memory store (Redis unavailable)');
}

// Configure session options
const sessionOptions: session.SessionOptions = {
  store: sessionStore,
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

// Simple health check for the session store
export const checkSessionStoreHealth = async (): Promise<boolean> => {
  try {
    // Check if the Redis connection for sessions is healthy
    await redisClient.ping();
    return true;
  } catch (error) {
    console.error('Session store health check failed:', error);
    return false;
  }
};

export default sessionMiddleware;