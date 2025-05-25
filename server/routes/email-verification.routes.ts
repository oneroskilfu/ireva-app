import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { EmailVerificationService } from '../services/email-verification.service';

/**
 * @swagger
 * /api/verify-email:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify user email address
 *     description: Verify a user's email address using the verification token sent via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Email verification token from the verification email
 *                 example: "abc123def456ghi789..."
 *     responses:
 *       200:
 *         description: Email verified successfully
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
 *                   example: "Email verified successfully! Welcome to iREVA."
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * 
 * /api/resend-verification:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend verification email
 *     description: Resend email verification link to the user's email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to send verification link to
 *                 example: "investor@example.com"
 *     responses:
 *       200:
 *         description: Verification email sent successfully
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
 *                   example: "Verification email sent successfully. Please check your inbox."
 *       400:
 *         description: Account already verified or email not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const router = Router();

// Schema for email verification
const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

// Schema for resend verification
const ResendVerificationSchema = z.object({
  email: z.string().email('Invalid email format')
});

// POST /api/verify-email - Verify email address
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = VerifyEmailSchema.parse(req.body);

    const result = await EmailVerificationService.verifyToken(token);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: result.message,
      data: {
        userId: result.userId
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

    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/resend-verification - Resend verification email
router.post('/resend-verification', async (req: Request, res: Response) => {
  try {
    const { email } = ResendVerificationSchema.parse(req.body);

    const result = await EmailVerificationService.resendVerificationEmail(email);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }

    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;