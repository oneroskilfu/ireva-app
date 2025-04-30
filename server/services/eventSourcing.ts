/**
 * Event sourcing service for complex financial transactions
 * 
 * This service implements event sourcing patterns to ensure all financial 
 * transactions are recorded as immutable events, allowing for:
 * - Complete audit trail
 * - Transaction replay
 * - State reconstruction
 * - Event-based analytics
 */
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { getSocketIo } from '../socketio';
import { sql } from 'drizzle-orm';

// Event types
export enum EventType {
  INVESTMENT_CREATED = 'investment_created',
  INVESTMENT_UPDATED = 'investment_updated',
  INVESTMENT_CANCELLED = 'investment_cancelled',
  INVESTMENT_MATURED = 'investment_matured',
  INVESTMENT_WITHDRAWN = 'investment_withdrawn',
  FUNDS_DEPOSITED = 'funds_deposited',
  FUNDS_WITHDRAWN = 'funds_withdrawn',
  TRANSACTION_PROCESSED = 'transaction_processed',
  ROI_DISTRIBUTED = 'roi_distributed',
  SECONDARY_SALE_CREATED = 'secondary_sale_created',
  SECONDARY_SALE_COMPLETED = 'secondary_sale_completed',
  ESCROW_FUNDS_RELEASED = 'escrow_funds_released',
  MILESTONE_COMPLETED = 'milestone_completed'
}

// Create events table if it doesn't exist
export async function initializeEventStore() {
  // Use raw SQL to create the events table if it doesn't exist
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS financial_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type VARCHAR(50) NOT NULL,
      aggregate_id VARCHAR(50) NOT NULL,
      aggregate_type VARCHAR(50) NOT NULL,
      user_id UUID,
      data JSONB NOT NULL,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      version INTEGER NOT NULL
    )
  `);
  
  // Create indexes for efficient querying
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_financial_events_aggregate ON financial_events(aggregate_type, aggregate_id)
  `);
  
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_financial_events_type ON financial_events(event_type)
  `);
  
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_financial_events_user ON financial_events(user_id)
  `);
  
  console.log('Event store initialized successfully');
}

/**
 * Records a financial event in the event store
 */
export async function recordEvent(
  eventType: EventType,
  aggregateType: string,
  aggregateId: string,
  data: any,
  userId?: string,
  metadata?: any
) {
  try {
    // Get the current version for this aggregate
    const [currentVersion] = await db.execute(sql`
      SELECT COALESCE(MAX(version), 0) as max_version
      FROM financial_events
      WHERE aggregate_type = ${aggregateType} AND aggregate_id = ${aggregateId}
    `);
    
    const nextVersion = parseInt(currentVersion?.max_version || '0') + 1;
    
    // Insert the event
    const [event] = await db.execute(sql`
      INSERT INTO financial_events (
        event_type, aggregate_type, aggregate_id, user_id, data, metadata, version
      ) VALUES (
        ${eventType}, ${aggregateType}, ${aggregateId}, ${userId || null}, ${JSON.stringify(data)}, ${JSON.stringify(metadata || {})}, ${nextVersion}
      )
      RETURNING *
    `);
    
    // Emit the event via WebSockets
    const io = getSocketIo();
    if (io) {
      io.emit('financial-event', {
        type: eventType,
        aggregate: {
          type: aggregateType,
          id: aggregateId
        },
        version: nextVersion,
        timestamp: new Date(),
        data: data
      });
    }
    
    return event;
  } catch (error) {
    console.error('Failed to record financial event:', error);
    throw error;
  }
}

/**
 * Retrieves events for a specific aggregate
 */
export async function getEvents(aggregateType: string, aggregateId: string) {
  try {
    const events = await db.execute(sql`
      SELECT *
      FROM financial_events
      WHERE aggregate_type = ${aggregateType} AND aggregate_id = ${aggregateId}
      ORDER BY version ASC
    `);
    
    return events;
  } catch (error) {
    console.error('Failed to retrieve events:', error);
    throw error;
  }
}

/**
 * Reconstructs the state of an aggregate from its event history
 */
export async function reconstructAggregate(aggregateType: string, aggregateId: string) {
  const events = await getEvents(aggregateType, aggregateId);
  
  let state = {};
  
  for (const event of events) {
    state = applyEvent(state, event);
  }
  
  return state;
}

/**
 * Applies an event to the current state
 */
function applyEvent(state: any, event: any) {
  const eventData = event.data;
  const eventType = event.event_type;
  
  // Create a copy of the state to work with
  const newState = { ...state };
  
  switch (eventType) {
    case EventType.INVESTMENT_CREATED:
      return {
        ...newState,
        id: eventData.id,
        userId: eventData.userId,
        propertyId: eventData.propertyId,
        amount: eventData.amount,
        status: 'active',
        projectedROI: eventData.projectedROI,
        investedAt: eventData.investedAt,
        maturityDate: eventData.maturityDate
      };
      
    case EventType.INVESTMENT_UPDATED:
      return {
        ...newState,
        ...eventData
      };
      
    case EventType.INVESTMENT_MATURED:
      return {
        ...newState,
        status: 'matured',
        actualROI: eventData.actualROI,
        maturedAt: eventData.maturedAt
      };
      
    case EventType.INVESTMENT_WITHDRAWN:
      return {
        ...newState,
        status: 'withdrawn',
        withdrawnAt: eventData.withdrawnAt
      };
      
    case EventType.ROI_DISTRIBUTED:
      return {
        ...newState,
        distributedROI: (newState.distributedROI || 0) + eventData.amount,
        lastDistribution: eventData.distributionDate
      };
      
    // Add more event handlers as needed
      
    default:
      return newState;
  }
}

/**
 * Example of how to use event sourcing for an investment
 */
export async function createInvestment(investmentData: any) {
  const investmentId = uuidv4();
  
  // Record the creation event
  await recordEvent(
    EventType.INVESTMENT_CREATED,
    'investment',
    investmentId,
    {
      id: investmentId,
      ...investmentData
    },
    investmentData.userId
  );
  
  return investmentId;
}

/**
 * Example of how to use event sourcing to mature an investment
 */
export async function matureInvestment(investmentId: string, actualROI: number) {
  // Record the maturity event
  await recordEvent(
    EventType.INVESTMENT_MATURED,
    'investment',
    investmentId,
    {
      actualROI,
      maturedAt: new Date()
    }
  );
}

/**
 * Query events by type in a date range
 */
export async function queryEventsByType(
  eventType: EventType,
  startDate: Date,
  endDate: Date
) {
  try {
    const events = await db.execute(sql`
      SELECT *
      FROM financial_events
      WHERE event_type = ${eventType}
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
      ORDER BY created_at ASC
    `);
    
    return events;
  } catch (error) {
    console.error(`Failed to query events of type ${eventType}:`, error);
    throw error;
  }
}