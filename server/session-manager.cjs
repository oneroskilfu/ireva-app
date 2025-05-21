/**
 * Optimized Session Management Module
 * 
 * This module provides fast, reliable session management with
 * protection against common session issues like circular redirects.
 */

const createMemoryStore = require('memorystore');
const session = require('express-session');

// Constants for configuration
const SESSION_SECRET = process.env.SESSION_SECRET || 'ireva-platform-secret-key';
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Initialize session management with optimized configuration
 * @param {Object} app - Express application instance
 */
function initializeSession(app) {
  // Create memory store with optimized settings
  const MemoryStore = createMemoryStore(session);
  const sessionStore = new MemoryStore({
    checkPeriod: SESSION_MAX_AGE // Cleanup expired sessions
  });
  
  // Configure session middleware
  const sessionOptions = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: SESSION_MAX_AGE,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax'
    },
    // Add custom name to avoid conflicts
    name: 'ireva.sid'
  };
  
  // Apply session middleware
  app.use(session(sessionOptions));
  
  // Add session debugging middleware in development
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      // Track session creation/access
      const isNewSession = !req.session.initialized;
      if (isNewSession) {
        console.log(`[SESSION] New session created: ${req.sessionID}`);
        req.session.initialized = true;
        req.session.created = new Date().toISOString();
      }
      
      // Continue processing
      next();
    });
  }
  
  // Add anti-circular-redirect middleware
  app.use(preventRedirectLoops);
  
  return sessionStore;
}

/**
 * Middleware to prevent circular redirects by detecting rapid redirect sequences
 */
function preventRedirectLoops(req, res, next) {
  // Initialize redirect timestamps if they don't exist
  if (!req.session.redirects) {
    req.session.redirects = [];
  }
  
  // Get current timestamp
  const now = Date.now();
  
  // Clean up old redirects (older than 5 seconds)
  req.session.redirects = req.session.redirects.filter(time => now - time < 5000);
  
  // Check for too many redirects
  if (req.session.redirects.length >= 5) {
    console.error(`[SESSION] Redirect loop detected for ${req.path}`);
    
    // Clear the redirect history
    req.session.redirects = [];
    
    // Send error response instead of continuing the loop
    return res.status(400).send(`
      <html>
        <head><title>Redirect Loop Detected</title></head>
        <body>
          <h1>Redirect Loop Detected</h1>
          <p>We've detected too many redirects. This could be caused by:</p>
          <ul>
            <li>Session cookie issues</li>
            <li>Authentication configuration problems</li>
            <li>Browser cookie settings</li>
          </ul>
          <p>Please try clearing your cookies or using a different browser.</p>
          <p><a href="/auth">Return to login page</a></p>
        </body>
      </html>
    `);
  }
  
  // Track this request
  const originalEnd = res.end;
  
  // Override the end method to detect redirects
  res.end = function() {
    // Check if this is a redirect (status 301, 302, 303, 307, 308)
    if (this.statusCode >= 300 && this.statusCode < 400) {
      // Record this redirect timestamp
      req.session.redirects.push(now);
      console.log(`[SESSION] Redirect #${req.session.redirects.length} detected: ${req.path} -> ${this.getHeader('Location')}`);
    }
    
    // Call the original end method
    return originalEnd.apply(this, arguments);
  };
  
  next();
}

// Export functions
module.exports = {
  initializeSession,
  preventRedirectLoops
};