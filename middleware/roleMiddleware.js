/**
 * Role-based authorization middleware for the REVA platform
 * Restricts access to routes based on user roles
 */

const verifyRole = (roles = []) => {
  // Convert string parameter to array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized - Authentication required' });
    }

    // If no roles specified, any authenticated user can access
    if (roles.length === 0) {
      return next();
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied - ${roles.join(' or ')} access required` 
      });
    }

    next();
  };
};

// Pre-defined middleware for common role checks
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

const verifyInvestor = (req, res, next) => {
  if (!req.user || req.user.role !== 'investor') {
    return res.status(403).json({ message: 'Investor access only' });
  }
  next();
};

const verifyDeveloper = (req, res, next) => {
  if (!req.user || req.user.role !== 'developer') {
    return res.status(403).json({ message: 'Developer access only' });
  }
  next();
};

// Allow access to multiple roles
const verifyAnyOf = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized - Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied - Requires one of these roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = {
  verifyRole,
  verifyAdmin,
  verifyInvestor,
  verifyDeveloper,
  verifyAnyOf
};