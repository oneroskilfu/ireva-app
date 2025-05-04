import express from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { SessionData } from 'express-session';

// Extend Express session
declare module 'express-session' {
  interface SessionData {
    user: any;
  }
}

const router = express.Router();

// Debug login route - ONLY FOR DEVELOPMENT
// This route should be disabled in production
router.post('/debug-login', async (req, res) => {
  try {
    const { role = 'admin' } = req.body;
    
    // For JWT-based auth also create a JWT token
    const jwt = require('jsonwebtoken');
    
    const user = {
      id: 'debug-user-id',
      email: 'debug@example.com',
      username: 'debug_admin',
      role: role
    };
    
    // Create JWT token for APIs that use JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'debug-secret-key',
      { expiresIn: '24h' }
    );
    
    // Create a debug session with admin privileges for session-based auth
    req.session.user = user;
    
    // Log both authentication methods
    console.log('Debug login created - Session user:', user);
    console.log('Debug login created - JWT token generated');
    
    // Save the session
    req.session.save((err) => {
      if (err) {
        console.error('Error saving debug session:', err);
        return res.status(500).json({ error: 'Failed to create debug session' });
      }
      
      console.log('Debug session created with role:', role);
      return res.status(200).json({ 
        message: 'Debug login successful',
        user: req.session.user,
        token // Include the JWT token in the response
      });
    });
    
  } catch (error) {
    console.error('Error in debug login:', error);
    res.status(500).json({ error: 'Internal server error during debug login' });
  }
});

// Check current authenticated user (or debug session)
router.get('/current-user', (req, res) => {
  if (req.session.user) {
    return res.status(200).json({
      user: req.session.user
    });
  }
  
  return res.status(401).json({ error: 'Not authenticated' });
});

// Debug logout
router.post('/debug-logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying debug session:', err);
      return res.status(500).json({ error: 'Failed to destroy debug session' });
    }
    
    res.status(200).json({ message: 'Debug logout successful' });
  });
});

// Create admin user for testing
router.post('/create-admin', async (req, res) => {
  try {
    const adminEmail = 'admin@ireva.com';
    const adminPassword = 'Admin123!';
    
    // Check if admin already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, adminEmail));
    
    if (existingUsers.length > 0) {
      console.log('Admin user already exists');
      
      // Generate token for existing admin
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { 
          userId: existingUsers[0].id, 
          email: existingUsers[0].email, 
          role: existingUsers[0].role,
          fullName: [existingUsers[0].firstName, existingUsers[0].lastName].filter(Boolean).join(' ')
        },
        process.env.JWT_SECRET || 'debug-secret-key',
        { expiresIn: '24h' }
      );
      
      return res.status(200).json({
        message: 'Admin user already exists',
        user: {
          id: existingUsers[0].id,
          email: existingUsers[0].email,
          username: existingUsers[0].username,
          role: existingUsers[0].role
        },
        token
      });
    }
    
    // Create new admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminId = uuidv4();
    
    const [newAdmin] = await db.insert(users).values({
      id: adminId,
      email: adminEmail,
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      createdAt: new Date()
    }).returning();
    
    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: newAdmin.id, 
        email: newAdmin.email, 
        role: newAdmin.role,
        fullName: 'Admin User'
      },
      process.env.JWT_SECRET || 'debug-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('Admin user created successfully');
    
    return res.status(201).json({
      message: 'Admin user created successfully',
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        username: newAdmin.username,
        role: newAdmin.role
      },
      token,
      credentials: {
        email: adminEmail,
        password: adminPassword
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Internal server error while creating admin user' });
  }
});

export default router;