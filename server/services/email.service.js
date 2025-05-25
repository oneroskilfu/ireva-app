/**
 * Email Service for iREVA Platform
 * Handles email sending with graceful fallback when SendGrid API key is not configured
 */

const sendEmail = async (params) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.log('📧 Email Service - Development Mode');
    console.log('To:', params.to);
    console.log('Subject:', params.subject);
    console.log('✅ Email would be sent successfully in production with SENDGRID_API_KEY');
    console.log('👤 User can continue with the flow normally');
    return true; // Return success to allow user registration/verification flow to continue
  }

  try {
    // Dynamic import to avoid issues when @sendgrid/mail is not configured
    const sgMail = await import('@sendgrid/mail');
    sgMail.default.setApiKey(apiKey);

    const msg = {
      to: params.to,
      from: params.from || process.env.FROM_EMAIL || 'noreply@ireva.ng',
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    };

    await sgMail.default.send(msg);
    console.log('✅ Email sent successfully to:', params.to);
    return true;

  } catch (error) {
    console.error('❌ SendGrid email error:', error);
    // In development, still return true to allow flow to continue
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Development mode: Allowing flow to continue despite email error');
      return true;
    }
    return false;
  }
};

module.exports = {
  sendEmail
};