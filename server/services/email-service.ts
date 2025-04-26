import nodemailer from 'nodemailer';

// Define email template types
interface FundsReleasedEmailData {
  projectId: number;
  milestoneId: number;
  transactionHash: string;
  amount: string;
  timestamp: string;
}

interface RefundRequestEmailData {
  walletAddress: string;
  transactionHash: string;
  refundAmount: string;
  timestamp: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private isEnabled: boolean;
  private fromEmail: string;
  
  constructor() {
    this.isEnabled = false;
    this.fromEmail = process.env.IREVA_EMAIL || '';
    
    // Check if email credentials are available
    if (process.env.IREVA_EMAIL && process.env.IREVA_EMAIL_PASS) {
      try {
        // Create a transporter with Gmail
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.IREVA_EMAIL,
            pass: process.env.IREVA_EMAIL_PASS
          }
        });
        
        this.isEnabled = true;
        console.log('Email service initialized with Gmail');
      } catch (error) {
        console.error('Failed to initialize email service:', error);
      }
    } else {
      console.log('Email service not initialized. Missing credentials.');
    }
  }
  
  /**
   * Send an email notification when funds are released
   */
  async sendFundsReleasedEmail(
    to: string,
    data: FundsReleasedEmailData
  ): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('Email service is not enabled. Skipping sending funds released email.');
      return false;
    }
    
    try {
      const subject = 'iREVA: Funds Released Successfully';
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4a5568;">iREVA Real Estate</h1>
            <p style="font-size: 18px; color: #2d3748;">Funds Release Notification</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p>Dear Investor,</p>
            <p>We are pleased to inform you that funds have been successfully released for your property investment.</p>
            <p>The funds have been released as part of milestone completion for your project.</p>
          </div>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
            <h3 style="margin-top: 0; color: #4a5568;">Transaction Details</h3>
            <ul style="list-style-type: none; padding: 0;">
              <li style="margin-bottom: 10px;"><strong>Project ID:</strong> ${data.projectId}</li>
              <li style="margin-bottom: 10px;"><strong>Milestone:</strong> ${data.milestoneId}</li>
              <li style="margin-bottom: 10px;"><strong>Amount:</strong> ${data.amount} USDC</li>
              <li style="margin-bottom: 10px;"><strong>Date:</strong> ${new Date(data.timestamp).toLocaleDateString()}</li>
              <li style="margin-bottom: 10px;"><strong>Transaction Hash:</strong> <span style="font-family: monospace; word-break: break-all;">${data.transactionHash}</span></li>
            </ul>
          </div>
          
          <div>
            <p>You can verify this transaction on the blockchain using the transaction hash above.</p>
            <p>For any questions or concerns, please don't hesitate to contact our support team.</p>
            <p>Thank you for investing with iREVA Real Estate.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #718096; font-size: 12px;">
            <p>© ${new Date().getFullYear()} iREVA Real Estate. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `;
      
      const mailOptions = {
        from: `"iREVA Real Estate" <${this.fromEmail}>`,
        to,
        subject,
        html
      };
      
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending funds released email:', error);
      return false;
    }
  }
  
  /**
   * Send an email notification when refund is requested
   */
  async sendRefundRequestEmail(
    to: string,
    data: RefundRequestEmailData
  ): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('Email service is not enabled. Skipping sending refund request email.');
      return false;
    }
    
    try {
      const subject = 'iREVA: Refund Request Received';
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4a5568;">iREVA Real Estate</h1>
            <p style="font-size: 18px; color: #2d3748;">Refund Request Confirmation</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p>Dear Investor,</p>
            <p>We have received your request for a refund from your investment escrow.</p>
            <p>Your request is now being processed. You will receive another notification once the refund has been completed.</p>
          </div>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
            <h3 style="margin-top: 0; color: #4a5568;">Request Details</h3>
            <ul style="list-style-type: none; padding: 0;">
              <li style="margin-bottom: 10px;"><strong>Wallet Address:</strong> <span style="font-family: monospace; word-break: break-all;">${data.walletAddress}</span></li>
              <li style="margin-bottom: 10px;"><strong>Refund Amount:</strong> ${data.refundAmount} USDC</li>
              <li style="margin-bottom: 10px;"><strong>Request Date:</strong> ${new Date(data.timestamp).toLocaleDateString()}</li>
              <li style="margin-bottom: 10px;"><strong>Transaction Hash:</strong> <span style="font-family: monospace; word-break: break-all;">${data.transactionHash}</span></li>
            </ul>
          </div>
          
          <div>
            <p>Please note that refund processing may take up to 3 business days to complete.</p>
            <p>You can track the status of your refund in your investor dashboard.</p>
            <p>For any questions or concerns, please don't hesitate to contact our support team.</p>
            <p>Thank you for your patience and understanding.</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #718096; font-size: 12px;">
            <p>© ${new Date().getFullYear()} iREVA Real Estate. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      `;
      
      const mailOptions = {
        from: `"iREVA Real Estate" <${this.fromEmail}>`,
        to,
        subject,
        html
      };
      
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending refund request email:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
export const emailService = new EmailService();