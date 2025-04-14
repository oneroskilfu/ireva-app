/**
 * Role-based authorization middleware for the REVA platform
 * Restricts access to routes based on user roles
 */

const roles = {
  ADMIN: 'admin',
  INVESTOR: 'investor',
  PROJECT_OWNER: 'project_owner'
};

/**
 * Middleware to verify if the user has the required role
 * @param {string | string[]} allowedRoles - Single role or array of roles that are allowed to access the route
 * @returns {function} Express middleware function
 */
const authorize = (allowedRoles) => {
  // Convert to array if single role is passed
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    // Ensure user is authenticated (authMiddleware should be used before this)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if user has one of the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to access this resource' 
      });
    }

    // User has required role, proceed to the route handler
    next();
  };
};

/**
 * Specific middleware for admin-only routes
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== roles.ADMIN) {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

/**
 * Specific middleware for investor-only routes
 */
const investorOnly = (req, res, next) => {
  if (!req.user || req.user.role !== roles.INVESTOR) {
    return res.status(403).json({ 
      success: false, 
      message: 'Investor access required' 
    });
  }
  next();
};

/**
 * Middleware to check if user is accessing their own resource
 * @param {string} idParam - The route parameter name that contains the resource ID
 * @param {function} getUserId - Function to extract the user ID from the resource (optional)
 */
const resourceOwnerOnly = (idParam = 'id', getUserId = null) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      
      // If no resource ID is provided, deny access
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID not provided'
        });
      }
      
      // Admin can access any resource
      if (req.user.role === roles.ADMIN) {
        return next();
      }
      
      // If user ID extraction function is provided, use it to check ownership
      if (getUserId) {
        const ownerId = await getUserId(resourceId);
        if (req.user.id === ownerId) {
          return next();
        }
      } 
      // Otherwise, simply check if the resource ID matches the user ID
      else if (req.user.id === resourceId) {
        return next();
      }
      
      // If all checks fail, deny access
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource'
      });
    } catch (error) {
      console.error('Error in resourceOwnerOnly middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while checking resource ownership'
      });
    }
  };
};

module.exports = {
  roles,
  authorize,
  adminOnly,
  investorOnly,
  resourceOwnerOnly
};