const nodemailer = require('nodemailer');

// Check if email configuration is available
const isEmailConfigured = () => {
  return process.env.MAIL_USER && process.env.MAIL_PASS;
};

// Create transporter
const createTransporter = () => {
  if (!isEmailConfigured()) {
    console.warn('Email service not configured. Set MAIL_USER and MAIL_PASS environment variables.');
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail', // or your preferred email provider
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    }
  });
};

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @returns {Promise<boolean>} Success status
 */
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;
    
    const mailOptions = {
      from: `"iREVA Platform" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send ROI distribution notification to investor
 * @param {Object} user - User object with email
 * @param {Object} distribution - ROI distribution details
 * @param {Object} project - Project details
 * @returns {Promise<boolean>} Success status
 */
const sendROINotification = async (user, distribution, project) => {
  if (!user.email) {
    console.warn('Cannot send ROI notification: User has no email address');
    return false;
  }
  
  const subject = `ROI Distribution: ${project.name}`;
  
  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(distribution.amount);
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #3a3a3a; margin-bottom: 5px;">ROI Distribution Notification</h1>
        <p style="color: #666; font-size: 16px;">Your investment is generating returns!</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #2d8259; margin-top: 0;">Distribution Summary</h2>
        <p><strong>Project:</strong> ${project.name}</p>
        <p><strong>Amount:</strong> ${formattedAmount}</p>
        <p><strong>Distribution Date:</strong> ${new Date(distribution.distributionDate).toLocaleDateString()}</p>
        <p><strong>ROI Rate:</strong> ${distribution.roiPercentage}%</p>
        <p><strong>Reference:</strong> ${distribution.transactionReference || 'N/A'}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p>This amount has been credited to your iREVA wallet. You can view the complete details in your investment dashboard.</p>
        <p>Thank you for investing with iREVA!</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
        <p style="color: #888; font-size: 12px;">
          &copy; ${new Date().getFullYear()} iREVA Platform. All rights reserved.<br>
          This is an automated message, please do not reply.
        </p>
      </div>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
};

module.exports = {
  sendEmail,
  sendROINotification,
  isEmailConfigured
};