import { logger } from "../utils/logger";
import { triggerEvent } from "./webhook";
import { db } from "../db";
import { webhookEventEnum } from "@shared/schema";

/**
 * Event categories for business events
 */
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

/**
 * Event types mapping for each category
 */
export const EventTypes = {
  [EventCategory.INVESTMENT]: {
    CREATED: 'investment_created' as (typeof webhookEventEnum.enumValues)[number],
    COMPLETED: 'investment_completed' as (typeof webhookEventEnum.enumValues)[number],
    CANCELLED: 'investment_cancelled' as (typeof webhookEventEnum.enumValues)[number],
    APPROVED: 'investment_approved' as (typeof webhookEventEnum.enumValues)[number],
    DECLINED: 'investment_declined' as (typeof webhookEventEnum.enumValues)[number],
    REFUNDED: 'investment_refunded' as (typeof webhookEventEnum.enumValues)[number],
    CATEGORY: 'investment_event' as (typeof webhookEventEnum.enumValues)[number],
  },
  [EventCategory.KYC]: {
    SUBMITTED: 'kyc_submitted' as (typeof webhookEventEnum.enumValues)[number],
    APPROVED: 'kyc_approved' as (typeof webhookEventEnum.enumValues)[number],
    REJECTED: 'kyc_rejected' as (typeof webhookEventEnum.enumValues)[number],
    UPDATED: 'kyc_updated' as (typeof webhookEventEnum.enumValues)[number],
    CATEGORY: 'kyc_event' as (typeof webhookEventEnum.enumValues)[number],
  },
  [EventCategory.PROPERTY]: {
    CREATED: 'property_created' as (typeof webhookEventEnum.enumValues)[number],
    UPDATED: 'property_updated' as (typeof webhookEventEnum.enumValues)[number],
    FUNDING_MILESTONE: 'property_funding_milestone' as (typeof webhookEventEnum.enumValues)[number],
    FULLY_FUNDED: 'property_fully_funded' as (typeof webhookEventEnum.enumValues)[number],
    CONSTRUCTION_UPDATE: 'property_construction_update' as (typeof webhookEventEnum.enumValues)[number],
    CATEGORY: 'property_event' as (typeof webhookEventEnum.enumValues)[number],
  },
  [EventCategory.ROI]: {
    CALCULATED: 'roi_calculated' as (typeof webhookEventEnum.enumValues)[number],
    DISTRIBUTED: 'roi_distributed' as (typeof webhookEventEnum.enumValues)[number],
    PAYOUT_FAILED: 'roi_payout_failed' as (typeof webhookEventEnum.enumValues)[number],
    CATEGORY: 'roi_event' as (typeof webhookEventEnum.enumValues)[number],
  },
  [EventCategory.USER]: {
    REGISTERED: 'user_registered' as (typeof webhookEventEnum.enumValues)[number],
    UPDATED: 'user_updated' as (typeof webhookEventEnum.enumValues)[number],
    DELETED: 'user_deleted' as (typeof webhookEventEnum.enumValues)[number],
    LOGIN: 'user_login' as (typeof webhookEventEnum.enumValues)[number],
    LOGOUT: 'user_logout' as (typeof webhookEventEnum.enumValues)[number],
    TIER_CHANGED: 'user_tier_changed' as (typeof webhookEventEnum.enumValues)[number],
    CATEGORY: 'user_event' as (typeof webhookEventEnum.enumValues)[number],
  },
  [EventCategory.WALLET]: {
    CREATED: 'wallet_created' as (typeof webhookEventEnum.enumValues)[number],
    FUNDED: 'wallet_funded' as (typeof webhookEventEnum.enumValues)[number],
    WITHDRAWAL: 'wallet_withdrawal' as (typeof webhookEventEnum.enumValues)[number],
    TRANSFER: 'wallet_transfer' as (typeof webhookEventEnum.enumValues)[number],
    TRANSACTION_PROCESSED: 'transaction_processed' as (typeof webhookEventEnum.enumValues)[number],
    CATEGORY: 'wallet_event' as (typeof webhookEventEnum.enumValues)[number],
  },
  [EventCategory.SYSTEM]: {
    ALERT: 'system_alert' as (typeof webhookEventEnum.enumValues)[number],
    MAINTENANCE: 'system_maintenance' as (typeof webhookEventEnum.enumValues)[number],
    CATEGORY: 'system_event' as (typeof webhookEventEnum.enumValues)[number],
  },
  [EventCategory.SECURITY]: {
    ALERT: 'security_alert' as (typeof webhookEventEnum.enumValues)[number],
    SUSPICIOUS_ACTIVITY: 'suspicious_activity' as (typeof webhookEventEnum.enumValues)[number],
    CATEGORY: 'security_event' as (typeof webhookEventEnum.enumValues)[number],
  },
  GENERAL: 'general' as (typeof webhookEventEnum.enumValues)[number],
};

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
  category: EventCategory,
  eventType: (typeof webhookEventEnum.enumValues)[number],
  payload: Record<string, any>,
  options: {
    triggerCategoryEvent?: boolean;
    priority?: 'high' | 'normal' | 'low';
    idempotencyKey?: string;
  } = {}
) {
  try {
    const { triggerCategoryEvent = true, priority = 'normal', idempotencyKey } = options;
    
    // Track event in logs
    logger.info(`Business event triggered: ${category}/${eventType}`, {
      category,
      eventType,
      priority,
      idempotencyKey,
      payloadSize: JSON.stringify(payload).length,
    });
    
    // Enrich the payload with standard fields
    const enrichedPayload = enrichPayload(eventType, payload);
    
    // Trigger the specific event
    await triggerEvent(eventType, enrichedPayload);
    
    // Optionally trigger the category event (e.g., "investment_event" for all investment events)
    if (triggerCategoryEvent && EventTypes[category]?.CATEGORY) {
      await triggerEvent(
        EventTypes[category].CATEGORY,
        {
          ...enrichedPayload,
          event_type: EventTypes[category].CATEGORY,
          specific_event_type: eventType,
        }
      );
    }
    
    // Log successful triggering
    logger.info(`Business event successfully triggered: ${category}/${eventType}`);
    
    return { success: true };
  } catch (error: any) {
    logger.error(`Error triggering business event ${category}/${eventType}: ${error?.message}`, {
      error: error?.stack,
      category,
      eventType,
    });
    
    return { success: false, error: error?.message };
  }
}

/**
 * Investment Events
 */
export const InvestmentEvents = {
  created: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.INVESTMENT, EventTypes[EventCategory.INVESTMENT].CREATED, payload),
  
  completed: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.INVESTMENT, EventTypes[EventCategory.INVESTMENT].COMPLETED, payload),
  
  cancelled: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.INVESTMENT, EventTypes[EventCategory.INVESTMENT].CANCELLED, payload),
  
  approved: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.INVESTMENT, EventTypes[EventCategory.INVESTMENT].APPROVED, payload),
  
  declined: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.INVESTMENT, EventTypes[EventCategory.INVESTMENT].DECLINED, payload),
  
  refunded: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.INVESTMENT, EventTypes[EventCategory.INVESTMENT].REFUNDED, payload),
};

/**
 * KYC Events
 */
export const KycEvents = {
  submitted: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.KYC, EventTypes[EventCategory.KYC].SUBMITTED, payload),
  
  approved: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.KYC, EventTypes[EventCategory.KYC].APPROVED, payload),
  
  rejected: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.KYC, EventTypes[EventCategory.KYC].REJECTED, payload),
  
  updated: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.KYC, EventTypes[EventCategory.KYC].UPDATED, payload),
};

/**
 * Property Events
 */
export const PropertyEvents = {
  created: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.PROPERTY, EventTypes[EventCategory.PROPERTY].CREATED, payload),
  
  updated: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.PROPERTY, EventTypes[EventCategory.PROPERTY].UPDATED, payload),
  
  fundingMilestone: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.PROPERTY, EventTypes[EventCategory.PROPERTY].FUNDING_MILESTONE, payload),
  
  fullyFunded: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.PROPERTY, EventTypes[EventCategory.PROPERTY].FULLY_FUNDED, payload),
  
  constructionUpdate: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.PROPERTY, EventTypes[EventCategory.PROPERTY].CONSTRUCTION_UPDATE, payload),
};

/**
 * ROI Events
 */
export const RoiEvents = {
  calculated: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.ROI, EventTypes[EventCategory.ROI].CALCULATED, payload),
  
  distributed: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.ROI, EventTypes[EventCategory.ROI].DISTRIBUTED, payload),
  
  payoutFailed: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.ROI, EventTypes[EventCategory.ROI].PAYOUT_FAILED, payload),
};

/**
 * User Events
 */
export const UserEvents = {
  registered: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.USER, EventTypes[EventCategory.USER].REGISTERED, payload),
  
  updated: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.USER, EventTypes[EventCategory.USER].UPDATED, payload),
  
  deleted: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.USER, EventTypes[EventCategory.USER].DELETED, payload),
  
  login: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.USER, EventTypes[EventCategory.USER].LOGIN, payload),
  
  logout: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.USER, EventTypes[EventCategory.USER].LOGOUT, payload),
  
  tierChanged: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.USER, EventTypes[EventCategory.USER].TIER_CHANGED, payload),
};

/**
 * Wallet Events
 */
export const WalletEvents = {
  created: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.WALLET, EventTypes[EventCategory.WALLET].CREATED, payload),
  
  funded: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.WALLET, EventTypes[EventCategory.WALLET].FUNDED, payload),
  
  withdrawal: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.WALLET, EventTypes[EventCategory.WALLET].WITHDRAWAL, payload),
  
  transfer: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.WALLET, EventTypes[EventCategory.WALLET].TRANSFER, payload),
  
  transactionProcessed: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.WALLET, EventTypes[EventCategory.WALLET].TRANSACTION_PROCESSED, payload),
};

/**
 * System Events
 */
export const SystemEvents = {
  alert: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.SYSTEM, EventTypes[EventCategory.SYSTEM].ALERT, payload),
  
  maintenance: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.SYSTEM, EventTypes[EventCategory.SYSTEM].MAINTENANCE, payload),
};

/**
 * Security Events
 */
export const SecurityEvents = {
  alert: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.SECURITY, EventTypes[EventCategory.SECURITY].ALERT, payload),
  
  suspiciousActivity: (payload: Record<string, any>) => 
    triggerBusinessEvent(EventCategory.SECURITY, EventTypes[EventCategory.SECURITY].SUSPICIOUS_ACTIVITY, payload),
};