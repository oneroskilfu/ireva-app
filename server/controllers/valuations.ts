import { Request, Response } from 'express';
import { db } from '../db';
import { properties, propertyValuations, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { insertPropertyValuationSchema } from '@shared/schema';
import { broadcastToAdmins } from '../socketio';

/**
 * Add a new property valuation
 */
export const addPropertyValuation = async (req: Request, res: Response) => {
  try {
    const validatedData = insertPropertyValuationSchema.parse(req.body);
    
    // Verify the property exists
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, validatedData.propertyId),
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Set the admin user as creator
    const createdBy = req.user?.id;
    
    // Create the valuation record
    const [valuation] = await db.insert(propertyValuations).values({
      ...validatedData,
      createdBy,
    }).returning();
    
    // Notify admin users about the new valuation via WebSocket
    broadcastToAdmins({
      type: 'propertyValuation:new',
      propertyId: property.id,
      propertyName: property.name,
      valuation: valuation.valuation,
      valuationDate: valuation.valuationDate
    });
    
    return res.status(201).json(valuation);
  } catch (error: any) {
    console.error('Error creating property valuation:', error);
    return res.status(400).json({ 
      message: 'Failed to add property valuation', 
      error: error.message 
    });
  }
};

/**
 * Get all valuations for a property
 */
export const getPropertyValuations = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    
    // Verify the property exists
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Get all valuations for the property, sorted by date (most recent first)
    const valuations = await db.query.propertyValuations.findMany({
      where: eq(propertyValuations.propertyId, propertyId),
      orderBy: (valuations, { desc }) => [desc(valuations.valuationDate)],
      with: {
        createdByUser: {
          columns: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });
    
    return res.status(200).json(valuations);
  } catch (error: any) {
    console.error('Error retrieving property valuations:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve property valuations', 
      error: error.message 
    });
  }
};

/**
 * Get property valuation history with trend analysis
 */
export const getValuationHistory = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    
    // Get all valuations for the property, sorted by date
    const valuations = await db.query.propertyValuations.findMany({
      where: eq(propertyValuations.propertyId, propertyId),
      orderBy: (valuations, { asc }) => [asc(valuations.valuationDate)],
    });
    
    if (valuations.length === 0) {
      return res.status(200).json({
        valuations: [],
        trend: null,
        percentChange: null,
      });
    }
    
    // Calculate trend data
    const firstValuation = valuations[0].valuation;
    const lastValuation = valuations[valuations.length - 1].valuation;
    
    // Convert from numeric strings to numbers for calculation
    const firstValue = parseFloat(String(firstValuation));
    const lastValue = parseFloat(String(lastValuation));
    
    // Calculate percent change
    const percentChange = ((lastValue - firstValue) / firstValue) * 100;
    
    // Determine trend direction
    const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'stable';
    
    return res.status(200).json({
      valuations,
      trend,
      percentChange: parseFloat(percentChange.toFixed(2)),
    });
  } catch (error: any) {
    console.error('Error retrieving valuation history:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve valuation history', 
      error: error.message 
    });
  }
};

/**
 * Delete a property valuation (admin only)
 */
export const deletePropertyValuation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find the valuation first to verify it exists
    const valuation = await db.query.propertyValuations.findFirst({
      where: eq(propertyValuations.id, id),
    });
    
    if (!valuation) {
      return res.status(404).json({ message: 'Property valuation not found' });
    }
    
    // Delete the valuation
    await db.delete(propertyValuations).where(eq(propertyValuations.id, id));
    
    return res.status(200).json({ message: 'Property valuation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting property valuation:', error);
    return res.status(500).json({ 
      message: 'Failed to delete property valuation', 
      error: error.message 
    });
  }
};

/**
 * Get latest valuation for each property (dashboard overview)
 */
export const getLatestValuations = async (req: Request, res: Response) => {
  try {
    // Get all properties
    const allProperties = await db.query.properties.findMany({
      columns: {
        id: true,
        name: true,
        type: true,
        location: true,
        fundingGoal: true,
        fundingStatus: true,
        imageUrl: true,
      }
    });
    
    // For each property, get the latest valuation
    const propertiesWithValuations = await Promise.all(
      allProperties.map(async (property) => {
        const latestValuation = await db.query.propertyValuations.findFirst({
          where: eq(propertyValuations.propertyId, property.id),
          orderBy: (valuations, { desc }) => [desc(valuations.valuationDate)],
        });
        
        return {
          ...property,
          latestValuation: latestValuation || null,
        };
      })
    );
    
    return res.status(200).json(propertiesWithValuations);
  } catch (error: any) {
    console.error('Error retrieving latest valuations:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve latest valuations', 
      error: error.message 
    });
  }
};