import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Authenticate token middleware
const auth = async (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).send('Access denied. No token provided');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).send('User not found');
    }
    
    // Set user in request
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send('Invalid token');
  }
};

// Admin authorization middleware
const admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send('Access denied. Admin privileges required');
  }
  next();
};

// Developer authorization middleware
const developer = (req, res, next) => {
  if (!req.user || (req.user.role !== 'developer' && req.user.role !== 'admin')) {
    return res.status(403).send('Access denied. Developer privileges required');
  }
  next();
};

export { auth, admin, developer };