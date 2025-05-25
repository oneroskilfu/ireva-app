import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { RefreshTokenService } from '../services/refresh-token.service';
import { signAccessToken, verifyRefreshToken } from '../utils/jwt';

const router = Router();

// Schema for refresh token request
const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

// POST /api/refresh-token - Get new access token using refresh token
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);

    // Validate the refresh token in database
    const tokenData = await RefreshTokenService.validateRefreshToken(refreshToken);
    
    if (!tokenData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = signAccessToken({
      userId: tokenData.userId,
      email: tokenData.email,
      role: tokenData.role
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        // Optionally rotate refresh token for enhanced security
        refreshToken: refreshToken // Keep same refresh token for now
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/logout - Revoke refresh token (logout)
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);

    // Revoke the refresh token
    await RefreshTokenService.revokeRefreshToken(refreshToken);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }

    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/logout-all - Revoke all refresh tokens for user (logout all devices)
router.post('/logout-all', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);

    // First validate the refresh token to get user ID
    const tokenData = await RefreshTokenService.validateRefreshToken(refreshToken);
    
    if (!tokenData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Revoke all tokens for this user
    await RefreshTokenService.revokeAllUserTokens(tokenData.userId);

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }

    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;