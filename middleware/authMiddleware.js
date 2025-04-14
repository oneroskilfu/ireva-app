const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header and verifies it
 * If valid, attaches the decoded user data to req.user
 */
const verifyToken = (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  
  // Check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    
    // Verify token
    jwt.verify(bearerToken, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      
      // Set the user data in the request
      req.user = decoded;
      next();
    });
  } else {
    // Forbidden
    res.status(401).json({ message: 'No token provided' });
  }
};

module.exports = { verifyToken };