/**
 * Tenant Discriminator Middleware
 * 
 * This middleware extracts the tenant ID from requests and ensures 
 * proper multi-tenant data isolation through the discriminator key approach.
 */

const { TENANT_HEADER } = require('../../shared/schema-tenant-scoped');
const { tenants } = require('../../shared/schema-tenants');
const { db } = require('../db');
const { eq } = require('drizzle-orm');

/**
 * Extracts tenant ID from various possible sources in request
 * - Request header (x-tenant-id)
 * - JWT token payload
 * - URL query parameter (tenantId)
 * - Request body (tenantId)
 * 
 * @param {Object} req - Express request
 * @returns {string|null} Tenant ID or null if not found
 */
const extractTenantId = (req) => {
  // 1. Check header (primary method)
  if (req.headers && req.headers[TENANT_HEADER]) {
    return req.headers[TENANT_HEADER];
  }

  // 2. Check JWT token (if available)
  if (req.user && req.user.tenantId) {
    return req.user.tenantId;
  }

  // 3. Check URL query parameter
  if (req.query && req.query.tenantId) {
    return req.query.tenantId;
  }

  // 4. Check request body
  if (req.body && req.body.tenantId) {
    return req.body.tenantId;
  }

  // No tenant ID found
  return null;
};

/**
 * Validates that the provided tenant ID exists in the database
 * 
 * @param {string} tenantId - Tenant ID to validate
 * @returns {Promise<boolean>} True if tenant exists
 */
const validateTenantId = async (tenantId) => {
  if (!tenantId) return false;

  // Query the tenants table to check if this tenant exists
  const tenant = await db.select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  return tenant.length > 0;
};

/**
 * Middleware to require tenant ID on requests
 * Blocks requests without a valid tenant ID
 */
const requireTenant = async (req, res, next) => {
  const tenantId = extractTenantId(req);

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      message: 'Tenant ID is required',
    });
  }

  // Validate tenant ID
  const isValid = await validateTenantId(tenantId);
  if (!isValid) {
    return res.status(404).json({
      success: false,
      message: 'Invalid tenant ID or tenant not found',
    });
  }

  // Attach tenant ID to request for use in controllers
  req.tenantId = tenantId;
  next();
};

/**
 * Middleware to attach tenant ID to request if available
 * Does not block requests without a tenant ID
 */
const attachTenant = async (req, res, next) => {
  const tenantId = extractTenantId(req);

  if (tenantId) {
    // Validate tenant ID
    const isValid = await validateTenantId(tenantId);
    if (isValid) {
      req.tenantId = tenantId;
    }
  }

  next();
};

/**
 * Middleware to ensure data isolation between tenants
 * Automatically adds tenantId to database queries
 */
const tenantScopedDatabase = (req, res, next) => {
  // Skip for non-tenant requests
  if (!req.tenantId) {
    return next();
  }

  // Create a tenant-scoped database proxy
  // This is a conceptual example - in a real implementation,
  // you would need to intercept all database calls
  req.db = new Proxy(db, {
    get(target, prop) {
      // Intercept database methods to add tenant filtering
      if (prop === 'select' || prop === 'update' || prop === 'delete') {
        return (...args) => {
          const query = target[prop](...args);
          
          // Add tenant ID to where clause
          return {
            ...query,
            where: (builder) => {
              if (typeof query.where === 'function') {
                query.where(builder);
              }
              return builder.eq('tenantId', req.tenantId);
            }
          };
        };
      }
      
      // Add tenant ID to insert operations
      if (prop === 'insert') {
        return (table) => {
          const originalInsert = target.insert(table);
          
          return {
            ...originalInsert,
            values: (data) => {
              // Add tenant ID to values
              if (Array.isArray(data)) {
                data = data.map(item => ({ ...item, tenantId: req.tenantId }));
              } else {
                data = { ...data, tenantId: req.tenantId };
              }
              
              return originalInsert.values(data);
            }
          };
        };
      }
      
      return target[prop];
    }
  });

  next();
};

module.exports = {
  requireTenant,
  attachTenant,
  tenantScopedDatabase,
  extractTenantId,
  validateTenantId,
};