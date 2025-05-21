/**
 * Optimized Authentication Middleware (CommonJS version)
 * 
 * Designed to prevent circular redirects and provide clear authorization paths.
 */

// Utility for consistent logging
function logWithTime(message) {
  console.log(`[AUTH] ${message}`);
}

/**
 * Core authentication middleware function with single decision point
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function authMiddleware(req, res, next) {
  // Public paths that never require authentication
  const publicPaths = [
    '/login', 
    '/auth', 
    '/api/login', 
    '/api/health',
    '/api/register'
  ];
  
  // Static resources that should bypass auth checks
  if (req.path.match(/\.(css|js|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot)$/i)) {
    return next();
  }
  
  // Skip authentication for public paths
  if (publicPaths.includes(req.path)) {
    return next();
  }
  
  // Check if user is authenticated - simplified for initial version
  const isAuthenticated = req.session && req.session.user;
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    // Store original URL for post-login redirect (only if it's not already a redirect loop)
    if (!req.session.redirectCount) {
      req.session.redirectCount = 0;
    }
    
    req.session.redirectCount++;
    
    // Detect redirect loops (more than 3 redirects in quick succession)
    if (req.session.redirectCount > 3) {
      logWithTime(`Redirect loop detected for ${req.path}, redirecting to error page`);
      req.session.redirectCount = 0; // Reset counter
      return res.status(400).send('Redirect loop detected. Please clear cookies and try again.');
    }
    
    // Store return URL and redirect
    req.session.returnTo = req.originalUrl;
    logWithTime(`Unauthenticated access to ${req.path}, redirecting to /auth`);
    return res.redirect('/auth');
  }
  
  // Reset redirect counter on successful authentication
  req.session.redirectCount = 0;
  
  // User is authenticated, handle role-based access
  const userRole = req.session.user.role;
  
  // Admin section requires admin role
  if (req.path.startsWith('/admin') && userRole !== 'admin' && userRole !== 'super_admin') {
    logWithTime(`Unauthorized access to ${req.path} by ${userRole} role`);
    return res.status(403).redirect('/investor/dashboard');
  }
  
  // Investor section requires investor or admin role
  if (req.path.startsWith('/investor') && 
      userRole !== 'investor' && 
      userRole !== 'admin' && 
      userRole !== 'super_admin') {
    logWithTime(`Unauthorized access to ${req.path} by ${userRole} role`);
    return res.status(403).redirect('/auth');
  }
  
  // Authentication and authorization passed
  logWithTime(`Authorized access to ${req.path} by ${userRole} role`);
  next();
}

/**
 * Role-based middleware generator
 * 
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 * @returns {Function} Middleware function that checks for specific roles
 */
function requireRole(allowedRoles) {
  return function(req, res, next) {
    // User must be authenticated first
    if (!req.session || !req.session.user) {
      // Prevent redirect loops by checking count
      if (!req.session.redirectCount) {
        req.session.redirectCount = 0;
      }
      
      req.session.redirectCount++;
      
      // Detect redirect loops
      if (req.session.redirectCount > 3) {
        req.session.redirectCount = 0; // Reset counter
        return res.status(400).send('Redirect loop detected. Please clear cookies and try again.');
      }
      
      // Store return URL and redirect
      req.session.returnTo = req.originalUrl;
      return res.redirect('/auth');
    }
    
    // Reset redirect counter
    req.session.redirectCount = 0;
    
    const userRole = req.session.user.role;
    
    // Check if user's role is in the allowed roles list
    if (allowedRoles.includes(userRole)) {
      return next();
    }
    
    // Not authorized for this role
    logWithTime(`Role check failed for ${req.path}: user has ${userRole}, needs one of ${allowedRoles.join(', ')}`);
    return res.status(403).send('Unauthorized: Insufficient permissions');
  };
}

// Export middleware functions
module.exports = {
  authMiddleware,
  requireRole
};