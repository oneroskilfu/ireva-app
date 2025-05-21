/**
 * Tenant Context Middleware
 * 
 * This middleware extracts and attaches tenant information to the request.
 * It also validates tenant access for the current user.
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { tenantUsers } from '@shared/schema-tenants';
import { eq, and } from 'drizzle-orm';
import { createTenantDb } from '../lib/tenant-db';

/**
 * Middleware to apply tenant context to requests
 * This extracts tenant information from the request and validates user access
 */
export function applyTenantContext(req: Request, res: Response, next: NextFunction) {
  const tenantId = extractTenantId(req);
  
  // If no tenant ID is found, continue without tenant context
  if (!tenantId) {
    return next();
  }
  
  // Attach tenant ID to request for later use
  req.tenantId = tenantId;
  
  // If user is not authenticated, just set the tenant ID and continue
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return next();
  }
  
  // Validate user access to this tenant and attach tenant role
  validateTenantAccess(req, tenantId)
    .then(tenantUser => {
      if (tenantUser) {
        req.tenantUser = tenantUser;
        // Create tenant-scoped database client
        req.tenantDb = createTenantDb(tenantId);
      }
      next();
    })
    .catch(error => {
      console.error('Error validating tenant access:', error);
      next(error);
    });
}

/**
 * Middleware to require tenant access
 * Use this on routes that should only be accessible to users with tenant access
 */
export function requireTenantAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }
  
  if (!req.tenantUser) {
    return res.status(403).json({ error: 'You do not have access to this tenant' });
  }
  
  next();
}

/**
 * Extract tenant ID from various sources in the request
 */
function extractTenantId(req: Request): string | undefined {
  // Try to get tenant ID from route params
  const tenantIdParam = req.params.tenantId;
  if (tenantIdParam) {
    return tenantIdParam;
  }
  
  // Try to get tenant ID from query string
  const tenantIdQuery = req.query.tenantId;
  if (tenantIdQuery && typeof tenantIdQuery === 'string') {
    return tenantIdQuery;
  }
  
  // Try to get tenant ID from headers
  const tenantIdHeader = req.headers['x-tenant-id'];
  if (tenantIdHeader && typeof tenantIdHeader === 'string') {
    return tenantIdHeader;
  }
  
  // Try to get tenant ID from subdomain
  const host = req.headers.host;
  if (host) {
    const subdomain = host.split('.')[0];
    // TODO: Lookup tenant by subdomain in database
    // For now, just return undefined
  }
  
  return undefined;
}

/**
 * Validate user access to the tenant
 */
async function validateTenantAccess(req: Request, tenantId: string) {
  if (!req.user || !req.user.id) {
    return null;
  }
  
  try {
    // Get tenant-user relationship from database
    const tenantUser = await db.query.tenantUsers.findFirst({
      where: and(
        eq(tenantUsers.tenantId, tenantId),
        eq(tenantUsers.userId, req.user.id)
      )
    });
    
    return tenantUser;
  } catch (error) {
    console.error('Error validating tenant access:', error);
    return null;
  }
}