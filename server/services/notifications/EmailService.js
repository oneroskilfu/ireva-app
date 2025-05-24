/**
 * EmailService.js
 * 
 * Service for sending email notifications with support for different email providers
 * (SendGrid, Nodemailer) and customizable templates
 */

const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email templates directory
const templatesDir = path.join(__dirname, '../../templates/email');

class EmailService {
  /**
   * Send an email notification
   * 
   * @param {object} params - Email parameters
   * @param {string} params.to - Recipient email address
   * @param {string} params.subject - Email subject
   * @param {string} params.message - Email message content
   * @param {string} params.type - Type of notification (used for template selection)
   * @param {object} params.metadata - Additional data for template rendering
   * @returns {Promise<object>} Result of the send operation
   */
  static async send(params) {
    try {
      const { to, subject, message, type, metadata = {} } = params;
      
      // Get email content
      const emailContent = await this.getEmailContent(type, message, metadata);
      
      // Send using available provider
      if (process.env.SENDGRID_API_KEY) {
        return await this.sendWithSendGrid(to, subject, emailContent);
      } else {
        return await this.sendWithNodemailer(to, subject, emailContent);
      }
    } catch (error) {
      console.error('Error sending email notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Send email using SendGrid
   * 
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {object} content - Email content (html and text)
   * @returns {Promise<object>} Send result
   */
  static async sendWithSendGrid(to, subject, content) {
    try {
      // Prepare email
      const msg = {
        to,
        from: process.env.EMAIL_FROM || 'notifications@ireva.example.com',
        subject,
        text: content.text,
        html: content.html
      };
      
      // Send email
      await sgMail.send(msg);
      
      return {
        success: true,
        provider: 'sendgrid',
        message: `Email sent to ${to} successfully`
      };
    } catch (error) {
      console.error('SendGrid email error:', error);
      return {
        success: false,
        provider: 'sendgrid',
        error: error.message
      };
    }
  }
  
  /**
   * Send email using Nodemailer
   * 
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {object} content - Email content (html and text)
   * @returns {Promise<object>} Send result
   */
  static async sendWithNodemailer(to, subject, content) {
    try {
      // Create test account if in development
      const account = await nodemailer.createTestAccount();
      
      // Configure transport
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || account.user,
          pass: process.env.SMTP_PASS || account.pass
        }
      });
      
      // Send email
      const info = await transport.sendMail({
        from: process.env.EMAIL_FROM || '"iREVA Platform" <notifications@ireva.example.com>',
        to,
        subject,
        text: content.text,
        html: content.html
      });
      
      // If using Ethereal, provide preview URL
      const previewUrl = nodemailer.getTestMessageUrl(info);
      
      return {
        success: true,
        provider: 'nodemailer',
        messageId: info.messageId,
        previewUrl
      };
    } catch (error) {
      console.error('Nodemailer error:', error);
      return {
        success: false,
        provider: 'nodemailer',
        error: error.message
      };
    }
  }
  
  /**
   * Get email content based on type and template
   * 
   * @param {string} type - Notification type
   * @param {string} defaultMessage - Default message if template not found
   * @param {object} data - Data for template rendering
   * @returns {Promise<object>} Email content (html and text)
   */
  static async getEmailContent(type, defaultMessage, data = {}) {
    try {
      // Check if template exists
      const templatePath = path.join(templatesDir, `${type}.html`);
      
      // Create default HTML wrapper
      const companyName = 'iREVA';
      const year = new Date().getFullYear();
      
      // Default template if specific one doesn't exist
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.subject || 'Notification'}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${companyName} Platform</h2>
            </div>
            <div class="content">
              <p>${defaultMessage}</p>
              
              ${data.propertyName ? `<p><strong>Property:</strong> ${data.propertyName}</p>` : ''}
              ${data.amount ? `<p><strong>Amount:</strong> $${data.amount}</p>` : ''}
              ${data.date ? `<p><strong>Date:</strong> ${new Date(data.date).toLocaleString()}</p>` : ''}
              ${data.status ? `<p><strong>Status:</strong> ${data.status}</p>` : ''}
              
              <p>Thank you for using ${companyName}!</p>
            </div>
            <div class="footer">
              <p>&copy; ${year} ${companyName}. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      
      // Check if specific template exists
      if (fs.existsSync(templatePath)) {
        try {
          const template = fs.readFileSync(templatePath, 'utf8');
          html = template;
          
          // Replace template variables
          for (const [key, value] of Object.entries(data)) {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
          }
          
          // Replace any remaining variables with empty string
          html = html.replace(/{{.*?}}/g, '');
        } catch (err) {
          console.error(`Error loading email template: ${err.message}`);
        }
      }
      
      // Create plain text version
      const text = defaultMessage + '\n\n' +
        (data.propertyName ? `Property: ${data.propertyName}\n` : '') +
        (data.amount ? `Amount: $${data.amount}\n` : '') +
        (data.date ? `Date: ${new Date(data.date).toLocaleString()}\n` : '') +
        (data.status ? `Status: ${data.status}\n` : '') +
        `\nThank you for using ${companyName}!\n\n` +
        `© ${year} ${companyName}. All rights reserved.\n` +
        'This is an automated message, please do not reply.';
      
      return { html, text };
    } catch (error) {
      console.error('Error generating email content:', error);
      
      // Return simple fallback
      return {
        html: `<div style="font-family: Arial, sans-serif; padding: 20px;">${defaultMessage}</div>`,
        text: defaultMessage
      };
    }
  }
}

module.exports = EmailService;