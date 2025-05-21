/**
 * Tenant Context Middleware
 * 
 * This middleware determines the current tenant for each request
 * by checking the request subdomain, headers, or JWT claims.
 * It attaches the tenant information to the request object for downstream use.
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { tenants } from '../../shared/schema-tenants';
import { eq } from 'drizzle-orm';

// Extend Express Request type to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
      };
      tenantId?: string;
    }
  }
}

/**
 * Extract tenant identifier from request
 * 
 * @param req Express request
 * @returns Tenant identifier (slug) or null if not found
 */
function extractTenantIdentifier(req: Request): string | null {
  // Method 1: Extract from subdomain
  const host = req.hostname;
  const subdomainMatch = host.match(/^([^.]+)\..*$/);
  
  if (subdomainMatch && subdomainMatch[1] !== 'www' && subdomainMatch[1] !== 'app') {
    return subdomainMatch[1];
  }
  
  // Method 2: Check custom header
  const tenantHeader = req.header('X-Tenant-ID');
  if (tenantHeader) {
    return tenantHeader;
  }
  
  // Method 3: Extract from JWT claims (if using tenant-specific auth)
  const user = req.user as any;
  if (user?.tenantId) {
    return user.tenantId;
  }
  
  // Method 4: Extract from request path (e.g., /tenants/:slug/...)
  const pathMatch = req.path.match(/^\/tenants\/([^/]+)/);
  if (pathMatch) {
    return pathMatch[1];
  }
  
  // If we reach this point, no tenant identifier was found
  return null;
}

/**
 * Validate tenant and attach to request
 * 
 * @param tenantSlug Tenant slug to validate
 * @param req Express request
 * @returns Promise resolving to boolean indicating if tenant was found
 */
async function validateAndAttachTenant(tenantSlug: string, req: Request): Promise<boolean> {
  // Query the database for the tenant
  const [foundTenant] = await db.select()
    .from(tenants)
    .where(eq(tenants.slug, tenantSlug))
    .limit(1);
  
  if (foundTenant) {
    // Attach tenant info to request
    req.tenant = foundTenant;
    req.tenantId = foundTenant.id;
    return true;
  }
  
  return false;
}

/**
 * Tenant context middleware
 * 
 * @param options Configuration options for the middleware
 * @returns Express middleware function
 */
export function tenantContext(options: {
  required?: boolean; // Whether a tenant is required for the request to proceed
} = {}) {
  const { required = true } = options;
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Skip tenant resolution for specific paths
      const bypassPaths = [
        '/api/health',
        '/api/login',
        '/api/register',
        '/api/tenants',  // Global tenant management endpoints
      ];
      
      // Check if the path starts with any of the bypass paths
      const shouldBypass = bypassPaths.some(path => 
        req.path === path || req.path.startsWith(`${path}/`)
      );
      
      if (shouldBypass) {
        return next();
      }
      
      // Extract tenant identifier from request
      const tenantSlug = extractTenantIdentifier(req);
      
      // If no tenant identifier found and tenant is required
      if (!tenantSlug && required) {
        return res.status(400).json({
          error: 'Tenant identifier not provided',
          message: 'The request does not specify a tenant.'
        });
      }
      
      // If tenant identifier found, validate and attach to request
      if (tenantSlug) {
        const tenantFound = await validateAndAttachTenant(tenantSlug, req);
        
        if (!tenantFound && required) {
          return res.status(404).json({
            error: 'Tenant not found',
            message: `No tenant found with identifier: ${tenantSlug}`
          });
        }
      }
      
      // Proceed to next middleware/route handler
      next();
    } catch (error) {
      console.error('Error in tenant context middleware:', error);
      res.status(500).json({
        error: 'Server error',
        message: 'An error occurred while resolving tenant context.'
      });
    }
  };
}

export default tenantContext;