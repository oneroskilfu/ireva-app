/**
 * Tenant Context Middleware
 * 
 * This middleware provides tenant isolation by:
 * 1. Extracting the tenant ID from the request URL or headers
 * 2. Validating that the user has access to the tenant
 * 3. Setting the tenant context for all downstream services
 */

import { NextFunction, Request, Response } from 'express';
import { db } from '../db';
import { tenantUsers, tenants } from '@shared/schema-tenant-tables';
import { eq, and } from 'drizzle-orm';

// Extend express Request to include tenant context
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantContext?: {
        id: string;
        name: string;
        role: string;
        isOwner: boolean;
      };
    }
  }
}

/**
 * Extract tenant ID from request
 * - First try URL path parameter (/tenant/:tenantId/...)
 * - Then try query parameter (?tenantId=...)
 * - Then try header (X-Tenant-ID)
 */
function extractTenantId(req: Request): string | undefined {
  // Check URL path parameter
  if (req.params.tenantId) {
    return req.params.tenantId;
  }
  
  // Check query parameter
  if (req.query.tenantId && typeof req.query.tenantId === 'string') {
    return req.query.tenantId;
  }
  
  // Check header
  const headerTenantId = req.headers['x-tenant-id'];
  if (headerTenantId && typeof headerTenantId === 'string') {
    return headerTenantId;
  }
  
  // Check localStorage through cookies
  if (req.cookies && req.cookies.selectedTenantId) {
    return req.cookies.selectedTenantId;
  }
  
  return undefined;
}

/**
 * Validate that user has access to the tenant
 */
async function validateTenantAccess(req: Request, tenantId: string): Promise<boolean> {
  if (!req.isAuthenticated() || !req.user) {
    return false;
  }
  
  try {
    // Check if user has access to this tenant
    const [tenantUser] = await db
      .select({
        id: tenantUsers.id,
        role: tenantUsers.role,
        isOwner: tenantUsers.isOwner
      })
      .from(tenantUsers)
      .where(
        and(
          eq(tenantUsers.tenantId, tenantId),
          eq(tenantUsers.userId, req.user.id)
        )
      );
    
    if (!tenantUser) {
      return false;
    }
    
    // Also get the tenant name
    const [tenant] = await db
      .select({
        id: tenants.id,
        name: tenants.name
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    
    if (!tenant) {
      return false;
    }
    
    // Set tenant context on request
    req.tenantId = tenantId;
    req.tenantContext = {
      id: tenantId,
      name: tenant.name,
      role: tenantUser.role,
      isOwner: tenantUser.isOwner
    };
    
    return true;
  } catch (error) {
    console.error('Error validating tenant access:', error);
    return false;
  }
}

/**
 * Tenant context middleware factory
 * @param required Whether tenant context is required (true) or optional (false)
 */
export function tenantContext(required = true) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip for authentication routes and public assets
    if (
      req.path.startsWith('/api/auth') ||
      req.path.startsWith('/api/login') ||
      req.path.startsWith('/api/register') ||
      req.path.startsWith('/api/user') ||
      req.path.startsWith('/api/tenants') && !req.path.includes('/tenants/')
    ) {
      return next();
    }
    
    const tenantId = extractTenantId(req);
    
    // If tenant ID is not found
    if (!tenantId) {
      // Skip if tenant context is optional
      if (!required) {
        return next();
      }
      
      return res.status(400).json({
        error: 'Tenant ID is required'
      });
    }
    
    // Validate that user has access to the tenant
    const hasAccess = await validateTenantAccess(req, tenantId);
    
    if (!hasAccess) {
      // Skip if tenant context is optional
      if (!required) {
        return next();
      }
      
      return res.status(403).json({
        error: 'Access to this tenant is forbidden'
      });
    }
    
    // Continue with tenant context
    next();
  };
}

/**
 * Require admin role middleware
 */
export function requireTenantAdmin() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenantContext) {
      return res.status(400).json({
        error: 'Tenant context is required'
      });
    }
    
    if (req.tenantContext.role !== 'admin' && !req.tenantContext.isOwner) {
      return res.status(403).json({
        error: 'Admin role is required for this action'
      });
    }
    
    next();
  };
}

/**
 * Require owner role middleware
 */
export function requireTenantOwner() {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenantContext) {
      return res.status(400).json({
        error: 'Tenant context is required'
      });
    }
    
    if (!req.tenantContext.isOwner) {
      return res.status(403).json({
        error: 'Owner permission is required for this action'
      });
    }
    
    next();
  };
}