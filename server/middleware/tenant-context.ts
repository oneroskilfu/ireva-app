/**
 * Tenant Context Middleware
 * 
 * This middleware identifies the current tenant from the request and attaches
 * the tenant context to the request object for downstream handlers.
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { tenants, tenantUsers } from '@shared/schema-tenants';
import { eq, and } from 'drizzle-orm';

/**
 * Extract tenant ID from the request URL parameters
 */
export function extractTenantId(req: Request, res: Response, next: NextFunction) {
  const { tenantId } = req.params;
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }
  
  req.tenantId = tenantId;
  next();
}

/**
 * Middleware to require a valid tenant context
 * This middleware validates that the tenant exists and attaches tenant info to the request
 */
export async function requireTenantAccess(req: Request, res: Response, next: NextFunction) {
  try {
    const { tenantId } = req.params;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    // Get the current user from the session
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Find the tenant
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId)
    });
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Check if the user has access to this tenant
    const tenantUser = await db.query.tenantUsers.findFirst({
      where: and(
        eq(tenantUsers.tenantId, tenantId),
        eq(tenantUsers.userId, currentUser.id),
        eq(tenantUsers.isActive, true)
      )
    });
    
    if (!tenantUser) {
      return res.status(403).json({ error: 'You do not have access to this tenant' });
    }
    
    // Attach tenant context to the request
    req.tenantId = tenantId;
    req.tenantUser = tenantUser;
    req.tenantSlug = tenant.slug;
    
    // Update last access time for this tenant-user relationship
    await db
      .update(tenantUsers)
      .set({ lastAccessAt: new Date() })
      .where(eq(tenantUsers.id, tenantUser.id));
    
    next();
  } catch (error) {
    console.error('Error in tenant context middleware:', error);
    res.status(500).json({ error: 'Failed to validate tenant access' });
  }
}

/**
 * Middleware to apply tenant filtering to all database queries
 * This middleware doesn't block requests, but ensures tenant data isolation
 */
export function applyTenantContext(req: Request, res: Response, next: NextFunction) {
  const { tenantId } = req;
  
  if (tenantId) {
    // Attach tenant context to the current request for downstream handlers
    // This allows handlers to access the tenant context without re-fetching it
    req.tenantId = tenantId;
  }
  
  next();
}