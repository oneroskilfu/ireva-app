import { Request, Response } from 'express';
import { db } from '../db';
import { 
  marketComparables, 
  propertyValuationModels, 
  marketDataSources, 
  marketDataSyncLogs,
  properties,
  insertMarketComparableSchema,
  insertPropertyValuationModelSchema,
  insertMarketDataSourceSchema
} from '@shared/schema';
import { eq, and, sql, desc, inArray, not } from 'drizzle-orm';
import { getSocketIo } from '../socketio';
import { ZodError } from 'zod';
import axios from 'axios';

/**
 * Get market comparables based on property type and region
 */
export const getMarketComparables = async (req: Request, res: Response) => {
  try {
    const { propertyType, region } = req.query;
    
    if (!propertyType && !region) {
      return res.status(400).json({ 
        message: 'At least one filter parameter (propertyType, region) is required' 
      });
    }
    
    let query = db.select().from(marketComparables);
    
    if (propertyType) {
      query = query.where(eq(marketComparables.propertyType, propertyType as string));
    }
    
    if (region) {
      query = query.where(eq(marketComparables.region, region as string));
    }
    
    const comparables = await query.orderBy(desc(marketComparables.updatedAt));
    
    return res.status(200).json(comparables);
  } catch (error: any) {
    console.error('Error getting market comparables:', error);
    return res.status(500).json({ 
      message: 'Failed to get market comparables', 
      error: error.message 
    });
  }
};

/**
 * Add a new market comparable
 */
export const addMarketComparable = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const validatedData = insertMarketComparableSchema.parse(req.body);
    
    const [comparable] = await db.insert(marketComparables)
      .values({
        ...validatedData,
        updatedAt: new Date()
      })
      .returning();
    
    return res.status(201).json(comparable);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Invalid data provided',
        errors: error.errors 
      });
    }
    
    console.error('Error adding market comparable:', error);
    return res.status(500).json({ 
      message: 'Failed to add market comparable', 
      error: error.message 
    });
  }
};

/**
 * Update an existing market comparable
 */
export const updateMarketComparable = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    const data = req.body;
    
    // Check if comparable exists
    const existing = await db.query.marketComparables.findFirst({
      where: eq(marketComparables.id, id)
    });
    
    if (!existing) {
      return res.status(404).json({ message: 'Market comparable not found' });
    }
    
    // Update the comparable
    const [updated] = await db.update(marketComparables)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(marketComparables.id, id))
      .returning();
    
    return res.status(200).json(updated);
  } catch (error: any) {
    console.error('Error updating market comparable:', error);
    return res.status(500).json({ 
      message: 'Failed to update market comparable', 
      error: error.message 
    });
  }
};

/**
 * Delete a market comparable
 */
export const deleteMarketComparable = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    
    // Check if comparable exists
    const existing = await db.query.marketComparables.findFirst({
      where: eq(marketComparables.id, id)
    });
    
    if (!existing) {
      return res.status(404).json({ message: 'Market comparable not found' });
    }
    
    // Check if it's referenced by any valuation models
    const models = await db.query.propertyValuationModels.findFirst({
      where: sql`${propertyValuationModels.comparableIds}::jsonb @> ${JSON.stringify([id])}::jsonb`
    });
    
    if (models) {
      return res.status(400).json({ 
        message: 'Cannot delete market comparable that is referenced by existing valuation models' 
      });
    }
    
    // Delete the comparable
    await db.delete(marketComparables).where(eq(marketComparables.id, id));
    
    return res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting market comparable:', error);
    return res.status(500).json({ 
      message: 'Failed to delete market comparable', 
      error: error.message 
    });
  }
};

/**
 * Run automated valuation model for a property
 */
export const runAutomatedValuation = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { propertyId, modelType } = req.body;
    
    if (!propertyId || !modelType) {
      return res.status(400).json({ 
        message: 'propertyId and modelType are required' 
      });
    }
    
    // Get property details
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Get market comparables based on property type and region
    const propertyRegion = property.location && typeof property.location === 'object' 
      ? (property.location as any).state || (property.location as any).region
      : null;
    
    if (!property.type || !propertyRegion) {
      return res.status(400).json({ 
        message: 'Property must have a type and location.state/region defined' 
      });
    }
    
    const comparables = await db.select()
      .from(marketComparables)
      .where(and(
        eq(marketComparables.propertyType, property.type),
        eq(marketComparables.region, propertyRegion)
      ));
    
    if (comparables.length === 0) {
      return res.status(404).json({ 
        message: 'No market comparables found for this property type and region' 
      });
    }
    
    // Calculate AVM based on model type
    let estimatedValue = 0;
    let confidenceScore = 0;
    const comparableIds = comparables.map(c => c.id);
    
    if (modelType === 'cap_rate') {
      // Cap Rate Model: Value = NOI / Cap Rate
      if (!property.annualNOI) {
        return res.status(400).json({ 
          message: 'Property must have annualNOI defined for cap rate valuation' 
        });
      }
      
      const avgCapRate = comparables.reduce((sum, comp) => {
        return sum + (comp.avgCapRate ? parseFloat(comp.avgCapRate.toString()) : 0);
      }, 0) / comparables.length;
      
      if (avgCapRate <= 0) {
        return res.status(400).json({ 
          message: 'Invalid cap rate calculated from market comparables' 
        });
      }
      
      estimatedValue = parseFloat(property.annualNOI.toString()) / avgCapRate;
      confidenceScore = calculateConfidenceScore(comparables, 'cap_rate');
    } 
    else if (modelType === 'price_per_sqft') {
      // Price per Square Foot Model
      if (!property.squareFootage) {
        return res.status(400).json({ 
          message: 'Property must have squareFootage defined for price per sqft valuation' 
        });
      }
      
      const avgSqFtPrice = comparables.reduce((sum, comp) => {
        return sum + (comp.avgSqFtPrice ? parseFloat(comp.avgSqFtPrice.toString()) : 0);
      }, 0) / comparables.length;
      
      if (avgSqFtPrice <= 0) {
        return res.status(400).json({ 
          message: 'Invalid square foot price calculated from market comparables' 
        });
      }
      
      estimatedValue = parseFloat(property.squareFootage.toString()) * avgSqFtPrice;
      confidenceScore = calculateConfidenceScore(comparables, 'price_per_sqft');
    }
    else {
      return res.status(400).json({ 
        message: `Unsupported model type: ${modelType}` 
      });
    }
    
    // Save valuation model result
    const [valuationModel] = await db.insert(propertyValuationModels).values({
      propertyId,
      modelType,
      estimatedValue,
      confidenceScore,
      comparableIds,
      parameters: req.body.parameters || {},
      createdBy: req.user.id,
      metadata: {
        comparables: comparables.map(c => ({
          id: c.id,
          propertyType: c.propertyType,
          region: c.region,
          avgCapRate: c.avgCapRate,
          avgNOI: c.avgNOI,
          avgSqFtPrice: c.avgSqFtPrice
        }))
      }
    }).returning();
    
    // Emit socket event for real-time updates
    const io = getSocketIo();
    if (io) {
      io.emit('property-valuation-updated', {
        propertyId,
        valuationId: valuationModel.id,
        estimatedValue,
        modelType,
        timestamp: new Date()
      });
    }
    
    return res.status(200).json({
      valuationModel,
      estimatedValue,
      confidenceScore,
      comparablesUsed: comparables.length
    });
  } catch (error: any) {
    console.error('Error running automated valuation:', error);
    return res.status(500).json({ 
      message: 'Failed to run automated valuation', 
      error: error.message 
    });
  }
};

/**
 * Calculate confidence score based on the number and quality of comparables
 */
function calculateConfidenceScore(comparables: any[], modelType: string): number {
  // Base factors for confidence calculation
  const numComparables = comparables.length;
  const recentDataPoints = comparables.filter(c => {
    const updatedAt = new Date(c.updatedAt);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return updatedAt > threeMonthsAgo;
  }).length;
  
  // Calculate coefficient of variation (spread) for key metrics
  let coefficientOfVariation = 0;
  
  if (modelType === 'cap_rate' && comparables.some(c => c.avgCapRate)) {
    const capRates = comparables
      .filter(c => c.avgCapRate)
      .map(c => parseFloat(c.avgCapRate.toString()));
    
    const mean = capRates.reduce((sum, rate) => sum + rate, 0) / capRates.length;
    const variance = capRates.reduce((sum, rate) => sum + Math.pow(rate - mean, 2), 0) / capRates.length;
    const stdDev = Math.sqrt(variance);
    
    coefficientOfVariation = stdDev / mean;
  } 
  else if (modelType === 'price_per_sqft' && comparables.some(c => c.avgSqFtPrice)) {
    const prices = comparables
      .filter(c => c.avgSqFtPrice)
      .map(c => parseFloat(c.avgSqFtPrice.toString()));
    
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    
    coefficientOfVariation = stdDev / mean;
  }
  
  // Calculate score components (higher is better)
  const quantityScore = Math.min(numComparables / 10, 1) * 40; // Max 40 points for quantity
  const recencyScore = (recentDataPoints / numComparables) * 30; // Max 30 points for recency
  const consistencyScore = (1 - Math.min(coefficientOfVariation, 0.5) / 0.5) * 30; // Max 30 points for consistency
  
  // Combine scores - maximum is 100
  return Math.round(quantityScore + recencyScore + consistencyScore);
}

/**
 * Get valuation models for a property
 */
export const getPropertyValuations = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    
    const valuations = await db.query.propertyValuationModels.findMany({
      where: eq(propertyValuationModels.propertyId, propertyId),
      orderBy: [desc(propertyValuationModels.calculatedAt)]
    });
    
    return res.status(200).json(valuations);
  } catch (error: any) {
    console.error('Error getting property valuations:', error);
    return res.status(500).json({ 
      message: 'Failed to get property valuations', 
      error: error.message 
    });
  }
};

/**
 * Get market data sources
 */
export const getMarketDataSources = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const sources = await db.query.marketDataSources.findMany({
      orderBy: [desc(marketDataSources.lastSyncedAt)]
    });
    
    // Mask API keys for security
    const maskedSources = sources.map(source => ({
      ...source,
      apiKey: source.apiKey ? '••••••••' + source.apiKey.slice(-4) : null
    }));
    
    return res.status(200).json(maskedSources);
  } catch (error: any) {
    console.error('Error getting market data sources:', error);
    return res.status(500).json({ 
      message: 'Failed to get market data sources', 
      error: error.message 
    });
  }
};

/**
 * Add a new market data source
 */
export const addMarketDataSource = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const validatedData = insertMarketDataSourceSchema.parse(req.body);
    
    const [source] = await db.insert(marketDataSources)
      .values({
        ...validatedData,
        credentialsLastUpdatedAt: new Date()
      })
      .returning();
    
    // Mask API key for response
    const maskedSource = {
      ...source,
      apiKey: source.apiKey ? '••••••••' + source.apiKey.slice(-4) : null
    };
    
    return res.status(201).json(maskedSource);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Invalid data provided',
        errors: error.errors 
      });
    }
    
    console.error('Error adding market data source:', error);
    return res.status(500).json({ 
      message: 'Failed to add market data source', 
      error: error.message 
    });
  }
};

/**
 * Update an existing market data source
 */
export const updateMarketDataSource = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    const data = req.body;
    
    // Check if source exists
    const existing = await db.query.marketDataSources.findFirst({
      where: eq(marketDataSources.id, id)
    });
    
    if (!existing) {
      return res.status(404).json({ message: 'Market data source not found' });
    }
    
    // Check if credentials are being updated
    const credentialsUpdated = data.apiKey !== undefined || data.apiEndpoint !== undefined;
    
    // Update the source
    const [updated] = await db.update(marketDataSources)
      .set({
        ...data,
        ...(credentialsUpdated ? { credentialsLastUpdatedAt: new Date() } : {})
      })
      .where(eq(marketDataSources.id, id))
      .returning();
    
    // Mask API key for response
    const maskedSource = {
      ...updated,
      apiKey: updated.apiKey ? '••••••••' + updated.apiKey.slice(-4) : null
    };
    
    return res.status(200).json(maskedSource);
  } catch (error: any) {
    console.error('Error updating market data source:', error);
    return res.status(500).json({ 
      message: 'Failed to update market data source', 
      error: error.message 
    });
  }
};

/**
 * Manually trigger a sync for a market data source
 */
export const triggerMarketDataSync = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    
    // Check if source exists and is active
    const source = await db.query.marketDataSources.findFirst({
      where: and(
        eq(marketDataSources.id, id),
        eq(marketDataSources.isActive, true)
      )
    });
    
    if (!source) {
      return res.status(404).json({ message: 'Active market data source not found' });
    }
    
    // Check if there's already a sync in progress
    const inProgressSync = await db.query.marketDataSyncLogs.findFirst({
      where: and(
        eq(marketDataSyncLogs.sourceId, id),
        eq(marketDataSyncLogs.status, 'running')
      )
    });
    
    if (inProgressSync) {
      return res.status(409).json({ 
        message: 'Sync already in progress for this source',
        syncLog: inProgressSync
      });
    }
    
    // Create a new sync log
    const [syncLog] = await db.insert(marketDataSyncLogs)
      .values({
        sourceId: id,
        status: 'running',
        syncType: 'manual',
        recordsProcessed: 0,
        recordsUpdated: 0,
        recordsFailed: 0
      })
      .returning();
    
    // Start the sync process asynchronously
    // In a real-world scenario, this would likely be handled by a background job/worker
    syncMarketData(source, syncLog.id)
      .catch(error => {
        console.error(`Error in market data sync for source ${id}:`, error);
      });
    
    return res.status(200).json({ 
      message: 'Market data sync started',
      syncLog
    });
  } catch (error: any) {
    console.error('Error triggering market data sync:', error);
    return res.status(500).json({ 
      message: 'Failed to trigger market data sync', 
      error: error.message 
    });
  }
};

/**
 * Function to synchronize market data from an external source
 */
async function syncMarketData(source: any, syncLogId: string) {
  try {
    if (!source.apiEndpoint || !source.apiKey) {
      await updateSyncLogStatus(syncLogId, 'failed', {
        errorMessage: 'Missing API credentials'
      });
      return;
    }
    
    // Make API request to the source
    const response = await axios.get(source.apiEndpoint, {
      headers: {
        'Authorization': `Bearer ${source.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data || !Array.isArray(response.data)) {
      await updateSyncLogStatus(syncLogId, 'failed', {
        errorMessage: 'Invalid response format from API'
      });
      return;
    }
    
    const marketData = response.data;
    let recordsProcessed = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;
    
    // Process each market data record
    for (const record of marketData) {
      recordsProcessed++;
      
      try {
        if (!record.propertyType || !record.region) {
          recordsFailed++;
          continue;
        }
        
        // Check if comparable already exists
        const existing = await db.query.marketComparables.findFirst({
          where: and(
            eq(marketComparables.propertyType, record.propertyType),
            eq(marketComparables.region, record.region),
            eq(marketComparables.source, source.name)
          )
        });
        
        if (existing) {
          // Update existing record
          await db.update(marketComparables)
            .set({
              avgCapRate: record.capRate,
              avgNOI: record.noi,
              avgSqFtPrice: record.pricePerSqFt,
              transactionCount: record.transactionCount,
              timeframe: record.timeframe || 'quarterly',
              updatedAt: new Date(),
              metadata: {
                ...record.metadata,
                lastSyncedAt: new Date()
              }
            })
            .where(eq(marketComparables.id, existing.id));
        } else {
          // Insert new record
          await db.insert(marketComparables)
            .values({
              propertyType: record.propertyType,
              region: record.region,
              avgCapRate: record.capRate,
              avgNOI: record.noi,
              avgSqFtPrice: record.pricePerSqFt,
              transactionCount: record.transactionCount,
              timeframe: record.timeframe || 'quarterly',
              source: source.name,
              metadata: {
                ...record.metadata,
                lastSyncedAt: new Date()
              }
            });
        }
        
        recordsUpdated++;
      } catch (error) {
        console.error('Error processing market data record:', error);
        recordsFailed++;
      }
    }
    
    // Update sync log with success status
    await updateSyncLogStatus(syncLogId, 'completed', {
      recordsProcessed,
      recordsUpdated,
      recordsFailed
    });
    
    // Update last synced timestamp for the source
    await db.update(marketDataSources)
      .set({ lastSyncedAt: new Date() })
      .where(eq(marketDataSources.id, source.id));
    
    // Emit socket event for real-time updates
    const io = getSocketIo();
    if (io) {
      io.emit('market-data-synced', {
        sourceId: source.id,
        sourceName: source.name,
        recordsUpdated,
        timestamp: new Date()
      });
    }
  } catch (error: any) {
    console.error('Error in syncMarketData:', error);
    
    // Update sync log with failure status
    await updateSyncLogStatus(syncLogId, 'failed', {
      errorMessage: error.message || 'Unknown error during sync'
    });
  }
}

/**
 * Helper function to update sync log status
 */
async function updateSyncLogStatus(syncLogId: string, status: string, data: any = {}) {
  try {
    await db.update(marketDataSyncLogs)
      .set({
        status,
        completedAt: ['completed', 'failed'].includes(status) ? new Date() : undefined,
        recordsProcessed: data.recordsProcessed,
        recordsUpdated: data.recordsUpdated,
        recordsFailed: data.recordsFailed,
        errorMessage: data.errorMessage
      })
      .where(eq(marketDataSyncLogs.id, syncLogId));
  } catch (error) {
    console.error('Error updating sync log status:', error);
  }
}

/**
 * Get market data sync logs
 */
export const getSyncLogs = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { sourceId } = req.query;
    
    let query = db.select({
      syncLog: marketDataSyncLogs,
      sourceName: marketDataSources.name
    })
    .from(marketDataSyncLogs)
    .leftJoin(marketDataSources, eq(marketDataSyncLogs.sourceId, marketDataSources.id))
    .orderBy(desc(marketDataSyncLogs.startedAt));
    
    if (sourceId) {
      query = query.where(eq(marketDataSyncLogs.sourceId, sourceId as string));
    }
    
    const logs = await query.limit(100);
    
    return res.status(200).json(logs);
  } catch (error: any) {
    console.error('Error getting sync logs:', error);
    return res.status(500).json({ 
      message: 'Failed to get sync logs', 
      error: error.message 
    });
  }
};