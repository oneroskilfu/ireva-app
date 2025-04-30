import axios from 'axios';
import { config } from '../config';

/**
 * Send an SMS message to a phone number
 * 
 * Note: This is a mock service for development. In production, you would use a service like Twilio or Nexmo.
 * 
 * @param phone The phone number to send to
 * @param message The message content
 * @returns true if successful, false otherwise
 */
export const sendSms = async (phone: string, message: string): Promise<boolean> => {
  try {
    // In development mode, just log the message
    if (config.isDevelopment) {
      console.log(`[SMS SERVICE] Mock sending SMS to ${phone}: ${message}`);
      return true;
    }
    
    // In production, you would use a service like Twilio
    // Example with Twilio:
    /*
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    return !!result.sid;
    */
    
    // For now, just simulate success in production
    console.log(`[SMS SERVICE] Sending SMS to ${phone}`);
    
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};