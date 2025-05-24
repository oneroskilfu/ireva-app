import { User } from '@shared/schema';
import { storage } from '../storage';

/**
 * Defines the structure for an email in a drip campaign sequence
 */
export interface DripEmail {
  id: string;
  subject: string;
  templateId: string;  // SendGrid template ID
  dayOffset: number;   // Days after previous email or signup
  enabled: boolean;
  audience: 'all' | 'investors' | 'incomplete-kyc' | 'no-investment';
}

/**
 * Defines a complete drip campaign containing multiple emails
 */
export interface EmailCampaign {
  id: string;
  name: string;
  description: string;
  trigger: 'signup' | 'first-investment' | 'kyc-complete' | 'manual';
  emails: DripEmail[];
  enabled: boolean;
}

/**
 * Represents an entry in the email queue
 */
export interface QueuedEmail {
  id: string;
  userId: number;
  emailId: string;
  campaignId: string;
  scheduledFor: Date;
  sent: boolean;
  sentAt: Date | null;
  error: string | null;
}

// The predefined drip campaigns
export const emailCampaigns: EmailCampaign[] = [
  {
    id: 'welcome-sequence',
    name: 'Welcome Sequence',
    description: 'Sent to all new users upon registration',
    trigger: 'signup',
    enabled: true,
    emails: [
      {
        id: 'welcome-day-0',
        subject: 'Welcome to iREVA - Your Journey Begins',
        templateId: 'welcome-template-1',
        dayOffset: 0, // Send immediately upon signup
        enabled: true,
        audience: 'all'
      },
      {
        id: 'welcome-day-1',
        subject: 'Getting Started with iREVA: Your First Steps',
        templateId: 'welcome-template-2',
        dayOffset: 1, // Send 1 day after signup
        enabled: true,
        audience: 'all'
      },
      {
        id: 'welcome-day-3',
        subject: 'Complete Your KYC to Unlock Premium Investments',
        templateId: 'welcome-template-3',
        dayOffset: 3, // Send 3 days after signup
        enabled: true,
        audience: 'incomplete-kyc'
      },
      {
        id: 'welcome-day-5',
        subject: 'Discover Our Top Investment Opportunities',
        templateId: 'welcome-template-4',
        dayOffset: 5, // Send 5 days after signup
        enabled: true,
        audience: 'no-investment'
      },
      {
        id: 'welcome-day-7',
        subject: 'How to Build a Diversified Real Estate Portfolio',
        templateId: 'welcome-template-5',
        dayOffset: 7, // Send 7 days after signup
        enabled: true,
        audience: 'all'
      }
    ]
  },
  {
    id: 'investment-sequence',
    name: 'Investment Onboarding',
    description: 'Helps new investors understand how to monitor their investments',
    trigger: 'first-investment',
    enabled: true,
    emails: [
      {
        id: 'investment-day-0',
        subject: 'Your Investment is Confirmed! What\'s Next?',
        templateId: 'investment-template-1',
        dayOffset: 0, // Send immediately after first investment
        enabled: true,
        audience: 'investors'
      },
      {
        id: 'investment-day-2',
        subject: 'Understanding Your Investment Dashboard',
        templateId: 'investment-template-2',
        dayOffset: 2, // Send 2 days after first investment
        enabled: true,
        audience: 'investors'
      },
      {
        id: 'investment-day-7',
        subject: 'How to Track Your Returns and ROI',
        templateId: 'investment-template-3',
        dayOffset: 7, // Send 7 days after first investment
        enabled: true,
        audience: 'investors'
      },
      {
        id: 'investment-day-14',
        subject: 'Grow Your Portfolio: Recommended Properties',
        templateId: 'investment-template-4',
        dayOffset: 14, // Send 14 days after first investment
        enabled: true,
        audience: 'investors'
      }
    ]
  },
  {
    id: 'kyc-completion-sequence',
    name: 'KYC Completion Sequence',
    description: 'Guides users through the KYC verification process',
    trigger: 'signup',
    enabled: true,
    emails: [
      {
        id: 'kyc-day-2',
        subject: 'Complete Your KYC to Start Investing',
        templateId: 'kyc-template-1',
        dayOffset: 2, // Send 2 days after signup
        enabled: true,
        audience: 'incomplete-kyc'
      },
      {
        id: 'kyc-day-4',
        subject: 'Reminder: Your KYC Verification is Pending',
        templateId: 'kyc-template-2',
        dayOffset: 4, // Send 4 days after signup
        enabled: true,
        audience: 'incomplete-kyc'
      },
      {
        id: 'kyc-day-7',
        subject: 'Final Reminder: Complete Your KYC Today',
        templateId: 'kyc-template-3',
        dayOffset: 7, // Send 7 days after signup
        enabled: true,
        audience: 'incomplete-kyc'
      }
    ]
  }
];

/**
 * Email campaign service handling the lifecycle of drip campaigns
 */
class EmailCampaignService {
  private emailQueue: QueuedEmail[] = [];
  
  constructor() {
    // Initialize with any existing queued emails from storage
    this.loadQueueFromStorage();
  }
  
  /**
   * Get all email campaigns
   */
  public getCampaigns(): EmailCampaign[] {
    return emailCampaigns;
  }
  
  /**
   * Load any previously queued emails from storage
   */
  private async loadQueueFromStorage() {
    try {
      // In a real implementation, this would load from database
      // For now, we're just initializing with an empty queue
      this.emailQueue = [];
    } catch (error) {
      console.error('Failed to load email queue:', error);
    }
  }
  
  /**
   * Save the current email queue to storage
   */
  private async saveQueueToStorage() {
    try {
      // In a real implementation, this would save to database
      // For now, we're just logging to console
      console.log('Saving email queue:', this.emailQueue.length, 'emails');
    } catch (error) {
      console.error('Failed to save email queue:', error);
    }
  }
  
  /**
   * Trigger a campaign for a specific user
   */
  public async triggerCampaign(campaignId: string, userId: number) {
    try {
      const campaign = emailCampaigns.find(c => c.id === campaignId);
      if (!campaign || !campaign.enabled) {
        console.warn(`Campaign ${campaignId} not found or disabled`);
        return;
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.warn(`User ${userId} not found`);
        return;
      }
      
      // Queue all emails in the campaign
      this.queueCampaignEmails(campaign, user);
      
      // Save the updated queue
      await this.saveQueueToStorage();
      
    } catch (error) {
      console.error(`Error triggering campaign ${campaignId} for user ${userId}:`, error);
    }
  }
  
  /**
   * Queue all emails in a campaign for a user
   */
  private queueCampaignEmails(campaign: EmailCampaign, user: User) {
    const now = new Date();
    
    for (const email of campaign.emails) {
      if (!email.enabled) continue;
      
      // Check if the user matches the audience criteria
      if (!this.userMatchesAudience(user, email.audience)) {
        continue;
      }
      
      // Calculate when this email should be sent
      const scheduledFor = new Date(now);
      scheduledFor.setDate(scheduledFor.getDate() + email.dayOffset);
      
      // Create a queue entry
      const queuedEmail: QueuedEmail = {
        id: `${user.id}-${campaign.id}-${email.id}-${Date.now()}`,
        userId: user.id,
        emailId: email.id,
        campaignId: campaign.id,
        scheduledFor,
        sent: false,
        sentAt: null,
        error: null
      };
      
      // Add to queue
      this.emailQueue.push(queuedEmail);
      
      console.log(`Queued email "${email.subject}" for user ${user.id} at ${scheduledFor}`);
    }
  }
  
  /**
   * Check if a user matches the specified audience criteria
   */
  private userMatchesAudience(user: User, audience: DripEmail['audience']): boolean {
    switch (audience) {
      case 'all':
        return true;
        
      case 'investors':
        return user.totalInvested > 0;
        
      case 'incomplete-kyc':
        return user.kycStatus !== 'verified';
        
      case 'no-investment':
        return user.totalInvested === 0;
        
      default:
        return false;
    }
  }
  
  /**
   * Process the email queue and send any due emails
   */
  public async processQueue() {
    const now = new Date();
    const dueEmails = this.emailQueue.filter(e => !e.sent && e.scheduledFor <= now);
    
    if (dueEmails.length === 0) {
      return;
    }
    
    console.log(`Processing ${dueEmails.length} due emails`);
    
    for (const queuedEmail of dueEmails) {
      try {
        // Find the campaign and email details
        const campaign = emailCampaigns.find(c => c.id === queuedEmail.campaignId);
        if (!campaign) {
          throw new Error(`Campaign ${queuedEmail.campaignId} not found`);
        }
        
        const email = campaign.emails.find(e => e.id === queuedEmail.emailId);
        if (!email) {
          throw new Error(`Email ${queuedEmail.emailId} not found in campaign ${queuedEmail.campaignId}`);
        }
        
        // Get the user details
        const user = await storage.getUser(queuedEmail.userId);
        if (!user) {
          throw new Error(`User ${queuedEmail.userId} not found`);
        }
        
        // Double-check audience matching (in case user status changed)
        if (!this.userMatchesAudience(user, email.audience)) {
          console.log(`Skipping email ${queuedEmail.emailId} as user ${user.id} no longer matches audience ${email.audience}`);
          
          // Mark as sent to remove from queue
          queuedEmail.sent = true;
          queuedEmail.sentAt = now;
          continue;
        }
        
        // Send the email (using mock function for now)
        await this.sendEmail(user, email);
        
        // Mark as sent
        queuedEmail.sent = true;
        queuedEmail.sentAt = now;
        
        console.log(`Sent email "${email.subject}" to user ${user.id}`);
        
      } catch (error) {
        // Record the error
        queuedEmail.error = (error as Error).message;
        console.error(`Failed to send email ${queuedEmail.id}:`, error);
      }
    }
    
    // Save the updated queue
    await this.saveQueueToStorage();
  }
  
  /**
   * Send an email (mock implementation for now)
   */
  private async sendEmail(user: User, email: DripEmail): Promise<void> {
    // This is a mock implementation that will be replaced with SendGrid
    console.log(`MOCK: Sending email "${email.subject}" to ${user.email} using template ${email.templateId}`);
    
    // When SendGrid API is available, this will be replaced with actual sending code
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SENDGRID_API_KEY not set. Email not sent.');
      return;
    }
    
    // This will be uncommented when API key is available
    /*
    try {
      // Send email via SendGrid
      const msg = {
        to: user.email,
        from: 'noreply@ireva.com', // Update with your verified sender
        templateId: email.templateId,
        dynamicTemplateData: {
          subject: email.subject,
          first_name: user.firstName,
          user_id: user.id,
          // Add more dynamic data as needed
        },
      };
      
      await sgMail.send(msg);
    } catch (error) {
      console.error('SendGrid error:', error);
      throw error;
    }
    */
  }
  
  /**
   * Trigger the welcome sequence for a new user
   */
  public async triggerWelcomeSequence(userId: number) {
    return this.triggerCampaign('welcome-sequence', userId);
  }
  
  /**
   * Trigger the investment onboarding sequence
   */
  public async triggerInvestmentSequence(userId: number) {
    return this.triggerCampaign('investment-sequence', userId);
  }
  
  /**
   * Trigger the KYC completion sequence
   */
  public async triggerKycSequence(userId: number) {
    return this.triggerCampaign('kyc-completion-sequence', userId);
  }
}

// Create and export a singleton instance
export const emailCampaignService = new EmailCampaignService();