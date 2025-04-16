import { MailService } from '@sendgrid/mail';
import { User, Notification, Property, Investment } from '../../shared/schema';

// Initialize the SendGrid mail service
const mailService = new MailService();

// Check if SendGrid API key is set
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY is not set. Email notifications will not be sent.');
} else {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

// Base email parameters
interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  attachments?: any[];
  category?: string;
}

// Send email wrapper function
export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('Cannot send email: SENDGRID_API_KEY is not set');
    return false;
  }

  try {
    // Convert to SendGrid's required format
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
      templateId: params.templateId,
      dynamicTemplateData: params.dynamicTemplateData,
      attachments: params.attachments,
      category: params.category
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Send welcome email
export async function sendWelcomeEmail(user: User): Promise<boolean> {
  return sendEmail({
    to: user.email,
    from: 'noreply@ireva.com',
    subject: 'Welcome to iREVA - Your Real Estate Investment Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">Welcome to iREVA</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; background-color: #ffffff;">
          <p>Hello ${user.firstName || user.username},</p>
          <p>Welcome to iREVA, your trusted platform for real estate investments in Africa.</p>
          <p>To get started:</p>
          <ol>
            <li>Complete your profile</li>
            <li>Verify your identity (KYC)</li>
            <li>Explore investment opportunities</li>
          </ol>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ireva.com/dashboard" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Go to Dashboard</a>
          </div>
          <p>If you have any questions, please contact our support team at support@ireva.com</p>
          <p>Best regards,</p>
          <p>The iREVA Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666666;">
          <p>&copy; ${new Date().getFullYear()} iREVA. All rights reserved.</p>
          <p>Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    `
  });
}

// Send KYC submission confirmation email
export async function sendKycSubmissionEmail(user: User): Promise<boolean> {
  return sendEmail({
    to: user.email,
    from: 'noreply@ireva.com',
    subject: 'KYC Verification Submitted - iREVA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">KYC Verification</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; background-color: #ffffff;">
          <p>Hello ${user.firstName || user.username},</p>
          <p>We have received your KYC verification documents. Our team will review them shortly.</p>
          <p>This process typically takes 1-2 business days. We'll notify you once the verification is complete.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ireva.com/dashboard" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Check Status</a>
          </div>
          <p>If you have any questions, please contact our support team at support@ireva.com</p>
          <p>Best regards,</p>
          <p>The iREVA Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666666;">
          <p>&copy; ${new Date().getFullYear()} iREVA. All rights reserved.</p>
          <p>Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    `
  });
}

// Send KYC verification status email
export async function sendKycVerificationStatusEmail(user: User, status: 'verified' | 'rejected', rejectionReason?: string): Promise<boolean> {
  const subject = status === 'verified' 
    ? 'KYC Verification Approved - iREVA' 
    : 'KYC Verification Requires Attention - iREVA';
  
  const content = status === 'verified'
    ? `
      <p>Hello ${user.firstName || user.username},</p>
      <p>Congratulations! Your KYC verification has been approved.</p>
      <p>You now have full access to all investment opportunities on the iREVA platform.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://ireva.com/properties" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Explore Properties</a>
      </div>
    `
    : `
      <p>Hello ${user.firstName || user.username},</p>
      <p>We've reviewed your KYC submission and need additional information or corrections.</p>
      <p><strong>Reason:</strong> ${rejectionReason || 'Please check your KYC submission for details.'}</p>
      <p>Please update your submission with the correct information.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://ireva.com/kyc" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Update KYC</a>
      </div>
    `;

  return sendEmail({
    to: user.email,
    from: 'noreply@ireva.com',
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">KYC Verification Update</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; background-color: #ffffff;">
          ${content}
          <p>If you have any questions, please contact our support team at support@ireva.com</p>
          <p>Best regards,</p>
          <p>The iREVA Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666666;">
          <p>&copy; ${new Date().getFullYear()} iREVA. All rights reserved.</p>
          <p>Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    `
  });
}

// Send investment confirmation email
export async function sendInvestmentConfirmationEmail(user: User, property: Property, investment: Investment): Promise<boolean> {
  return sendEmail({
    to: user.email,
    from: 'noreply@ireva.com',
    subject: `Investment Confirmation - ${property.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">Investment Confirmation</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; background-color: #ffffff;">
          <p>Hello ${user.firstName || user.username},</p>
          <p>Congratulations on your investment in <strong>${property.name}</strong>!</p>
          <p>Here's a summary of your investment:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Property:</strong> ${property.name}</p>
            <p><strong>Location:</strong> ${property.location}</p>
            <p><strong>Investment Amount:</strong> ₦${investment.amount.toLocaleString()}</p>
            <p><strong>Expected Return:</strong> ${property.targetReturn}%</p>
            <p><strong>Term:</strong> ${property.term} months</p>
            <p><strong>Investment Date:</strong> ${investment.date.toLocaleDateString()}</p>
          </div>
          <p>You can track your investment performance in your dashboard:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ireva.com/investments/${investment.id}" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Track Investment</a>
          </div>
          <p>If you have any questions, please contact our support team at support@ireva.com</p>
          <p>Best regards,</p>
          <p>The iREVA Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666666;">
          <p>&copy; ${new Date().getFullYear()} iREVA. All rights reserved.</p>
          <p>Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    `
  });
}

// Send monthly returns update email
export async function sendMonthlyReturnsEmail(user: User, investment: Investment, property: Property, monthlyReturn: number): Promise<boolean> {
  return sendEmail({
    to: user.email,
    from: 'noreply@ireva.com',
    subject: `Monthly Returns Update - ${property.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">Monthly Returns Update</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; background-color: #ffffff;">
          <p>Hello ${user.firstName || user.username},</p>
          <p>We're pleased to provide an update on your investment in <strong>${property.name}</strong>.</p>
          <p>Your monthly return has been processed:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Property:</strong> ${property.name}</p>
            <p><strong>Monthly Return:</strong> ₦${monthlyReturn.toLocaleString()}</p>
            <p><strong>Return Rate:</strong> ${property.targetReturn}%</p>
            <p><strong>Total Returns to Date:</strong> ₦${investment.earnings.toLocaleString()}</p>
          </div>
          <p>View your complete investment performance in your dashboard:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ireva.com/investments/${investment.id}" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">View Performance</a>
          </div>
          <p>If you have any questions, please contact our support team at support@ireva.com</p>
          <p>Best regards,</p>
          <p>The iREVA Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666666;">
          <p>&copy; ${new Date().getFullYear()} iREVA. All rights reserved.</p>
          <p>Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    `
  });
}

// Send new property notification email
export async function sendNewPropertyEmail(user: User, property: Property): Promise<boolean> {
  return sendEmail({
    to: user.email,
    from: 'noreply@ireva.com',
    subject: `New Investment Opportunity - ${property.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">New Investment Opportunity</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; background-color: #ffffff;">
          <p>Hello ${user.firstName || user.username},</p>
          <p>We're excited to introduce a new investment opportunity that matches your preferences.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h2 style="margin-top: 0;">${property.name}</h2>
            <p><strong>Location:</strong> ${property.location}</p>
            <p><strong>Type:</strong> ${property.type}</p>
            <p><strong>Target Return:</strong> ${property.targetReturn}%</p>
            <p><strong>Minimum Investment:</strong> ₦${property.minimumInvestment.toLocaleString()}</p>
            <p><strong>Term:</strong> ${property.term} months</p>
            <p>${property.description.substring(0, 200)}${property.description.length > 200 ? '...' : ''}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ireva.com/properties/${property.id}" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">View Property</a>
          </div>
          <p>Don't miss this opportunity!</p>
          <p>Best regards,</p>
          <p>The iREVA Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666666;">
          <p>&copy; ${new Date().getFullYear()} iREVA. All rights reserved.</p>
          <p>Victoria Island, Lagos, Nigeria</p>
          <p><small>If you would like to unsubscribe from these notifications, please update your <a href="https://ireva.com/settings">notification preferences</a>.</small></p>
        </div>
      </div>
    `
  });
}

// Send investment performance alert email
export async function sendPerformanceAlertEmail(user: User, property: Property, message: string): Promise<boolean> {
  return sendEmail({
    to: user.email,
    from: 'noreply@ireva.com',
    subject: `Performance Alert - ${property.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">Investment Performance Alert</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; background-color: #ffffff;">
          <p>Hello ${user.firstName || user.username},</p>
          <p>We have an important update regarding your investment in <strong>${property.name}</strong>.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Performance Update</h3>
            <p>${message}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ireva.com/properties/${property.id}" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">View Details</a>
          </div>
          <p>If you have any questions or concerns, please contact our support team at support@ireva.com</p>
          <p>Best regards,</p>
          <p>The iREVA Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666666;">
          <p>&copy; ${new Date().getFullYear()} iREVA. All rights reserved.</p>
          <p>Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    `
  });
}

// KYC-related email notifications

// KYC Pending Email
export async function sendKYCPendingEmail(user: User): Promise<boolean> {
  return sendEmail({
    to: user.email,
    from: 'noreply@ireva.com',
    subject: 'KYC Verification Submitted - iREVA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">KYC Verification</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; background-color: #ffffff;">
          <p>Hello ${user.firstName || user.username},</p>
          <p>We have received your KYC verification documents. Our team will review them shortly.</p>
          <p>This process typically takes 1-2 business days. We'll notify you once the verification is complete.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ireva.com/dashboard" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Check Status</a>
          </div>
          <p>If you have any questions, please contact our support team at support@ireva.com</p>
          <p>Best regards,</p>
          <p>The iREVA Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666666;">
          <p>&copy; ${new Date().getFullYear()} iREVA. All rights reserved.</p>
          <p>Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    `
  });
}

// KYC Approved Email
export async function sendKYCApprovedEmail(user: User): Promise<boolean> {
  return sendEmail({
    to: user.email,
    from: 'noreply@ireva.com',
    subject: 'KYC Verification Approved - iREVA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">KYC Verification Approved</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; background-color: #ffffff;">
          <p>Hello ${user.firstName || user.username},</p>
          <p>Congratulations! Your KYC verification has been approved.</p>
          <p>You now have full access to all investment opportunities on the iREVA platform.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ireva.com/properties" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Explore Properties</a>
          </div>
          <p>If you have any questions, please contact our support team at support@ireva.com</p>
          <p>Best regards,</p>
          <p>The iREVA Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666666;">
          <p>&copy; ${new Date().getFullYear()} iREVA. All rights reserved.</p>
          <p>Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    `
  });
}

// KYC Rejected Email
export async function sendKYCRejectedEmail(user: User, rejectionReason: string): Promise<boolean> {
  return sendEmail({
    to: user.email,
    from: 'noreply@ireva.com',
    subject: 'KYC Verification Requires Attention - iREVA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">KYC Verification Update</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; background-color: #ffffff;">
          <p>Hello ${user.firstName || user.username},</p>
          <p>We've reviewed your KYC submission and need additional information or corrections.</p>
          <p><strong>Reason:</strong> ${rejectionReason || 'Please check your KYC submission for details.'}</p>
          <p>Please update your submission with the correct information.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ireva.com/kyc" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">Update KYC</a>
          </div>
          <p>If you have any questions, please contact our support team at support@ireva.com</p>
          <p>Best regards,</p>
          <p>The iREVA Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666666;">
          <p>&copy; ${new Date().getFullYear()} iREVA. All rights reserved.</p>
          <p>Victoria Island, Lagos, Nigeria</p>
        </div>
      </div>
    `
  });
}

// Send notification as email
export async function sendNotificationEmail(user: User, notification: Notification): Promise<boolean> {
  return sendEmail({
    to: user.email,
    from: 'noreply@ireva.com',
    subject: notification.title,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0;">${notification.title}</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e9e9e9; background-color: #ffffff;">
          <p>Hello ${user.firstName || user.username},</p>
          <p>${notification.message}</p>
          ${notification.link ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${notification.link}" style="background-color: #4F46E5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold;">View Details</a>
          </div>
          ` : ''}
          <p>Best regards,</p>
          <p>The iREVA Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666666;">
          <p>&copy; ${new Date().getFullYear()} iREVA. All rights reserved.</p>
          <p>Victoria Island, Lagos, Nigeria</p>
          <p><small>If you would like to unsubscribe from these notifications, please update your <a href="https://ireva.com/settings">notification preferences</a>.</small></p>
        </div>
      </div>
    `
  });
}