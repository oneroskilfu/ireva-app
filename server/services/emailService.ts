import { MailService } from '@sendgrid/mail';
import { User } from '../../shared/schema';

// Initialize SendGrid
const mailService = new MailService();

// Setting the API key (will be set when available)
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email templates for different KYC statuses
const EMAIL_TEMPLATES = {
  KYC_APPROVED: {
    subject: 'iREVA - Your KYC Has Been Approved!',
    html: (name: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>KYC Verification Approved</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Congratulations! Your Know Your Customer (KYC) verification has been approved.</p>
            <p>You now have full access to all investment opportunities on the iREVA platform. You can start investing in any available property that matches your investment goals.</p>
            <p>Visit your dashboard to explore the available investment opportunities:</p>
            <p style="text-align: center;">
              <a href="https://ireva.com/investor" class="button">Go to My Dashboard</a>
            </p>
            <p>If you have any questions about the investment process or need assistance, please don't hesitate to contact our support team.</p>
            <p>Thank you for choosing iREVA for your real estate investments!</p>
            <p>Best regards,<br>The iREVA Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} iREVA. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  KYC_REJECTED: {
    subject: 'iREVA - Action Required: Your KYC Submission Needs Attention',
    html: (name: string, reason: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
          .reason { background-color: #fff3f3; border-left: 4px solid #f44336; padding: 15px; margin: 15px 0; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>KYC Verification Needs Attention</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>We've reviewed your KYC submission and unfortunately, we were unable to verify your information at this time.</p>
            <div class="reason">
              <strong>Reason for rejection:</strong>
              <p>${reason}</p>
            </div>
            <p>Please update your KYC information with the correct details and submit again. Here are some tips:</p>
            <ul>
              <li>Ensure all personal information matches your identification documents</li>
              <li>Provide clear, legible images of your ID</li>
              <li>Double-check all bank account details</li>
            </ul>
            <p>You can update your KYC submission by visiting your account settings:</p>
            <p style="text-align: center;">
              <a href="https://ireva.com/investor/kyc" class="button">Update KYC Information</a>
            </p>
            <p>If you have any questions or need assistance with the verification process, our support team is ready to help.</p>
            <p>Thank you for your understanding and cooperation.</p>
            <p>Best regards,<br>The iREVA Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} iREVA. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },
  KYC_PENDING: {
    subject: 'iREVA - KYC Submission Received',
    html: (name: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
          .info-box { background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>KYC Submission Received</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for submitting your KYC (Know Your Customer) information on iREVA.</p>
            <div class="info-box">
              <strong>Your submission is currently under review.</strong>
              <p>This process typically takes 1-2 business days to complete.</p>
            </div>
            <p>During this time, our compliance team will verify the information you've provided. You'll receive another email once the verification process is complete.</p>
            <p>You can check the status of your KYC verification anytime by logging into your account and visiting the KYC section.</p>
            <p>If you have any questions about the verification process, please don't hesitate to contact our support team.</p>
            <p>Thank you for your patience and for choosing iREVA for your real estate investments!</p>
            <p>Best regards,<br>The iREVA Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} iREVA. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

/**
 * Interface for email parameters
 */
interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html: string;
}

/**
 * Sends an email using SendGrid
 * @param params Email parameters
 * @returns Promise<boolean> Success status
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key is not set');
      return false;
    }

    await mailService.send(params);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Sends a KYC approved notification email
 * @param user User object
 * @returns Promise<boolean> Success status
 */
export async function sendKYCApprovedEmail(user: User): Promise<boolean> {
  if (!user.email) {
    console.error('User email is not available');
    return false;
  }

  const fromEmail = process.env.FROM_EMAIL || 'support@ireva.com';
  const params: EmailParams = {
    to: user.email,
    from: fromEmail,
    subject: EMAIL_TEMPLATES.KYC_APPROVED.subject,
    html: EMAIL_TEMPLATES.KYC_APPROVED.html(user.username || 'Investor')
  };

  return sendEmail(params);
}

/**
 * Sends a KYC rejected notification email
 * @param user User object
 * @param rejectionReason Reason for rejection
 * @returns Promise<boolean> Success status
 */
export async function sendKYCRejectedEmail(user: User, rejectionReason: string): Promise<boolean> {
  if (!user.email) {
    console.error('User email is not available');
    return false;
  }

  const fromEmail = process.env.FROM_EMAIL || 'support@ireva.com';
  const params: EmailParams = {
    to: user.email,
    from: fromEmail,
    subject: EMAIL_TEMPLATES.KYC_REJECTED.subject,
    html: EMAIL_TEMPLATES.KYC_REJECTED.html(user.username || 'Investor', rejectionReason)
  };

  return sendEmail(params);
}

/**
 * Sends a KYC pending notification email
 * @param user User object
 * @returns Promise<boolean> Success status
 */
export async function sendKYCPendingEmail(user: User): Promise<boolean> {
  if (!user.email) {
    console.error('User email is not available');
    return false;
  }

  const fromEmail = process.env.FROM_EMAIL || 'support@ireva.com';
  const params: EmailParams = {
    to: user.email,
    from: fromEmail,
    subject: EMAIL_TEMPLATES.KYC_PENDING.subject,
    html: EMAIL_TEMPLATES.KYC_PENDING.html(user.username || 'Investor')
  };

  return sendEmail(params);
}

export default {
  sendEmail,
  sendKYCApprovedEmail,
  sendKYCRejectedEmail,
  sendKYCPendingEmail
};