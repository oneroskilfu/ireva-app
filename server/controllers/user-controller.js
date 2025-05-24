/**
 * User Controller
 * 
 * Handles all user profile-related operations including:
 * - Retrieving user profile information
 * - Updating user profile
 * - Changing password
 * - Managing user preferences
 */

const { eq } = require('drizzle-orm');
const bcrypt = require('bcrypt');
const { db } = require('../db.cjs');
const { users } = require('../../shared/schema');
const securityMiddleware = require('../middleware/security-middleware');

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user from database
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      status: 'success',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving user profile'
    });
  }
};

/**
 * Update user profile
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, profileImage } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and email are required'
      });
    }
    
    // Check if email is already in use by another user
    if (email !== req.user.email) {
      const [existingUser] = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is already in use'
        });
      }
    }
    
    // Update user profile
    const [updatedUser] = await db.update(users)
      .set({
        name,
        email,
        phone: phone || null,
        address: address || null,
        profileImage: profileImage || null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Create audit log
    await securityMiddleware.auditLog('PROFILE_UPDATE')(req, res, () => {});
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user: userWithoutPassword }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating user profile'
    });
  }
};

/**
 * Change user password
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required'
      });
    }
    
    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 8 characters long'
      });
    }
    
    // Get user from database
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if current password is correct
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update user password
    await db.update(users)
      .set({
        password: hashedPassword,
        passwordChangedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // Create audit log
    await securityMiddleware.auditLog('PASSWORD_CHANGE')(req, res, () => {});
    
    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while changing password'
    });
  }
};

/**
 * Update user preferences
 */
exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;
    
    // Validate preferences object
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid preferences format'
      });
    }
    
    // Get current user
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Merge existing preferences with new ones
    const currentPreferences = user.preferences || {};
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
      notifications: {
        ...(currentPreferences.notifications || {}),
        ...(preferences.notifications || {})
      },
      investmentPreferences: preferences.investmentPreferences || currentPreferences.investmentPreferences || [],
      theme: preferences.theme || currentPreferences.theme || 'light'
    };
    
    // Update user preferences
    const [updatedUser] = await db.update(users)
      .set({
        preferences: updatedPreferences,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    // Create audit log
    await securityMiddleware.auditLog('PREFERENCES_UPDATE')(req, res, () => {});
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
      status: 'success',
      message: 'Preferences updated successfully',
      data: { 
        user: userWithoutPassword,
        preferences: updatedPreferences
      }
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating preferences'
    });
  }
};

/**
 * Set up KYC information
 */
exports.updateKYC = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, documentNumber, documentFront, documentBack, selfieImage } = req.body;
    
    // Validate required fields
    if (!documentType || !documentNumber || !documentFront || !selfieImage) {
      return res.status(400).json({
        status: 'error',
        message: 'Document type, number, front image, and selfie are required'
      });
    }
    
    // Get user from database
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check if KYC record exists
    const [existingKYC] = await db.select()
      .from(kyc)
      .where(eq(kyc.userId, userId))
      .limit(1);
    
    if (existingKYC) {
      // Update existing KYC record
      await db.update(kyc)
        .set({
          documentType,
          documentNumber,
          documentFront,
          documentBack: documentBack || null,
          selfieImage,
          status: 'pending', // Reset to pending for review
          updatedAt: new Date()
        })
        .where(eq(kyc.userId, userId));
    } else {
      // Create new KYC record
      await db.insert(kyc)
        .values({
          userId,
          documentType,
          documentNumber,
          documentFront,
          documentBack: documentBack || null,
          selfieImage,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    // Update user KYC status
    await db.update(users)
      .set({
        kycStatus: 'pending',
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // Create audit log
    await securityMiddleware.auditLog('KYC_SUBMISSION')(req, res, () => {});
    
    res.status(200).json({
      status: 'success',
      message: 'KYC information submitted successfully. Your identity verification is now pending review.'
    });
  } catch (error) {
    console.error('Error updating KYC information:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while updating KYC information'
    });
  }
};