import nodemailer from 'nodemailer';

// Initialize nodemailer transporter
let transporter: nodemailer.Transporter | null = null;

if (process.env.IREVA_EMAIL && process.env.IREVA_EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.IREVA_EMAIL,
      pass: process.env.IREVA_EMAIL_PASS
    }
  });
  console.log('Nodemailer initialized with Gmail');
} else {
  console.log('IREVA_EMAIL or IREVA_EMAIL_PASS not set. Nodemailer is disabled.');
}

/**
 * Send an email using nodemailer
 * @param to Recipient email address
 * @param subject Email subject
 * @param text Plain text email content
 * @param html HTML email content (optional)
 * @returns Promise resolving to nodemailer send result
 */
export async function sendEmail(
  to: string, 
  subject: string, 
  text: string,
  html?: string
): Promise<boolean> {
  if (!transporter) {
    console.log(`Email sending disabled. Would have sent to ${to}: ${subject}`);
    return false;
  }

  try {
    const mailOptions = { 
      from: process.env.IREVA_EMAIL, 
      to, 
      subject, 
      text,
      html
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Check if nodemailer is configured and available
 * @returns boolean indicating if nodemailer is available
 */
export function isNodemailerAvailable(): boolean {
  return transporter !== null;
}