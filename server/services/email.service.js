import { MailService } from '@sendgrid/mail';

export async function sendEmail(params) {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    
    if (!apiKey) {
      console.log('SendGrid API key not configured. Email would be sent to:', params.to);
      console.log('Subject:', params.subject);
      console.log('Email sending will work once SENDGRID_API_KEY is provided.');
      return true; // Return true so the flow continues in development
    }

    const mailService = new MailService();
    mailService.setApiKey(apiKey);

    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });

    console.log('Email sent successfully to:', params.to);
    return true;
    
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}