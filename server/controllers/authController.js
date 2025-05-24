const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { db } = require('../db');
const { users } = require('../../shared/schema');
const { eq, or } = require('drizzle-orm');

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'ireva_secret_jwt_key';

/**
 * Hashes a password using scrypt
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password
 */
const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${derivedKey.toString('hex')}.${salt}`);
    });
  });
};

/**
 * Compares a supplied password with a stored hashed password
 * @param {string} supplied - The supplied password to check
 * @param {string} stored - The stored hashed password
 * @returns {Promise<boolean>} - Whether the passwords match
 */
const comparePasswords = async (supplied, stored) => {
  const [hashed, salt] = stored.split('.');
  return new Promise((resolve, reject) => {
    crypto.scrypt(supplied, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(hashed === derivedKey.toString('hex'));
    });
  });
};

/**
 * Generates a JWT token for a user
 * @param {Object} user - The user object
 * @returns {string} - The JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * Generates a referral code for a user
 * Format: IRV-XXXXX (where XXXXX is padded user ID)
 * @param {number} userId - The user ID
 * @returns {string} - The formatted referral code
 */
const generateReferralCode = (userId) => {
  // Get just the numeric part and pad to 5 digits
  const paddedId = userId.toString().padStart(5, '0');
  return `IRV-${paddedId}`;
};

/**
 * Registers a new user and handles referral logic
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phoneNumber, referredBy } = req.body;
    
    // Check if username or email already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { or, eq }) => or(
        eq(users.username, username),
        eq(users.email, email)
      )
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Validate referral code if provided
    let referrerId = null;
    if (referredBy) {
      const referrer = await db.query.users.findFirst({
        where: eq(users.referralCode, referredBy)
      });
      
      if (referrer) {
        referrerId = referrer.id;
      } else {
        // Invalid referral code, but we'll still allow registration
        console.warn(`Invalid referral code used during registration: ${referredBy}`);
      }
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create new user (without referral code initially)
    const [newUser] = await db.insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        role: 'investor', // Updated to match your enum values
        referredBy: referrerId,
        createdAt: new Date(),
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      });
    
    // Generate and update the user with a unique referral code
    const referralCode = generateReferralCode(newUser.id);
    await db.update(users)
      .set({ referralCode })
      .where(eq(users.id, newUser.id));
      
    // If the user was referred, update the referrer's referral records
    if (referrerId) {
      // Get current referrals array or initialize empty array
      const referrer = await db.query.users.findFirst({
        where: eq(users.id, referrerId)
      });
      
      if (referrer) {
        const currentReferrals = referrer.referrals || [];
        const updatedReferrals = [...currentReferrals, newUser.id];
        
        // Update referrer with new referrals and add referral reward
        await db.update(users)
          .set({ 
            referrals: updatedReferrals,
            referralRewards: (referrer.referralRewards || 0) + 50 // $50 bonus per referral
          })
          .where(eq(users.id, referrerId));
      }
    }
    
    // Generate JWT token
    const token = generateToken(newUser);
    
    res.status(201).json({
      user: { ...newUser, referralCode },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Logs in a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user by username
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await comparePasswords(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        referralCode: user.referralCode,
        referrals: user.referrals || [],
        referralRewards: user.referralRewards || 0,
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Gets the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by verifyToken middleware
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id)
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      referralCode: user.referralCode,
      referrals: user.referrals || [],
      referralRewards: user.referralRewards || 0,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  hashPassword,
  comparePasswords,
  generateToken,
  generateReferralCode,
  register,
  login,
  getCurrentUser
};