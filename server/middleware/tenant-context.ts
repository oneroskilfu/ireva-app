/**
 * Tenant Context Middleware
 * 
 * This middleware handles tenant isolation by:
 * 1. Verifying the user has access to the requested tenant
 * 2. Setting tenant context in the request for downstream middleware
 * 3. Providing role-based access control within a tenant
 */

import { Request, Response, NextFunction } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { tenantUsers } from '@shared/schema-tenant-tables';
import { tenants } from '@shared/schema-tenants';

// Extend Express Request to include tenant info
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        role: string;
        isOwner: boolean;
      };
    }
  }
}

// Tenant context middleware - checks user access to tenant
export function tenantContext() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Get tenantId from URL params
      const { tenantId } = req.params;
      
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }
      
      // Check if tenant exists and is active
      const [tenant] = await db
        .select({ id: tenants.id, isActive: tenants.isActive })
        .from(tenants)
        .where(eq(tenants.id, tenantId));
      
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      
      if (!tenant.isActive) {
        return res.status(403).json({ error: 'Tenant is inactive' });
      }
      
      // Check if user has access to this tenant
      const [tenantUser] = await db
        .select({
          id: tenantUsers.id,
          role: tenantUsers.role,
          isOwner: tenantUsers.isOwner,
          isActive: tenantUsers.isActive,
        })
        .from(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.userId, req.user.id)
          )
        );
      
      if (!tenantUser) {
        return res.status(403).json({ error: 'Access denied to this organization' });
      }
      
      if (!tenantUser.isActive) {
        return res.status(403).json({ error: 'Your access to this organization has been revoked' });
      }
      
      // Set tenant context in request
      req.tenant = {
        id: tenantId,
        role: tenantUser.role,
        isOwner: tenantUser.isOwner,
      };
      
      next();
    } catch (error) {
      console.error('Tenant context middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Middleware to require admin role for tenant
export function requireTenantAdmin() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure tenant context has been set
    if (!req.tenant) {
      return res.status(500).json({ error: 'Tenant context not set - did you miss the tenantContext middleware?' });
    }
    
    // Check if user is admin or owner
    if (req.tenant.role === 'admin' || req.tenant.isOwner) {
      return next();
    }
    
    return res.status(403).json({ error: 'Admin access required for this operation' });
  };
}

// Middleware to require owner role for tenant
export function requireTenantOwner() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure tenant context has been set
    if (!req.tenant) {
      return res.status(500).json({ error: 'Tenant context not set - did you miss the tenantContext middleware?' });
    }
    
    // Check if user is the owner
    if (req.tenant.isOwner) {
      return next();
    }
    
    return res.status(403).json({ error: 'Owner access required for this operation' });
  };
}