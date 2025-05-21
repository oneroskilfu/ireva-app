/**
 * Tenant Middleware
 * 
 * Provides middleware functions for tenant-based access control and request processing.
 * These middleware functions help isolate data between tenants and ensure users only 
 * access data they're authorized to view.
 */

const TenantService = require('../services/tenant-service');

/**
 * Get current tenant from headers, subdomain, or request parameter
 * 
 * @param {Object} req - Express request object
 * @returns {Promise<Object|null>} Tenant object or null if not found
 */
async function _getCurrentTenant(req) {
  try {
    // Method 1: Check headers (X-Tenant-ID or X-Tenant-Slug)
    const tenantId = req.headers['x-tenant-id'];
    const tenantSlug = req.headers['x-tenant-slug'];
    
    if (tenantId) {
      return await TenantService.getTenantById(Number(tenantId));
    }
    
    if (tenantSlug) {
      return await TenantService.getTenantBySlug(tenantSlug);
    }
    
    // Method 2: Check subdomain (tenant.ireva.com)
    const host = req.headers.host;
    if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
      const parts = host.split('.');
      if (parts.length > 2) {
        const subdomain = parts[0];
        // Ignore www, app, api subdomains
        if (!['www', 'app', 'api'].includes(subdomain)) {
          const tenant = await TenantService.getTenantBySlug(subdomain);
          if (tenant) return tenant;
        }
      }
      
      // Check if this is a custom domain
      const tenant = await TenantService.getTenantByDomain(host);
      if (tenant) return tenant;
    }
    
    // Method 3: Check URL parameter (/api/properties?tenantId=123)
    if (req.query.tenantId) {
      return await TenantService.getTenantById(Number(req.query.tenantId));
    }
    
    // Method 4: Check from user's default tenant (if authenticated)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      const defaultTenant = await TenantService.getUserDefaultTenant(req.user.id);
      if (defaultTenant) return defaultTenant.tenant;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current tenant:', error);
    return null;
  }
}

/**
 * Middleware to attach current tenant to request
 * Does not restrict access if tenant is not found
 */
const attachTenant = async (req, res, next) => {
  try {
    const tenant = await _getCurrentTenant(req);
    req.tenant = tenant;
    next();
  } catch (error) {
    console.error('Error in attachTenant middleware:', error);
    next(error);
  }
};

/**
 * Middleware to require tenant context
 * Prevents access to routes if tenant is not found
 */
const requireTenant = async (req, res, next) => {
  try {
    const tenant = await _getCurrentTenant(req);
    
    if (!tenant) {
      return res.status(400).json({
        success: false,
        message: 'Tenant context required',
      });
    }
    
    // Ensure tenant is active
    if (tenant.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Tenant is ${tenant.status}`,
      });
    }
    
    req.tenant = tenant;
    next();
  } catch (error) {
    console.error('Error in requireTenant middleware:', error);
    next(error);
  }
};

/**
 * Middleware to verify user belongs to the current tenant
 * Requires authentication and tenant context
 */
const verifyTenantUser = async (req, res, next) => {
  try {
    // Check authentication
    if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    // Check tenant context
    if (!req.tenant) {
      return res.status(400).json({
        success: false,
        message: 'Tenant context required',
      });
    }
    
    // Verify user belongs to tenant
    const belongsToTenant = await TenantService.userBelongsToTenant(req.tenant.id, req.user.id);
    
    if (!belongsToTenant) {
      return res.status(403).json({
        success: false,
        message: 'User does not belong to this tenant',
      });
    }
    
    // User is verified, proceed
    next();
  } catch (error) {
    console.error('Error in verifyTenantUser middleware:', error);
    next(error);
  }
};

/**
 * Middleware to check if user has specific role in tenant
 * 
 * @param {string|array} roles - Required role(s)
 * @returns {Function} Express middleware
 */
const requireTenantRole = (roles) => {
  return async (req, res, next) => {
    try {
      // Check authentication
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      // Check tenant context
      if (!req.tenant) {
        return res.status(400).json({
          success: false,
          message: 'Tenant context required',
        });
      }
      
      // Verify user has required role
      const hasRole = await TenantService.userHasRoleInTenant(req.tenant.id, req.user.id, roles);
      
      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }
      
      // User has required role, proceed
      next();
    } catch (error) {
      console.error('Error in requireTenantRole middleware:', error);
      next(error);
    }
  };
};

module.exports = {
  attachTenant,
  requireTenant,
  verifyTenantUser,
  requireTenantRole,
};