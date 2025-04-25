import { MailService } from '@sendgrid/mail';
import { User, WithdrawalRequest } from '@shared/schema';
import { formatCurrency } from '../utils/formatters';
import { sendEmail as sendNodemailerEmail, isNodemailerAvailable } from '../utils/nodemailer';

// Initialize SendGrid service
const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid API key configured successfully');
} else {
  console.log('SENDGRID_API_KEY is not set. Email sending via SendGrid is disabled.');
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private from: string;
  private isSendGridEnabled: boolean;
  private isNodemailerEnabled: boolean;
  private preferNodemailer: boolean;

  constructor() {
    // Use the provided email for 'from' address or fallback
    this.from = process.env.IREVA_EMAIL || 'ireva.investments@gmail.com';
    this.isSendGridEnabled = !!process.env.SENDGRID_API_KEY;
    this.isNodemailerEnabled = isNodemailerAvailable();
    
    // Prefer Nodemailer if available (can be configured)
    this.preferNodemailer = true;
    
    console.log(`Email service initialized. SendGrid: ${this.isSendGridEnabled ? 'enabled' : 'disabled'}, Nodemailer: ${this.isNodemailerEnabled ? 'enabled' : 'disabled'}`);
  }

  async sendEmail(params: EmailParams): Promise<boolean> {
    const emailEnabled = this.isSendGridEnabled || this.isNodemailerEnabled;
    
    if (!emailEnabled) {
      console.log('Email sending disabled. Would have sent:', params.subject);
      return false;
    }

    // Determine which service to use
    if (this.preferNodemailer && this.isNodemailerEnabled) {
      return this.sendWithNodemailer(params);
    } else if (this.isSendGridEnabled) {
      return this.sendWithSendGrid(params);
    } else if (this.isNodemailerEnabled) {
      return this.sendWithNodemailer(params);
    }
    
    // If we get here, no email service is available
    return false;
  }
  
  private async sendWithSendGrid(params: EmailParams): Promise<boolean> {
    try {
      await mailService.send({
        to: params.to,
        from: params.from || this.from,
        subject: params.subject,
        text: params.text || '',
        html: params.html,
      });
      console.log(`Email sent via SendGrid to ${params.to}: ${params.subject}`);
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      
      // Try Nodemailer as fallback if SendGrid fails
      if (this.isNodemailerEnabled) {
        console.log('Trying Nodemailer as fallback...');
        return this.sendWithNodemailer(params);
      }
      
      return false;
    }
  }
  
  private async sendWithNodemailer(params: EmailParams): Promise<boolean> {
    try {
      const result = await sendNodemailerEmail(
        params.to,
        params.subject,
        params.text || '',
        params.html
      );
      
      if (result) {
        console.log(`Email sent via Nodemailer to ${params.to}: ${params.subject}`);
      }
      
      return result;
    } catch (error) {
      console.error('Nodemailer email error:', error);
      
      // Try SendGrid as fallback if Nodemailer fails
      if (this.isSendGridEnabled && !this.preferNodemailer) {
        console.log('Trying SendGrid as fallback...');
        return this.sendWithSendGrid(params);
      }
      
      return false;
    }
  }

  // Withdrawal request notification emails
  async sendWithdrawalRequestedEmail(
    user: User,
    withdrawalRequest: WithdrawalRequest
  ): Promise<boolean> {
    const amount = formatCurrency(Number(withdrawalRequest.amount), withdrawalRequest.currency);
    
    const subject = 'iREVA Withdrawal Request Submitted';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Withdrawal Request Submitted</h2>
        <p>Hello ${user.firstName || user.username},</p>
        <p>Your withdrawal request of <strong>${amount}</strong> has been received. Our team will review and process it shortly.</p>
        <p>Details:</p>
        <ul>
          <li><strong>Amount:</strong> ${amount}</li>
          <li><strong>Currency:</strong> ${withdrawalRequest.currency}</li>
          <li><strong>Network:</strong> ${withdrawalRequest.network}</li>
          <li><strong>Wallet Address:</strong> ${withdrawalRequest.walletAddress}</li>
          <li><strong>Request Date:</strong> ${new Date(withdrawalRequest.requestedAt).toLocaleString()}</li>
        </ul>
        <p>Thank you for using iREVA.</p>
        <p>- The iREVA Team</p>
      </div>
    `;
    
    const text = `
      Hello ${user.firstName || user.username},
      
      Your withdrawal request of ${amount} has been received. Our team will review and process it shortly.
      
      Details:
      - Amount: ${amount}
      - Currency: ${withdrawalRequest.currency}
      - Network: ${withdrawalRequest.network}
      - Wallet Address: ${withdrawalRequest.walletAddress}
      - Request Date: ${new Date(withdrawalRequest.requestedAt).toLocaleString()}
      
      Thank you for using iREVA.
      
      - The iREVA Team
    `;
    
    return this.sendEmail({
      to: user.email,
      from: this.from,
      subject,
      html,
      text,
    });
  }

  async sendWithdrawalApprovedEmail(
    user: User,
    withdrawalRequest: WithdrawalRequest
  ): Promise<boolean> {
    const amount = formatCurrency(Number(withdrawalRequest.amount), withdrawalRequest.currency);
    
    const subject = 'iREVA Withdrawal Approved';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Withdrawal Approved</h2>
        <p>Hi ${user.firstName || user.username},</p>
        <p>Great news! Your withdrawal request of <strong>${amount}</strong> has been approved. Funds will be transferred shortly.</p>
        <p>Details:</p>
        <ul>
          <li><strong>Amount:</strong> ${amount}</li>
          <li><strong>Currency:</strong> ${withdrawalRequest.currency}</li>
          <li><strong>Network:</strong> ${withdrawalRequest.network}</li>
          <li><strong>Wallet Address:</strong> ${withdrawalRequest.walletAddress}</li>
          ${withdrawalRequest.txHash ? `<li><strong>Transaction Hash:</strong> ${withdrawalRequest.txHash}</li>` : ''}
        </ul>
        <p>- The iREVA Team</p>
      </div>
    `;
    
    const text = `
      Hi ${user.firstName || user.username},
      
      Great news! Your withdrawal request of ${amount} has been approved. Funds will be transferred shortly.
      
      Details:
      - Amount: ${amount}
      - Currency: ${withdrawalRequest.currency}
      - Network: ${withdrawalRequest.network}
      - Wallet Address: ${withdrawalRequest.walletAddress}
      ${withdrawalRequest.txHash ? `- Transaction Hash: ${withdrawalRequest.txHash}` : ''}
      
      - The iREVA Team
    `;
    
    return this.sendEmail({
      to: user.email,
      from: this.from,
      subject,
      html,
      text,
    });
  }

  async sendWithdrawalRejectedEmail(
    user: User,
    withdrawalRequest: WithdrawalRequest
  ): Promise<boolean> {
    const amount = formatCurrency(Number(withdrawalRequest.amount), withdrawalRequest.currency);
    
    const subject = 'iREVA Withdrawal Request Update';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Withdrawal Request Update</h2>
        <p>Dear ${user.firstName || user.username},</p>
        <p>We regret to inform you that your withdrawal request of <strong>${amount}</strong> could not be processed at this time.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Details:</p>
        <ul>
          <li><strong>Amount:</strong> ${amount}</li>
          <li><strong>Currency:</strong> ${withdrawalRequest.currency}</li>
          <li><strong>Request Date:</strong> ${new Date(withdrawalRequest.requestedAt).toLocaleString()}</li>
        </ul>
        <p>Thank you for your understanding.</p>
        <p>- The iREVA Team</p>
      </div>
    `;
    
    const text = `
      Dear ${user.firstName || user.username},
      
      We regret to inform you that your withdrawal request of ${amount} could not be processed at this time.
      
      If you have any questions, please contact our support team.
      
      Details:
      - Amount: ${amount}
      - Currency: ${withdrawalRequest.currency}
      - Request Date: ${new Date(withdrawalRequest.requestedAt).toLocaleString()}
      
      Thank you for your understanding.
      
      - The iREVA Team
    `;
    
    return this.sendEmail({
      to: user.email,
      from: this.from,
      subject,
      html,
      text,
    });
  }

  async sendWithdrawalProcessedEmail(
    user: User,
    withdrawalRequest: WithdrawalRequest
  ): Promise<boolean> {
    const amount = formatCurrency(Number(withdrawalRequest.amount), withdrawalRequest.currency);
    
    const subject = 'iREVA Withdrawal Completed';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Withdrawal Completed</h2>
        <p>Hello ${user.firstName || user.username},</p>
        <p>Your withdrawal request of <strong>${amount}</strong> has been processed and completed successfully!</p>
        <p>The funds have been sent to your wallet address and should be reflected shortly.</p>
        <p>Details:</p>
        <ul>
          <li><strong>Amount:</strong> ${amount}</li>
          <li><strong>Currency:</strong> ${withdrawalRequest.currency}</li>
          <li><strong>Network:</strong> ${withdrawalRequest.network}</li>
          <li><strong>Wallet Address:</strong> ${withdrawalRequest.walletAddress}</li>
          ${withdrawalRequest.txHash ? `<li><strong>Transaction Hash:</strong> ${withdrawalRequest.txHash}</li>` : ''}
          <li><strong>Completion Date:</strong> ${new Date(withdrawalRequest.processedAt || '').toLocaleString()}</li>
        </ul>
        <p>Thank you for using iREVA.</p>
        <p>- The iREVA Team</p>
      </div>
    `;
    
    const text = `
      Hello ${user.firstName || user.username},
      
      Your withdrawal request of ${amount} has been processed and completed successfully!
      
      The funds have been sent to your wallet address and should be reflected shortly.
      
      Details:
      - Amount: ${amount}
      - Currency: ${withdrawalRequest.currency}
      - Network: ${withdrawalRequest.network}
      - Wallet Address: ${withdrawalRequest.walletAddress}
      ${withdrawalRequest.txHash ? `- Transaction Hash: ${withdrawalRequest.txHash}` : ''}
      - Completion Date: ${new Date(withdrawalRequest.processedAt || '').toLocaleString()}
      
      Thank you for using iREVA.
      
      - The iREVA Team
    `;
    
    return this.sendEmail({
      to: user.email,
      from: this.from,
      subject,
      html,
      text,
    });
  }

  async sendAdminWithdrawalRequestNotification(
    adminEmails: string[],
    user: User,
    withdrawalRequest: WithdrawalRequest
  ): Promise<boolean> {
    if (!adminEmails || adminEmails.length === 0) {
      console.log('No admin emails provided for withdrawal notification');
      return false;
    }
    
    const amount = formatCurrency(Number(withdrawalRequest.amount), withdrawalRequest.currency);
    
    const subject = 'iREVA: New Withdrawal Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Withdrawal Request</h2>
        <p>A new withdrawal request has been submitted and requires review.</p>
        <p><strong>User:</strong> ${user.firstName || ''} ${user.lastName || ''} (${user.email})</p>
        <p><strong>Amount:</strong> ${amount}</p>
        <p>Details:</p>
        <ul>
          <li><strong>Request ID:</strong> ${withdrawalRequest.id}</li>
          <li><strong>Currency:</strong> ${withdrawalRequest.currency}</li>
          <li><strong>Network:</strong> ${withdrawalRequest.network}</li>
          <li><strong>Wallet Address:</strong> ${withdrawalRequest.walletAddress}</li>
          <li><strong>Request Date:</strong> ${new Date(withdrawalRequest.requestedAt).toLocaleString()}</li>
        </ul>
        <p>Please log in to the admin dashboard to review this request.</p>
      </div>
    `;
    
    const text = `
      New Withdrawal Request
      
      A new withdrawal request has been submitted and requires review.
      
      User: ${user.firstName || ''} ${user.lastName || ''} (${user.email})
      Amount: ${amount}
      
      Details:
      - Request ID: ${withdrawalRequest.id}
      - Currency: ${withdrawalRequest.currency}
      - Network: ${withdrawalRequest.network}
      - Wallet Address: ${withdrawalRequest.walletAddress}
      - Request Date: ${new Date(withdrawalRequest.requestedAt).toLocaleString()}
      
      Please log in to the admin dashboard to review this request.
    `;
    
    // Send to all admins
    const promises = adminEmails.map(adminEmail => 
      this.sendEmail({
        to: adminEmail,
        from: this.from,
        subject,
        html,
        text,
      })
    );
    
    // Return true if at least one email was sent successfully
    const results = await Promise.all(promises);
    return results.some(result => result);
  }
}

export const emailService = new EmailService();