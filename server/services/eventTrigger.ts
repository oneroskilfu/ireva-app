import { triggerEvent } from './webhook';
import { webhookEventEnum } from '@shared/schema';
import { logger } from '../utils/logger';

// Define event categories for better organization
export enum EventCategory {
  INVESTMENT = 'investment',
  KYC = 'kyc',
  PROPERTY = 'property',
  ROI = 'roi',
  USER = 'user',
  WALLET = 'wallet',
  SYSTEM = 'system',
  SECURITY = 'security',
}

// Define more specific event types within the categories
export const EventTypes = {
  // Investment events
  INVESTMENT_CREATED: 'investment.created',
  INVESTMENT_COMPLETED: 'investment.completed',
  INVESTMENT_CANCELLED: 'investment.cancelled',
  INVESTMENT_APPROVED: 'investment.approved',
  INVESTMENT_DECLINED: 'investment.declined',
  INVESTMENT_REFUNDED: 'investment.refunded',
  
  // KYC events
  KYC_SUBMITTED: 'kyc.submitted',
  KYC_APPROVED: 'kyc.approved',
  KYC_REJECTED: 'kyc.rejected',
  KYC_UPDATED: 'kyc.updated',
  
  // Property events
  PROPERTY_CREATED: 'property.created',
  PROPERTY_UPDATED: 'property.updated',
  PROPERTY_FUNDING_MILESTONE: 'property.funding_milestone',
  PROPERTY_FULLY_FUNDED: 'property.fully_funded',
  PROPERTY_CONSTRUCTION_UPDATE: 'property.construction_update',
  
  // ROI events
  ROI_CALCULATED: 'roi.calculated',
  ROI_DISTRIBUTED: 'roi.distributed',
  ROI_PAYOUT_FAILED: 'roi.payout_failed',
  
  // User events
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_TIER_CHANGED: 'user.tier_changed',
  
  // Wallet events
  WALLET_CREATED: 'wallet.created',
  WALLET_FUNDED: 'wallet.funded',
  WALLET_WITHDRAWAL: 'wallet.withdrawal',
  WALLET_TRANSFER: 'wallet.transfer',
  
  // System events
  SYSTEM_ALERT: 'system.alert',
  SYSTEM_MAINTENANCE: 'system.maintenance',
  
  // Security events
  SECURITY_ALERT: 'security.alert',
  SUSPICIOUS_ACTIVITY: 'security.suspicious_activity',
};

// Map our event types to webhook event enum values
const eventTypeToWebhookEvent = new Map<string, typeof webhookEventEnum.enumValues[number]>();

// Populate the map
Object.values(EventTypes).forEach(eventType => {
  const category = eventType.split('.')[0];
  
  switch(category) {
    case 'investment':
      eventTypeToWebhookEvent.set(eventType, 'investment_event');
      break;
    case 'kyc':
      eventTypeToWebhookEvent.set(eventType, 'kyc_event');
      break;
    case 'property':
      eventTypeToWebhookEvent.set(eventType, 'property_event');
      break;
    case 'roi':
      eventTypeToWebhookEvent.set(eventType, 'roi_event');
      break;
    case 'user':
      eventTypeToWebhookEvent.set(eventType, 'user_event');
      break;
    case 'wallet':
      eventTypeToWebhookEvent.set(eventType, 'wallet_event');
      break;
    case 'system':
      eventTypeToWebhookEvent.set(eventType, 'system_event');
      break;
    case 'security':
      eventTypeToWebhookEvent.set(eventType, 'security_event');
      break;
    default:
      eventTypeToWebhookEvent.set(eventType, 'general');
  }
});

/**
 * Enrich payload with standard fields
 */
function enrichPayload(eventType: string, payload: Record<string, any>): Record<string, any> {
  return {
    ...payload,
    event_type: eventType,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };
}

/**
 * Trigger a business event that will be dispatched as webhooks
 */
export async function triggerBusinessEvent(
  eventType: string,
  payload: Record<string, any>,
  options: { userId?: string; ipAddress?: string; userAgent?: string } = {}
) {
  try {
    // Get the corresponding webhook event type
    const webhookEventType = eventTypeToWebhookEvent.get(eventType) || 'general';
    
    // Enrich the payload with common information
    const enrichedPayload = enrichPayload(eventType, {
      ...payload,
      ...(options.userId && { user_id: options.userId }),
      ...(options.ipAddress && { ip_address: options.ipAddress }),
      ...(options.userAgent && { user_agent: options.userAgent }),
    });
    
    // Log the event
    logger.info(`Business event triggered: ${eventType}`, {
      context: 'event-trigger',
    });
    
    // Trigger the webhook event
    return await triggerEvent(webhookEventType, enrichedPayload);
  } catch (error: any) {
    logger.error(`Failed to trigger business event ${eventType}: ${error?.message}`, {
      context: 'event-trigger',
    });
    throw error;
  }
}

/**
 * Investment Events
 */
export const InvestmentEvents = {
  created: (investmentData: any, options?: any) => 
    triggerBusinessEvent(EventTypes.INVESTMENT_CREATED, investmentData, options),
    
  completed: (investmentData: any, options?: any) => 
    triggerBusinessEvent(EventTypes.INVESTMENT_COMPLETED, investmentData, options),
    
  cancelled: (investmentData: any, reason: string, options?: any) => 
    triggerBusinessEvent(EventTypes.INVESTMENT_CANCELLED, { ...investmentData, reason }, options),
    
  approved: (investmentData: any, approvedBy: string, options?: any) => 
    triggerBusinessEvent(EventTypes.INVESTMENT_APPROVED, { ...investmentData, approved_by: approvedBy }, options),
    
  declined: (investmentData: any, reason: string, declinedBy: string, options?: any) => 
    triggerBusinessEvent(EventTypes.INVESTMENT_DECLINED, { 
      ...investmentData, 
      reason,
      declined_by: declinedBy
    }, options),
};

/**
 * KYC Events
 */
export const KycEvents = {
  submitted: (kycData: any, options?: any) => 
    triggerBusinessEvent(EventTypes.KYC_SUBMITTED, kycData, options),
    
  approved: (kycData: any, approvedBy: string, options?: any) => 
    triggerBusinessEvent(EventTypes.KYC_APPROVED, { ...kycData, approved_by: approvedBy }, options),
    
  rejected: (kycData: any, reason: string, rejectedBy: string, options?: any) => 
    triggerBusinessEvent(EventTypes.KYC_REJECTED, { 
      ...kycData, 
      reason,
      rejected_by: rejectedBy
    }, options),
    
  updated: (kycData: any, changedFields: string[], options?: any) => 
    triggerBusinessEvent(EventTypes.KYC_UPDATED, { ...kycData, changed_fields: changedFields }, options),
};

/**
 * Property Events
 */
export const PropertyEvents = {
  created: (propertyData: any, createdBy: string, options?: any) => 
    triggerBusinessEvent(EventTypes.PROPERTY_CREATED, { ...propertyData, created_by: createdBy }, options),
    
  updated: (propertyData: any, changedFields: string[], updatedBy: string, options?: any) => 
    triggerBusinessEvent(EventTypes.PROPERTY_UPDATED, { 
      ...propertyData, 
      changed_fields: changedFields,
      updated_by: updatedBy
    }, options),
    
  fundingMilestone: (propertyData: any, milestone: number, currentAmount: string, goalAmount: string, options?: any) => 
    triggerBusinessEvent(EventTypes.PROPERTY_FUNDING_MILESTONE, { 
      ...propertyData, 
      milestone_percentage: milestone,
      current_amount: currentAmount,
      goal_amount: goalAmount
    }, options),
    
  fullyFunded: (propertyData: any, finalAmount: string, investorCount: number, options?: any) => 
    triggerBusinessEvent(EventTypes.PROPERTY_FULLY_FUNDED, { 
      ...propertyData, 
      final_amount: finalAmount,
      investor_count: investorCount
    }, options),
    
  constructionUpdate: (propertyData: any, updateDetails: any, options?: any) => 
    triggerBusinessEvent(EventTypes.PROPERTY_CONSTRUCTION_UPDATE, { 
      ...propertyData, 
      update_details: updateDetails
    }, options),
};

/**
 * ROI Events
 */
export const RoiEvents = {
  calculated: (roiData: any, options?: any) => 
    triggerBusinessEvent(EventTypes.ROI_CALCULATED, roiData, options),
    
  distributed: (roiData: any, totalAmount: string, investorCount: number, options?: any) => 
    triggerBusinessEvent(EventTypes.ROI_DISTRIBUTED, { 
      ...roiData, 
      total_amount: totalAmount,
      investor_count: investorCount
    }, options),
    
  payoutFailed: (roiData: any, reason: string, options?: any) => 
    triggerBusinessEvent(EventTypes.ROI_PAYOUT_FAILED, { ...roiData, reason }, options),
};

/**
 * User Events
 */
export const UserEvents = {
  registered: (userData: any, options?: any) => 
    triggerBusinessEvent(EventTypes.USER_REGISTERED, userData, options),
    
  updated: (userData: any, changedFields: string[], options?: any) => 
    triggerBusinessEvent(EventTypes.USER_UPDATED, { ...userData, changed_fields: changedFields }, options),
    
  deleted: (userData: any, reason: string, options?: any) => 
    triggerBusinessEvent(EventTypes.USER_DELETED, { ...userData, reason }, options),
    
  login: (userData: any, options?: any) => 
    triggerBusinessEvent(EventTypes.USER_LOGIN, userData, options),
    
  logout: (userData: any, options?: any) => 
    triggerBusinessEvent(EventTypes.USER_LOGOUT, userData, options),
    
  tierChanged: (userData: any, oldTier: string, newTier: string, reason: string, options?: any) => 
    triggerBusinessEvent(EventTypes.USER_TIER_CHANGED, { 
      ...userData, 
      old_tier: oldTier,
      new_tier: newTier,
      reason
    }, options),
};

/**
 * Wallet Events
 */
export const WalletEvents = {
  created: (walletData: any, options?: any) => 
    triggerBusinessEvent(EventTypes.WALLET_CREATED, walletData, options),
    
  funded: (walletData: any, amount: string, source: string, options?: any) => 
    triggerBusinessEvent(EventTypes.WALLET_FUNDED, { 
      ...walletData, 
      amount,
      source
    }, options),
    
  withdrawal: (walletData: any, amount: string, destination: string, options?: any) => 
    triggerBusinessEvent(EventTypes.WALLET_WITHDRAWAL, { 
      ...walletData, 
      amount,
      destination
    }, options),
    
  transfer: (sourceWallet: any, destinationWallet: any, amount: string, reason: string, options?: any) => 
    triggerBusinessEvent(EventTypes.WALLET_TRANSFER, { 
      source_wallet: sourceWallet,
      destination_wallet: destinationWallet,
      amount,
      reason
    }, options),
};

/**
 * System Events
 */
export const SystemEvents = {
  alert: (alertMessage: string, severity: 'low' | 'medium' | 'high' | 'critical', options?: any) => 
    triggerBusinessEvent(EventTypes.SYSTEM_ALERT, { 
      message: alertMessage,
      severity
    }, options),
    
  maintenance: (maintenanceData: any, options?: any) => 
    triggerBusinessEvent(EventTypes.SYSTEM_MAINTENANCE, maintenanceData, options),
};

/**
 * Security Events
 */
export const SecurityEvents = {
  alert: (alertMessage: string, severity: 'low' | 'medium' | 'high' | 'critical', options?: any) => 
    triggerBusinessEvent(EventTypes.SECURITY_ALERT, { 
      message: alertMessage,
      severity
    }, options),
    
  suspiciousActivity: (activityData: any, riskScore: number, options?: any) => 
    triggerBusinessEvent(EventTypes.SUSPICIOUS_ACTIVITY, { 
      ...activityData,
      risk_score: riskScore
    }, options),
};