import nodemailer from 'nodemailer';
import { User } from '../../shared/schema';

// Check if environment variables are set
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.EMAIL_PASSWORD;

// Create transporter object using Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL,
    pass: PASSWORD
  }
});

/**
 * Send a generic email
 * 
 * @param to Recipient email address
 * @param subject Email subject
 * @param html Email HTML content
 * @returns Promise with send info
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<any> {
  try {
    if (!EMAIL || !PASSWORD) {
      console.warn('EMAIL or EMAIL_PASSWORD environment variables are not set. Email will not be sent.');
      return null;
    }

    const mailOptions = {
      from: `"iREVA Platform" <${EMAIL}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send a welcome email to new users
 * 
 * @param user User object
 * @returns Promise with send info
 */
export async function sendWelcomeEmail(user: User): Promise<any> {
  const subject = 'Welcome to iREVA - Your Real Estate Investment Platform';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2C3E50;">Welcome to iREVA!</h1>
      </div>
      <div style="margin-bottom: 20px;">
        <p>Hello ${user.firstName || user.username},</p>
        <p>Thank you for joining iREVA, your premier platform for real estate investments in Africa.</p>
        <p>Here's what you can do now:</p>
        <ul>
          <li>Complete your KYC verification to unlock all investment opportunities</li>
          <li>Explore available properties in our marketplace</li>
          <li>Set up your investment preferences</li>
          <li>Browse educational resources to learn more about real estate investing</li>
        </ul>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold;">Get Started:</p>
        <p style="margin: 10px 0 0;">Log in to your account and complete your KYC verification to start investing.</p>
      </div>
      
/**
 * Send investment confirmation email
 * 
 * @param user User object
 * @param property Property object
 * @param investment Investment details
 * @returns Promise with send info
 */
export async function sendInvestmentConfirmationEmail(user: User, property: any, investment: any): Promise<any> {
  const subject = 'iREVA - Investment Confirmation';
  const formattedAmount = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(investment.amount);
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2C3E50;">Investment Confirmation</h1>
      </div>
      <div style="margin-bottom: 20px;">
        <p>Hello ${user.firstName || user.username},</p>
        <p>Thank you for your investment! Here's a confirmation of your transaction:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2C3E50;">Investment Details</h3>
          <p style="margin: 5px 0;"><strong>Property:</strong> ${property.name}</p>
          <p style="margin: 5px 0;"><strong>Location:</strong> ${property.location}</p>
          <p style="margin: 5px 0;"><strong>Amount Invested:</strong> ${formattedAmount}</p>
          <p style="margin: 5px 0;"><strong>Investment Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${investment.id}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${investment.status.toUpperCase()}</p>
          <p style="margin: 5px 0;"><strong>Expected Return:</strong> ${property.targetReturn}%</p>
          <p style="margin: 5px 0;"><strong>Maturity Period:</strong> ${property.term} months</p>
        </div>
        
        <p>You can track the performance of your investment in your dashboard under the Portfolio section.</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold;">Next Steps:</p>
        <p style="margin: 10px 0 0;">Login to your account to view detailed investment information, track returns, and explore more investment opportunities.</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #777; font-size: 12px;">
          &copy; ${new Date().getFullYear()} iREVA. All rights reserved.<br>
          If you have any questions, please contact our support team at support@ireva.com
        </p>
      </div>
    </div>
  `;
  
  return await sendEmail(user.email, subject, html);
}
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #777; font-size: 12px;">
          &copy; ${new Date().getFullYear()} iREVA. All rights reserved.<br>
          If you have any questions, please contact our support team at support@ireva.com
        </p>
      </div>
    </div>
  `;

  return sendEmail(user.email, subject, html);
}

/**
 * Send KYC submission confirmation email
 * 
 * @param user User object
 * @returns Promise with send info
 */
export async function sendKYCPendingEmail(user: User): Promise<any> {
  const subject = 'iREVA - KYC Verification Submitted';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2C3E50;">KYC Submission Received</h1>
      </div>
      <div style="margin-bottom: 20px;">
        <p>Hello ${user.firstName || user.username},</p>
        <p>We have received your KYC (Know Your Customer) verification documents. Our team will review your submission shortly.</p>
        <p>The verification process typically takes 1-2 business days. You will receive an email notification once your verification is complete.</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold;">What's Next?</p>
        <p style="margin: 10px 0 0;">While waiting for verification, you can explore available properties in our marketplace. Once verified, you'll be able to invest in these opportunities.</p>
      </div>
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #777; font-size: 12px;">
          &copy; ${new Date().getFullYear()} iREVA. All rights reserved.<br>
          If you have any questions, please contact our support team at support@ireva.com
        </p>
      </div>
    </div>
  `;

  return sendEmail(user.email, subject, html);
}

/**
 * Send KYC approval email
 * 
 * @param user User object
 * @returns Promise with send info
 */
export async function sendKYCApprovedEmail(user: User): Promise<any> {
  const subject = 'iREVA - KYC Verification Approved';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2C3E50;">KYC Verification Approved</h1>
      </div>
      <div style="margin-bottom: 20px;">
        <p>Hello ${user.firstName || user.username},</p>
        <p>Congratulations! Your KYC verification has been approved.</p>
        <p>You now have full access to all investment opportunities on the iREVA platform. Start exploring and investing in properties that match your investment goals.</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold;">Get Started Investing:</p>
        <p style="margin: 10px 0 0;">Browse available properties, analyze returns, and make your first investment today!</p>
      </div>
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #777; font-size: 12px;">
          &copy; ${new Date().getFullYear()} iREVA. All rights reserved.<br>
          If you have any questions, please contact our support team at support@ireva.com
        </p>
      </div>
    </div>
  `;

  return sendEmail(user.email, subject, html);
}

/**
 * Send KYC rejection email
 * 
 * @param user User object
 * @param rejectionReason Reason for rejection
 * @returns Promise with send info
 */
export async function sendKYCRejectedEmail(user: User, rejectionReason: string): Promise<any> {
  const subject = 'iREVA - KYC Verification Needs Attention';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2C3E50;">KYC Verification Update</h1>
      </div>
      <div style="margin-bottom: 20px;">
        <p>Hello ${user.firstName || user.username},</p>
        <p>We've reviewed your KYC submission and need additional information or corrections.</p>
        <p><strong>Reason:</strong> ${rejectionReason}</p>
        <p>Please log in to your account, review the feedback, and resubmit your KYC documents with the necessary corrections.</p>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold;">Next Steps:</p>
        <p style="margin: 10px 0 0;">Log in to your account and navigate to the KYC verification section to resubmit your information.</p>
      </div>
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #777; font-size: 12px;">
          &copy; ${new Date().getFullYear()} iREVA. All rights reserved.<br>
          If you have any questions, please contact our support team at support@ireva.com
        </p>
      </div>
    </div>
  `;

  return sendEmail(user.email, subject, html);
}

/**
 * Send investment confirmation email
 * 
 * @param user User object
 * @param property Property object
 * @param investment Investment object
 * @returns Promise with send info
 */
export async function sendInvestmentConfirmationEmail(user: User, property: any, investment: any): Promise<any> {
  const subject = 'iREVA - Investment Confirmation';
  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(investment.amount);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2C3E50;">Investment Confirmation</h1>
      </div>
      <div style="margin-bottom: 20px;">
        <p>Hello ${user.firstName || user.username},</p>
        <p>Your investment of ${formattedAmount} in <strong>${property.name}</strong> has been successfully processed.</p>
        <p><strong>Investment Details:</strong></p>
        <ul>
          <li>Property: ${property.name}</li>
          <li>Location: ${property.location}</li>
          <li>Amount: ${formattedAmount}</li>
          <li>Date: ${new Date(investment.date).toLocaleDateString()}</li>
          <li>Expected Annual Return: ${property.targetReturn}%</li>
          <li>Investment Term: ${property.term} months</li>
        </ul>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold;">Track Your Investment:</p>
        <p style="margin: 10px 0 0;">You can track the performance of your investment in your dashboard, where you'll see real-time updates on returns and property value.</p>
      </div>
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #777; font-size: 12px;">
          &copy; ${new Date().getFullYear()} iREVA. All rights reserved.<br>
          If you have any questions, please contact our support team at support@ireva.com
        </p>
      </div>
    </div>
  `;

  return sendEmail(user.email, subject, html);
}

/**
 * Send monthly returns update email
 * 
 * @param user User object
 * @param investment Investment object
 * @param property Property object
 * @param monthlyReturn Monthly return amount
 * @returns Promise with send info
 */
export async function sendMonthlyReturnsEmail(user: User, investment: any, property: any, monthlyReturn: number): Promise<any> {
  const subject = 'iREVA - Monthly Investment Return Update';
  const formattedMonthlyReturn = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(monthlyReturn);
  
  const formattedTotalEarnings = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(investment.earnings);

  const formattedInvestmentAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(investment.amount);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #2C3E50;">Monthly Return Update</h1>
      </div>
      <div style="margin-bottom: 20px;">
        <p>Hello ${user.firstName || user.username},</p>
        <p>Good news! Your investment in <strong>${property.name}</strong> has generated returns for this month.</p>
        <p><strong>Return Details:</strong></p>
        <ul>
          <li>Property: ${property.name}</li>
          <li>Monthly Return: ${formattedMonthlyReturn}</li>
          <li>Total Earnings to Date: ${formattedTotalEarnings}</li>
          <li>Original Investment: ${formattedInvestmentAmount}</li>
          <li>Current ROI: ${((investment.earnings / investment.amount) * 100).toFixed(2)}%</li>
        </ul>
      </div>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 0; font-weight: bold;">Track Your Investment:</p>
        <p style="margin: 10px 0 0;">You can view detailed analytics and performance history on your investor dashboard.</p>
      </div>
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #777; font-size: 12px;">
          &copy; ${new Date().getFullYear()} iREVA. All rights reserved.<br>
          If you have any questions, please contact our support team at support@ireva.com
        </p>
      </div>
    </div>
  `;

  return sendEmail(user.email, subject, html);
}

// Export all functions
export default {
  sendEmail,
  sendWelcomeEmail,
  sendKYCPendingEmail,
  sendKYCApprovedEmail,
  sendKYCRejectedEmail,
  sendInvestmentConfirmationEmail,
  sendMonthlyReturnsEmail
};