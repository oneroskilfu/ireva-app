const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).messages({
    'string.pattern.base': 'Phone number must be in international format starting with + (e.g., +2341234567890)'
  }),
  role: Joi.string().valid('admin', 'investor', 'project_owner').default('investor')
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const emailVerificationSchema = Joi.object({
  token: Joi.string().required()
});

const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordRequestSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required()
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { username, email, password, phoneNumber, role } = value;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Only allow admin role to be created by an admin (if it's not the first admin)
    if (role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      // If trying to create admin and admins already exist, require authorization
      if (adminCount > 0) {
        // Check if request is from an authorized admin
        if (!req.user || req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Only existing admins can create new admin accounts'
          });
        }
      }
    }

    // Create email verification token
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = await User.create({
      username,
      email,
      password, // Will be hashed by the model pre-save hook
      phoneNumber,
      role,
      emailVerificationToken,
      emailVerificationExpires
    });

    // Send email verification (to be implemented)
    // await sendVerificationEmail(user.email, emailVerificationToken);

    // Generate token
    const token = user.generateAuthToken();

    // Return new user (exclude sensitive fields)
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      phoneNumber: user.phoneNumber,
      kycStatus: user.kycStatus,
      walletBalance: user.walletBalance,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      message: 'User registered successfully. Please verify your email.'
    });
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { username, password } = value;

    // Find user by username
    const user = await User.findOne({ username }).select('+password');

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    // Return user info (exclude sensitive fields)
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      phoneNumber: user.phoneNumber,
      kycStatus: user.kycStatus,
      walletBalance: user.walletBalance,
      mfaEnabled: user.mfaEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

/**
 * @route GET /api/auth/verify
 * @desc Verify token & return user data
 * @access Private
 */
router.get('/verify', protect, async (req, res) => {
  try {
    // User is already attached to req by the protect middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        phoneNumber: user.phoneNumber,
        kycStatus: user.kycStatus,
        walletBalance: user.walletBalance,
        mfaEnabled: user.mfaEnabled,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error in token verification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
});

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.post('/change-password', protect, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = updatePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { currentPassword, newPassword } = value;
    const user = await User.findById(req.user._id).select('+password');

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error in password change:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

/**
 * @route POST /api/auth/verify-email
 * @desc Verify user email with token
 * @access Public
 */
router.post('/verify-email', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = emailVerificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { token } = value;

    // Find user with this token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Error in email verification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
});

/**
 * @route POST /api/auth/role
 * @desc Change user role (admin only)
 * @access Admin
 */
router.post('/role', protect, adminOnly, async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: 'User ID and role are required'
      });
    }

    if (!['admin', 'investor', 'project_owner'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    console.error('Error in role update:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during role update'
    });
  }
});

module.exports = router;