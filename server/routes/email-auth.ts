import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { storage } from '../storage';

const router = express.Router();

// Email verification endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const { userId, email, type } = decoded as any;

    if (type !== 'email_verification') {
      return res.status(400).json({ message: 'Invalid token type' });
    }

    // Get user and verify email matches
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email !== email) {
      return res.status(400).json({ message: 'Email verification failed' });
    }

    if (user.isVerified) {
      return res.status(200).json({ 
        message: 'Email already verified',
        verified: true 
      });
    }

    // Mark user as verified
    await storage.updateUserVerification(userId, true);

    res.json({
      message: 'Email verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate verification token
    const verificationToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        type: 'email_verification' 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Store verification attempt
    await storage.createVerificationAttempt({
      userId: user.id,
      email: user.email,
      token: verificationToken,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // In production, send email via email service
    console.log(`Verification email would be sent to ${email} with token: ${verificationToken}`);

    res.json({
      message: 'Verification email sent successfully',
      // Include token in response for testing (remove in production)
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await storage.createPasswordResetToken({
      userId: user.id,
      email: user.email,
      token: resetToken,
      expiresAt: resetTokenExpiry
    });

    // In production, send email via email service
    console.log(`Password reset email would be sent to ${email} with token: ${resetToken}`);

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent',
      // Include token in response for testing (remove in production)
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verify reset token
    const resetAttempt = await storage.getPasswordResetToken(token);
    if (!resetAttempt) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (new Date() > resetAttempt.expiresAt) {
      await storage.deletePasswordResetToken(token);
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Get user
    const user = await storage.getUser(resetAttempt.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await storage.updateUserPassword(user.id, hashedPassword);

    // Delete used reset token
    await storage.deletePasswordResetToken(token);

    // Invalidate all existing sessions for security
    await storage.invalidateUserSessions(user.id);

    res.json({
      message: 'Password reset successfully',
      success: true
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Change password (for authenticated users)
router.post('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header required' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const userId = (decoded as any).id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is different
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from current password' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await storage.updateUserPassword(userId, hashedPassword);

    res.json({
      message: 'Password changed successfully',
      success: true
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Check reset token validity
router.get('/reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const resetAttempt = await storage.getPasswordResetToken(token);
    if (!resetAttempt) {
      return res.status(400).json({ valid: false, message: 'Invalid reset token' });
    }

    if (new Date() > resetAttempt.expiresAt) {
      await storage.deletePasswordResetToken(token);
      return res.status(400).json({ valid: false, message: 'Reset token has expired' });
    }

    res.json({
      valid: true,
      email: resetAttempt.email,
      expiresAt: resetAttempt.expiresAt
    });

  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ valid: false, message: 'Failed to validate token' });
  }
});

export default router;