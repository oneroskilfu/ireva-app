import { db } from '../db';
import { emailVerificationTokens, users } from '../../shared/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import crypto from 'crypto';
// Temporary inline email function to avoid import issues
async function sendEmail(params: any): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.log('SendGrid API key not configured. Email would be sent to:', params.to);
    console.log('Subject:', params.subject);
    console.log('Email sending will work once SENDGRID_API_KEY is provided.');
    return true; // Return true so the flow continues in development
  }

  try {
    const sgMail = await import('@sendgrid/mail');
    sgMail.default.setApiKey(apiKey);

    await sgMail.default.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });

    console.log('Email sent successfully to:', params.to);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export class EmailVerificationService {
  
  // Generate a verification token for a user
  static async createVerificationToken(userId: number, email: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

    await db.insert(emailVerificationTokens).values({
      token,
      userId,
      email,
      expiresAt
    });

    return token;
  }

  // Send verification email to user
  static async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${token}`;
    
    const emailContent = {
      to: email,
      from: process.env.FROM_EMAIL || 'noreply@ireva.ng',
      subject: 'Verify Your iREVA Account - Start Investing in Nigerian Real Estate',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your iREVA Account</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2E7D32, #4CAF50); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to iREVA</h1>
            <p style="color: #E8F5E8; margin: 10px 0 0 0; font-size: 16px;">Nigeria's Premier Real Estate Investment Platform</p>
          </div>
          
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #2E7D32; margin-top: 0;">Hello ${name}!</h2>
            
            <p>Thank you for joining iREVA, Nigeria's most trusted real estate investment platform. You're now part of a community of smart investors building wealth through verified property investments across Lagos, Abuja, Port Harcourt, and other major Nigerian cities.</p>
            
            <p>To start investing and access your investor dashboard, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #2E7D32; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify My Account</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 14px;">${verificationUrl}</p>
            
            <div style="background: #E8F5E8; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #2E7D32; margin-top: 0;">What's Next?</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Complete your KYC verification</li>
                <li>Browse verified property investments</li>
                <li>Start building your real estate portfolio</li>
                <li>Track your returns in real-time</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px;"><strong>Security Note:</strong> This verification link will expire in 24 hours for your security.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #666;">
              Need help? Contact our support team at <a href="mailto:support@ireva.ng" style="color: #2E7D32;">support@ireva.ng</a><br>
              This email was sent to ${email}. If you didn't create an iREVA account, please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 12px; color: #999;">
                © 2025 iREVA Platform. Building Nigeria's Real Estate Investment Future.<br>
                Lagos • Abuja • Port Harcourt • Kano
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to iREVA - Nigeria's Premier Real Estate Investment Platform!
        
        Hello ${name},
        
        Thank you for joining iREVA. To start investing in verified Nigerian real estate opportunities, please verify your email address.
        
        Click here to verify: ${verificationUrl}
        
        Or copy and paste this link into your browser: ${verificationUrl}
        
        What's next:
        - Complete your KYC verification
        - Browse verified property investments 
        - Start building your real estate portfolio
        - Track your returns in real-time
        
        This verification link expires in 24 hours for security.
        
        Need help? Contact support@ireva.ng
        
        © 2025 iREVA Platform
      `
    };

    return await sendEmail(emailContent);
  }

  // Verify a token and mark user as verified
  static async verifyToken(token: string): Promise<{ success: boolean; message: string; userId?: number }> {
    try {
      // Find valid token
      const tokenResult = await db
        .select({
          id: emailVerificationTokens.id,
          userId: emailVerificationTokens.userId,
          email: emailVerificationTokens.email,
          isUsed: emailVerificationTokens.isUsed,
          expiresAt: emailVerificationTokens.expiresAt
        })
        .from(emailVerificationTokens)
        .where(
          and(
            eq(emailVerificationTokens.token, token),
            eq(emailVerificationTokens.isUsed, false),
            gt(emailVerificationTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (tokenResult.length === 0) {
        return {
          success: false,
          message: 'Invalid or expired verification token'
        };
      }

      const tokenData = tokenResult[0];

      // Mark token as used
      await db
        .update(emailVerificationTokens)
        .set({
          isUsed: true,
          usedAt: new Date()
        })
        .where(eq(emailVerificationTokens.id, tokenData.id));

      // Mark user as verified
      await db
        .update(users)
        .set({
          isVerified: true,
          emailVerifiedAt: new Date()
        })
        .where(eq(users.id, tokenData.userId));

      return {
        success: true,
        message: 'Email verified successfully! Welcome to iREVA.',
        userId: tokenData.userId
      };

    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    }
  }

  // Resend verification email
  static async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find user by email
      const userResult = await db
        .select({
          id: users.id,
          name: users.name,
          isVerified: users.isVerified
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (userResult.length === 0) {
        return {
          success: false,
          message: 'No account found with this email address'
        };
      }

      const user = userResult[0];

      if (user.isVerified) {
        return {
          success: false,
          message: 'Account is already verified'
        };
      }

      // Create new verification token
      const token = await this.createVerificationToken(user.id, email);
      
      // Send verification email
      const emailSent = await this.sendVerificationEmail(email, user.name, token);
      
      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send verification email. Please try again later.'
        };
      }

      return {
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.'
      };

    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        message: 'Failed to resend verification email. Please try again.'
      };
    }
  }

  // Clean up expired tokens
  static async cleanupExpiredTokens(): Promise<number> {
    const result = await db
      .delete(emailVerificationTokens)
      .where(lt(emailVerificationTokens.expiresAt, new Date()))
      .returning({ id: emailVerificationTokens.id });

    return result.length;
  }
}