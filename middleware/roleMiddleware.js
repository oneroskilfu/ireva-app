/**
 * Role-based authorization middleware for the REVA platform
 * Restricts access to routes based on user roles
 */

// Define roles as constants for consistency
const roles = {
  ADMIN: 'admin',
  INVESTOR: 'investor',
  PROJECT_OWNER: 'project_owner'
};

/**
 * Check if the user is an admin
 */
function isAdmin(req, res, next) {
  if (req.user.role !== roles.ADMIN) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

/**
 * Check if the user is an investor
 */
function isInvestor(req, res, next) {
  if (req.user.role !== roles.INVESTOR) {
    return res.status(403).json({ message: 'Investor access required' });
  }
  next();
}

/**
 * Check if the user is a project owner
 */
function isProjectOwner(req, res, next) {
  if (req.user.role !== roles.PROJECT_OWNER) {
    return res.status(403).json({ message: 'Project owner access required' });
  }
  next();
}

/**
 * Check if the user owns a resource or is an admin
 */
function isResourceOwner(req, res, next) {
  // Admin can access any resource
  if (req.user.role === roles.ADMIN) {
    return next();
  }
  
  // Check if the resource belongs to the user
  const resourceId = req.params.id;
  
  if (req.user.id === resourceId) {
    return next();
  }
  
  return res.status(403).json({ message: 'You do not have permission to access this resource' });
}

module.exports = {
  roles,
  isAdmin,
  isInvestor,
  isProjectOwner,
  isResourceOwner
};