import { Request, Response } from 'express';
import { db } from '../db';
import { 
  esgScores, 
  utilityDataRecords, 
  sustainabilityProjects,
  properties,
  users,
  insertEsgScoreSchema,
  insertUtilityDataRecordSchema,
  insertSustainabilityProjectSchema
} from '@shared/schema';
import { eq, and, sql, desc, inArray, asc, sum, count, between } from 'drizzle-orm';
import { getSocketIo } from '../socketio';
import { ZodError } from 'zod';

// Constants for carbon footprint calculation
const CARBON_PER_KWH = 0.92; // kg CO2 per kWh (varies by region/energy source)
const CARBON_PER_THERM = 5.3; // kg CO2 per therm
const CARBON_PER_GALLON = 0.005; // kg CO2 per gallon of water

/**
 * Get ESG score for a property
 */
export const getPropertyEsgScore = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    
    // Check if ESG score exists
    const score = await db.query.esgScores.findFirst({
      where: eq(esgScores.propertyId, propertyId),
      orderBy: [desc(esgScores.lastAudited)]
    });
    
    if (!score) {
      return res.status(404).json({ message: 'ESG score not found for this property' });
    }
    
    // Get property details
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    return res.status(200).json({
      score,
      property: {
        id: property.id,
        name: property.name,
        location: property.location,
        type: property.type
      }
    });
  } catch (error: any) {
    console.error('Error getting property ESG score:', error);
    return res.status(500).json({ 
      message: 'Failed to get property ESG score', 
      error: error.message 
    });
  }
};

/**
 * Create or update ESG score for a property
 */
export const updatePropertyEsgScore = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { propertyId } = req.params;
    const data = req.body;
    
    // Check if property exists
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Validate data
    const validatedData = insertEsgScoreSchema.parse({
      ...data,
      propertyId,
      auditedBy: req.user.id,
      lastAudited: new Date()
    });
    
    // Check if ESG score already exists
    const existing = await db.query.esgScores.findFirst({
      where: eq(esgScores.propertyId, propertyId)
    });
    
    let result;
    
    if (existing) {
      // Update existing score
      const [updated] = await db.update(esgScores)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(esgScores.id, existing.id))
        .returning();
      
      result = updated;
    } else {
      // Create new score
      const [created] = await db.insert(esgScores)
        .values(validatedData)
        .returning();
      
      result = created;
    }
    
    // Emit socket event for real-time updates
    const io = getSocketIo();
    if (io) {
      io.emit('esg-score-updated', {
        propertyId,
        scoreId: result.id,
        timestamp: new Date()
      });
    }
    
    return res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Invalid data provided',
        errors: error.errors 
      });
    }
    
    console.error('Error updating property ESG score:', error);
    return res.status(500).json({ 
      message: 'Failed to update property ESG score', 
      error: error.message 
    });
  }
};

/**
 * Add utility data record
 */
export const addUtilityDataRecord = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const data = req.body;
    
    // Validate data
    const validatedData = insertUtilityDataRecordSchema.parse(data);
    
    // Check if property exists
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, validatedData.propertyId)
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Add utility data record
    const [record] = await db.insert(utilityDataRecords)
      .values(validatedData)
      .returning();
    
    // Update carbon footprint in ESG score
    await updateCarbonFootprint(validatedData.propertyId);
    
    return res.status(201).json(record);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Invalid data provided',
        errors: error.errors 
      });
    }
    
    console.error('Error adding utility data record:', error);
    return res.status(500).json({ 
      message: 'Failed to add utility data record', 
      error: error.message 
    });
  }
};

/**
 * Get utility data records for a property
 */
export const getPropertyUtilityData = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate, dataType } = req.query;
    
    // Check if property exists
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Build query
    let query = db.select()
      .from(utilityDataRecords)
      .where(eq(utilityDataRecords.propertyId, propertyId))
      .orderBy(asc(utilityDataRecords.recordDate));
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query = query.where(
        between(
          utilityDataRecords.recordDate, 
          new Date(startDate as string), 
          new Date(endDate as string)
        )
      );
    }
    
    // Add data type filter if provided
    if (dataType) {
      query = query.where(eq(utilityDataRecords.dataType, dataType as string));
    }
    
    const records = await query;
    
    // Calculate aggregates by data type
    const aggregates = await db.select({
      dataType: utilityDataRecords.dataType,
      totalConsumption: sum(utilityDataRecords.consumption),
      recordCount: count(utilityDataRecords.id),
      avgConsumption: sql`AVG(${utilityDataRecords.consumption})`
    })
    .from(utilityDataRecords)
    .where(eq(utilityDataRecords.propertyId, propertyId))
    .groupBy(utilityDataRecords.dataType);
    
    return res.status(200).json({
      records,
      aggregates
    });
  } catch (error: any) {
    console.error('Error getting property utility data:', error);
    return res.status(500).json({ 
      message: 'Failed to get property utility data', 
      error: error.message 
    });
  }
};

/**
 * Calculate carbon footprint for a property
 */
export const calculateCarbonFootprint = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    const footprint = await calculatePropertyCarbonFootprint(propertyId);
    
    return res.status(200).json({
      propertyId,
      carbonFootprint: footprint,
      unit: 'kg CO2e',
      calculatedAt: new Date()
    });
  } catch (error: any) {
    console.error('Error calculating carbon footprint:', error);
    return res.status(500).json({ 
      message: 'Failed to calculate carbon footprint', 
      error: error.message 
    });
  }
};

/**
 * Update carbon footprint in ESG score
 */
async function updateCarbonFootprint(propertyId: string) {
  try {
    const footprint = await calculatePropertyCarbonFootprint(propertyId);
    
    // Check if ESG score exists
    const existing = await db.query.esgScores.findFirst({
      where: eq(esgScores.propertyId, propertyId)
    });
    
    if (existing) {
      // Update existing score
      await db.update(esgScores)
        .set({
          carbonFootprint: footprint,
          updatedAt: new Date()
        })
        .where(eq(esgScores.id, existing.id));
    } else {
      // Create new score with just the carbon footprint
      await db.insert(esgScores)
        .values({
          propertyId,
          carbonFootprint: footprint,
          lastAudited: new Date()
        });
    }
    
    return footprint;
  } catch (error) {
    console.error('Error updating carbon footprint:', error);
    throw error;
  }
}

/**
 * Calculate carbon footprint for a property
 */
async function calculatePropertyCarbonFootprint(propertyId: string): Promise<number> {
  try {
    // Get utility data for the property
    const records = await db.select()
      .from(utilityDataRecords)
      .where(eq(utilityDataRecords.propertyId, propertyId));
    
    let totalFootprint = 0;
    
    for (const record of records) {
      const consumption = parseFloat(record.consumption.toString());
      
      if (record.dataType === 'electricity') {
        // Electricity in kWh
        totalFootprint += consumption * CARBON_PER_KWH;
      } 
      else if (record.dataType === 'gas') {
        // Natural gas in therms
        totalFootprint += consumption * CARBON_PER_THERM;
      }
      else if (record.dataType === 'water') {
        // Water in gallons
        totalFootprint += consumption * CARBON_PER_GALLON;
      }
      // Add more types as needed
    }
    
    return totalFootprint;
  } catch (error) {
    console.error('Error calculating property carbon footprint:', error);
    throw error;
  }
}

/**
 * Add sustainability project
 */
export const addSustainabilityProject = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const data = req.body;
    
    // Validate data
    const validatedData = insertSustainabilityProjectSchema.parse({
      ...data,
      createdBy: req.user.id
    });
    
    // Check if property exists
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, validatedData.propertyId)
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Add sustainability project
    const [project] = await db.insert(sustainabilityProjects)
      .values(validatedData)
      .returning();
    
    return res.status(201).json(project);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Invalid data provided',
        errors: error.errors 
      });
    }
    
    console.error('Error adding sustainability project:', error);
    return res.status(500).json({ 
      message: 'Failed to add sustainability project', 
      error: error.message 
    });
  }
};

/**
 * Update sustainability project
 */
export const updateSustainabilityProject = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    const data = req.body;
    
    // Check if project exists
    const project = await db.query.sustainabilityProjects.findFirst({
      where: eq(sustainabilityProjects.id, id)
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Sustainability project not found' });
    }
    
    // Update project
    const [updated] = await db.update(sustainabilityProjects)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(sustainabilityProjects.id, id))
      .returning();
    
    return res.status(200).json(updated);
  } catch (error: any) {
    console.error('Error updating sustainability project:', error);
    return res.status(500).json({ 
      message: 'Failed to update sustainability project', 
      error: error.message 
    });
  }
};

/**
 * Get sustainability projects for a property
 */
export const getPropertySustainabilityProjects = async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Get projects
    const projects = await db.select({
      project: sustainabilityProjects,
      createdByUser: {
        id: users.id,
        username: users.username
      }
    })
    .from(sustainabilityProjects)
    .leftJoin(users, eq(sustainabilityProjects.createdBy, users.id))
    .where(eq(sustainabilityProjects.propertyId, propertyId))
    .orderBy(desc(sustainabilityProjects.createdAt));
    
    // Calculate cost savings across all completed projects
    const savingsResult = await db.select({
      totalProjected: sum(sustainabilityProjects.projectedSavings),
      totalActual: sum(sustainabilityProjects.actualSavings)
    })
    .from(sustainabilityProjects)
    .where(and(
      eq(sustainabilityProjects.propertyId, propertyId),
      eq(sustainabilityProjects.status, 'completed')
    ));
    
    return res.status(200).json({
      projects,
      summary: {
        totalProjects: projects.length,
        totalProjectedSavings: savingsResult[0]?.totalProjected || 0,
        totalActualSavings: savingsResult[0]?.totalActual || 0,
        roi: calculateProjectROI(projects)
      }
    });
  } catch (error: any) {
    console.error('Error getting property sustainability projects:', error);
    return res.status(500).json({ 
      message: 'Failed to get property sustainability projects', 
      error: error.message 
    });
  }
};

/**
 * Calculate ROI for sustainability projects
 */
function calculateProjectROI(projects: any[]): number {
  let totalCost = 0;
  let totalSavings = 0;
  
  for (const projectData of projects) {
    const project = projectData.project;
    if (project.status === 'completed' && project.actualCost && project.actualSavings) {
      totalCost += parseFloat(project.actualCost.toString());
      totalSavings += parseFloat(project.actualSavings.toString());
    }
  }
  
  if (totalCost === 0) return 0;
  
  return (totalSavings / totalCost) * 100;
}