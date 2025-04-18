import { MailService } from '@sendgrid/mail';

// SendGrid email service
class EmailService {
  private sendgrid: MailService;
  private initialized: boolean = false;
  private defaultFromEmail: string = 'noreply@ireva.com'; // Update with your verified sender
  private defaultFromName: string = 'iREVA Real Estate Investments';

  constructor() {
    this.sendgrid = new MailService();
    this.init();
  }

  /**
   * Initialize the SendGrid client
   */
  private init() {
    if (process.env.SENDGRID_API_KEY) {
      this.sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
      this.initialized = true;
      console.log('SendGrid client initialized');
    } else {
      console.warn('SENDGRID_API_KEY is not set. Email sending is disabled.');
      this.initialized = false;
    }
  }

  /**
   * Send a transactional email using a template
   */
  public async sendTemplateEmail(
    to: string,
    templateId: string,
    dynamicData: Record<string, any>,
    options: {
      fromEmail?: string;
      fromName?: string;
      subject?: string;
      cc?: string[];
      bcc?: string[];
    } = {}
  ): Promise<boolean> {
    if (!this.initialized) {
      console.warn('SendGrid not initialized. Email not sent.');
      return false;
    }

    try {
      const msg = {
        to,
        from: {
          email: options.fromEmail || this.defaultFromEmail,
          name: options.fromName || this.defaultFromName
        },
        templateId,
        dynamicTemplateData: {
          subject: options.subject,
          ...dynamicData
        },
        cc: options.cc,
        bcc: options.bcc
      };

      await this.sendgrid.send(msg);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send a simple email without using a template
   */
  public async sendEmail(
    to: string,
    subject: string,
    text: string,
    html: string,
    options: {
      fromEmail?: string;
      fromName?: string;
      cc?: string[];
      bcc?: string[];
    } = {}
  ): Promise<boolean> {
    if (!this.initialized) {
      console.warn('SendGrid not initialized. Email not sent.');
      return false;
    }

    try {
      const msg = {
        to,
        from: {
          email: options.fromEmail || this.defaultFromEmail,
          name: options.fromName || this.defaultFromName
        },
        subject,
        text,
        html,
        cc: options.cc,
        bcc: options.bcc
      };

      await this.sendgrid.send(msg);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send a welcome email to a new user
   */
  public async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    return this.sendTemplateEmail(
      email,
      'welcome-template-1', // Replace with your actual template ID
      {
        first_name: firstName,
        current_year: new Date().getFullYear()
      },
      {
        subject: 'Welcome to iREVA - Your Journey Begins'
      }
    );
  }

  /**
   * Send a password reset email
   */
  public async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://ireva.com'}/reset-password?token=${resetToken}`;

    return this.sendTemplateEmail(
      email,
      'password-reset-template', // Replace with your actual template ID
      {
        reset_link: resetUrl,
        expiry_hours: 24,
        current_year: new Date().getFullYear()
      },
      {
        subject: 'Reset Your iREVA Password'
      }
    );
  }

  /**
   * Send a KYC verification confirmation email
   */
  public async sendKycVerifiedEmail(email: string, firstName: string): Promise<boolean> {
    return this.sendTemplateEmail(
      email,
      'kyc-verified-template', // Replace with your actual template ID
      {
        first_name: firstName,
        current_year: new Date().getFullYear()
      },
      {
        subject: 'Your KYC Verification is Complete'
      }
    );
  }

  /**
   * Send an investment confirmation email
   */
  public async sendInvestmentConfirmationEmail(
    email: string,
    firstName: string,
    propertyName: string,
    investmentAmount: number,
    transactionId: string
  ): Promise<boolean> {
    return this.sendTemplateEmail(
      email,
      'investment-confirmation-template', // Replace with your actual template ID
      {
        first_name: firstName,
        property_name: propertyName,
        investment_amount: investmentAmount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }),
        transaction_id: transactionId,
        dashboard_link: `${process.env.FRONTEND_URL || 'https://ireva.com'}/investor/dashboard`,
        current_year: new Date().getFullYear()
      },
      {
        subject: `Investment Confirmation: ${propertyName}`
      }
    );
  }
}

// Export a singleton instance
export const emailService = new EmailService();