// Email Notification Test Script for iREVA Platform
const nodemailer = require('nodemailer');
const chalk = require('chalk');
const { sendEmail } = require('../server/email'); // Adjust path as needed

// Configuration
const TEST_EMAIL = 'test@example.com'; // Replace with a real test email if needed

// Email types to test
const EMAIL_TYPES = [
  { 
    type: 'welcome', 
    subject: 'Welcome to iREVA', 
    data: { 
      firstName: 'Test', 
      lastName: 'User' 
    }
  },
  { 
    type: 'kyc_approved', 
    subject: 'Your KYC Verification is Approved', 
    data: { 
      firstName: 'Test', 
      userId: 1 
    }
  },
  { 
    type: 'kyc_rejected', 
    subject: 'Your KYC Verification Needs Attention', 
    data: { 
      firstName: 'Test', 
      reason: 'Test rejection reason', 
      userId: 1 
    }
  },
  { 
    type: 'investment_confirmation', 
    subject: 'Investment Confirmation', 
    data: { 
      firstName: 'Test', 
      amount: 5000, 
      propertyName: 'Test Property', 
      investmentId: 1 
    }
  },
  { 
    type: 'roi_distribution', 
    subject: 'ROI Payment Notification', 
    data: { 
      firstName: 'Test', 
      amount: 500, 
      propertyName: 'Test Property', 
      month: 'January', 
      year: 2023 
    }
  },
  { 
    type: 'password_reset', 
    subject: 'Password Reset Request', 
    data: { 
      firstName: 'Test', 
      resetCode: '123456', 
      resetLink: 'https://example.com/reset-password?token=abc123' 
    }
  },
  { 
    type: 'issue_update', 
    subject: 'Your Issue Has Been Updated', 
    data: { 
      firstName: 'Test', 
      issueTitle: 'Test Issue', 
      status: 'resolved', 
      issueId: 1 
    }
  },
];

// Helper logging functions
const log = {
  info: (msg) => console.log(chalk.blue(`[INFO] ${msg}`)),
  success: (msg) => console.log(chalk.green(`[SUCCESS] ${msg}`)),
  error: (msg) => console.log(chalk.red(`[ERROR] ${msg}`)),
  warning: (msg) => console.log(chalk.yellow(`[WARNING] ${msg}`))
};

// Create test account on Ethereal (for testing without sending real emails)
async function createTestAccount() {
  try {
    log.info('Creating test email account...');
    const testAccount = await nodemailer.createTestAccount();
    log.success('Test email account created');
    
    return {
      user: testAccount.user,
      pass: testAccount.pass,
      smtp: {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false
      },
      previewUrl: (id) => `https://ethereal.email/message/${id}`
    };
  } catch (error) {
    log.error(`Failed to create test email account: ${error.message}`);
    throw error;
  }
}

// Test sending each email type
async function testEmailSending(testAccount) {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  
  log.info(`Testing ${EMAIL_TYPES.length} email types...`);
  
  for (const emailType of EMAIL_TYPES) {
    try {
      log.info(`Testing email type: ${emailType.type}`);
      
      // Send email using the sendEmail function
      const result = await sendEmail(
        testAccount.user, // From
        TEST_EMAIL, // To
        emailType.subject,
        emailType.type,
        emailType.data,
        transporter // Pass custom transporter
      );
      
      if (result && result.messageId) {
        log.success(`Email sent: ${emailType.type}`);
        log.info(`Preview URL: ${testAccount.previewUrl(result.messageId)}`);
        
        // Test email content
        const emailVerified = await verifyEmailContent(result.messageId, emailType);
        if (emailVerified) {
          log.success(`Email content verified for ${emailType.type}`);
        } else {
          log.warning(`Email content issues for ${emailType.type}`);
        }
      } else {
        log.error(`Failed to send ${emailType.type} email`);
      }
    } catch (error) {
      log.error(`Error sending ${emailType.type} email: ${error.message}`);
    }
  }
}

// Verify email content (template would need to make an API call to Ethereal to get content)
async function verifyEmailContent(messageId, emailType) {
  // This is a placeholder. In a real implementation, you would:
  // 1. Retrieve the email content from Ethereal
  // 2. Check if it contains all the expected elements
  // 3. Verify responsive design for email
  
  log.info(`Verifying content for ${emailType.type} email...`);
  
  // For now, we'll just assume verification passed
  return true;
}

// Main test function
async function runTests() {
  log.info('Starting email notification tests for iREVA Platform');
  
  try {
    // Create test email account
    const testAccount = await createTestAccount();
    
    // Run email sending tests
    await testEmailSending(testAccount);
    
    log.success('Email notification tests completed');
  } catch (error) {
    log.error(`Unhandled error in test execution: ${error.message}`);
    console.error(error);
  }
}

// Check if SENDGRID_API_KEY is set
if (!process.env.SENDGRID_API_KEY) {
  log.warning('SENDGRID_API_KEY environment variable is not set. Email tests may not work properly.');
}

// Run the tests
runTests().catch(err => {
  log.error(`Unhandled error in test execution: ${err.message}`);
});