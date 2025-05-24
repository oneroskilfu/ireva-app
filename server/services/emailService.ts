import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Create a transporter using environment variables
const createTransporter = () => {
  // Use the authenticated email service
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.IREVA_EMAIL,
      pass: process.env.IREVA_EMAIL_PASS
    }
  });
};

/**
 * Send an email using nodemailer
 * @param options - Email options (to, subject, text/html)
 * @returns Promise resolving to send info
 */
export const sendEmail = async (options: EmailOptions) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `iREVA Investments <${process.env.IREVA_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error: any) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send a test email to verify configuration
 * @param email - Recipient email address
 */
export const sendTestEmail = async (email: string) => {
  return sendEmail({
    to: email,
    subject: 'iREVA Email Service Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="background-color: #1a237e; padding: 10px; border-radius: 4px;">
          <h1 style="color: white; margin: 0; text-align: center;">iREVA</h1>
        </div>
        <div style="padding: 20px 0;">
          <h2>Email Service Test</h2>
          <p>This is a test email from the iREVA platform.</p>
          <p>If you're receiving this email, it means our email service is working correctly.</p>
          <p>No action is required from your side.</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; font-size: 12px; color: #757575;">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} iREVA. All rights reserved.</p>
        </div>
      </div>
    `
  });
};

/**
 * Validate an email address format
 * @param email - Email address to validate
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};