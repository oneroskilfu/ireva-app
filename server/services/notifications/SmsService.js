/**
 * SmsService.js
 * 
 * Service for sending SMS notifications with support for different
 * providers like Twilio
 */

class SmsService {
  /**
   * Send an SMS notification
   * 
   * @param {object} params - SMS parameters
   * @param {string} params.to - Recipient phone number
   * @param {string} params.message - SMS message content
   * @param {string} params.type - Type of notification (for tracking)
   * @returns {Promise<object>} Result of the send operation
   */
  static async send(params) {
    try {
      const { to, message, type } = params;
      
      // In a production environment, we would integrate with SMS providers
      // like Twilio, Nexmo, etc.
      
      // For now, we'll simulate successful delivery
      console.log(`[SmsService] SMS sent to ${to}:`, {
        message,
        type
      });
      
      // To actually implement SMS with Twilio, uncomment and configure:
      /*
      // Configure Twilio client
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        throw new Error('Twilio credentials not configured');
      }
      
      const twilioClient = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      
      // Send the message
      const twilioMessage = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
      
      return {
        success: true,
        channel: 'sms',
        provider: 'twilio',
        messageId: twilioMessage.sid
      };
      */
      
      // Return success status (simulated)
      return {
        success: true,
        channel: 'sms',
        provider: 'simulation',
        messageId: `sim-${Date.now()}`
      };
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      return {
        success: false,
        channel: 'sms',
        error: error.message
      };
    }
  }
  
  /**
   * Format SMS content based on notification type
   * 
   * @param {string} type - Type of notification
   * @param {string} message - Original message
   * @param {object} data - Additional data
   * @returns {string} Formatted SMS message
   */
  static formatSmsContent(type, message, data = {}) {
    // Keep SMS messages concise
    let prefix;
    
    switch (type) {
      case 'investment':
        prefix = 'iREVA Investment:';
        break;
      case 'kyc':
        prefix = 'iREVA KYC:';
        break;
      case 'roi':
        prefix = 'iREVA ROI:';
        break;
      case 'wallet':
        prefix = 'iREVA Wallet:';
        break;
      default:
        prefix = 'iREVA:';
    }
    
    // Truncate message if needed to keep SMS within limits
    const maxLength = 160 - (prefix.length + 1);
    const truncatedMessage = message.length > maxLength 
      ? message.substring(0, maxLength - 3) + '...'
      : message;
    
    return `${prefix} ${truncatedMessage}`;
  }
}

module.exports = SmsService;