import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { RefreshTokenService } from '../services/refresh-token.service';
import { signAccessToken, verifyRefreshToken } from '../utils/jwt';

/**
 * @swagger
 * /api/refresh-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: Get a new access token using a valid refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *                 example: "abc123def456..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       example: "abc123def456..."
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Revoke refresh token and logout user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to revoke
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 * 
 * /api/logout-all:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout from all devices
 *     description: Revoke all refresh tokens for the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Any valid refresh token for the user
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out from all devices successfully"
 */

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