import nodemailer from 'nodemailer';

// Check for configured email credentials
const emailConfigured = process.env.IREVA_EMAIL && process.env.IREVA_EMAIL_PASS;

// Create email transporter
const transporter = emailConfigured 
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.IREVA_EMAIL,
        pass: process.env.IREVA_EMAIL_PASS
      }
    })
  : null;

// Log email configuration status
if (transporter) {
  console.log('Email service initialized with Gmail');
} else {
  console.log('IREVA_EMAIL or IREVA_EMAIL_PASS not set. Email sending is disabled.');
}

/**
 * Send email to a user
 */
export const sendEmail = async (to: string, subject: string, text: string, html?: string): Promise<boolean> => {
  // Skip if email service is not configured
  if (!transporter) {
    console.log('Email sending skipped: Email service not configured');
    return false;
  }
  
  try {
    const mailOptions = {
      from: process.env.IREVA_EMAIL,
      to,
      subject,
      text,
      html: html || text
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send notification email to admin
 */
export const sendAdminEmail = async (to: string, subject: string, text: string): Promise<boolean> => {
  return sendEmail(
    to,
    `[iREVA Admin] ${subject}`,
    text
  );
};

/**
 * Send ROI distribution notification to investor
 */
export const sendROINotification = async (
  to: string, 
  amount: string, 
  propertyName: string, 
  investmentId: string
): Promise<boolean> => {
  const subject = `ROI Payment Received: ${propertyName}`;
  
  const text = `
    Dear Investor,
    
    We are pleased to inform you that an ROI payment has been credited to your iREVA wallet.
    
    Property: ${propertyName}
    Amount: ${amount}
    
    You can view the details of this payment in your iREVA dashboard.
    
    Thank you for investing with iREVA.
    
    Best regards,
    The iREVA Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">ROI Payment Received</h2>
      <p>Dear Investor,</p>
      <p>We are pleased to inform you that an ROI payment has been credited to your iREVA wallet.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Property:</strong> ${propertyName}</p>
        <p><strong>Amount:</strong> ${amount}</p>
      </div>
      
      <p>You can view the details of this payment in your <a href="${process.env.APP_URL || 'https://ireva.app'}/investments/${investmentId}">iREVA dashboard</a>.</p>
      
      <p>Thank you for investing with iREVA.</p>
      
      <p>Best regards,<br>
      The iREVA Team</p>
    </div>
  `;
  
  return sendEmail(to, subject, text, html);
};

/**
 * Send investment maturity notification to investor
 */
export const sendMaturityNotification = async (
  to: string,
  propertyName: string,
  investmentAmount: string,
  maturityDate: string,
  investmentId: string
): Promise<boolean> => {
  const subject = `Investment Matured: ${propertyName}`;
  
  const text = `
    Dear Investor,
    
    Your investment in ${propertyName} has matured as of ${maturityDate}.
    
    Investment Amount: ${investmentAmount}
    
    Please log in to your iREVA dashboard to view the ROI details and manage your matured investment.
    
    Thank you for investing with iREVA.
    
    Best regards,
    The iREVA Team
  `;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Investment Matured</h2>
      <p>Dear Investor,</p>
      <p>Your investment in <strong>${propertyName}</strong> has matured as of <strong>${maturityDate}</strong>.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Investment Amount:</strong> ${investmentAmount}</p>
      </div>
      
      <p>Please log in to your <a href="${process.env.APP_URL || 'https://ireva.app'}/investments/${investmentId}">iREVA dashboard</a> to view the ROI details and manage your matured investment.</p>
      
      <p>Thank you for investing with iREVA.</p>
      
      <p>Best regards,<br>
      The iREVA Team</p>
    </div>
  `;
  
  return sendEmail(to, subject, text, html);
};