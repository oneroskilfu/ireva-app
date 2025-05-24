import { Router, Request, Response } from 'express';
import { generateToken, verifyToken } from '../auth-jwt';

const router = Router();

// Debug login endpoint
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Debug admin account
    if (email === 'admin@ireva.com' && password === 'admin123') {
      // Generate JWT token for admin
      const token = generateToken('admin-id', email, 'admin', true);
      
      return res.status(200).json({
        success: true,
        message: 'Debug admin login successful',
        token,
        user: {
          id: 'admin-id',
          email,
          role: 'admin',
          isVerified: true
        }
      });
    }
    
    // Debug investor account
    if (email === 'investor@ireva.com' && password === 'investor123') {
      // Generate JWT token for investor
      const token = generateToken('investor-id', email, 'investor', true);
      
      return res.status(200).json({
        success: true,
        message: 'Debug investor login successful',
        token,
        user: {
          id: 'investor-id',
          email,
          role: 'investor',
          isVerified: true
        }
      });
    }
    
    // Authentication failed
    return res.status(401).json({ 
      success: false,
      error: 'Invalid credentials',
      message: 'Debug note: Use admin@ireva.com/admin123 or investor@ireva.com/investor123'
    });
  } catch (error) {
    console.error('Debug login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug register endpoint
router.post('/register', (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Generate a random user ID for demo purposes
    const userId = 'user-' + Math.floor(Math.random() * 10000);
    
    // Generate JWT token for the new user
    const token = generateToken(userId, email, 'investor', false);
    
    return res.status(201).json({
      success: true,
      message: 'Debug user registration successful',
      token,
      user: {
        id: userId,
        email,
        name: name || 'Debug User',
        role: 'investor',
        isVerified: false
      }
    });
  } catch (error) {
    console.error('Debug registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug token verification endpoint
router.post('/verify-token', verifyToken, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

export default router;