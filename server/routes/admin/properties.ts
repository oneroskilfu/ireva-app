import express, { Request, Response } from 'express';
import { ensureAdmin } from '../../auth-jwt';
import { Property, Milestone } from '../../../shared/interfaces';
import multer from 'multer';
import { db } from '../../db';
import { storage } from '../../storage';
import { properties as propertiesTable, milestones as milestonesTable } from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Schema validation for creating properties
const createPropertySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(20),
  location: z.object({
    address: z.string(),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  fundingGoal: z.number().positive(),
  investmentTenor: z.number().int().positive(),
  roiPercentage: z.number().positive(),
});

// Schema validation for creating milestones
const createMilestoneSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string(),
  completionDate: z.string().transform(str => new Date(str)),
});

// Get all active properties
router.get('/', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const allProperties = await db.select().from(propertiesTable)
      .where(eq(propertiesTable.status, 'active'));
    
    res.json(allProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get property by ID
router.get('/:id', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [property] = await db.select().from(propertiesTable)
      .where(eq(propertiesTable.id, id));
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Get associated milestones
    const milestones = await db.select().from(milestonesTable)
      .where(eq(milestonesTable.propertyId, id));
    
    res.json({
      ...property,
      milestones
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property details' });
  }
});

// Create new property
router.post('/', ensureAdmin, upload.array('images'), async (req: Request, res: Response) => {
  try {
    // Parse and validate request body
    const locationData = typeof req.body.location === 'string' 
      ? JSON.parse(req.body.location) 
      : req.body.location;
      
    const propertyData = {
      title: req.body.title,
      description: req.body.description,
      location: locationData,
      fundingGoal: Number(req.body.fundingGoal),
      investmentTenor: Number(req.body.investmentTenor),
      roiPercentage: Number(req.body.roiPercentage),
    };
    
    // Validate data
    const validatedData = createPropertySchema.parse(propertyData);
    
    // In production: Upload images to cloud storage and get URLs
    const imageUrls = req.files 
      ? (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`) 
      : [];
    
    // Insert property into database
    const [newProperty] = await db.insert(propertiesTable).values({
      title: validatedData.title,
      description: validatedData.description,
      locationAddress: validatedData.location.address,
      locationCoordinates: validatedData.location.coordinates.join(','),
      images: imageUrls,
      fundingGoal: validatedData.fundingGoal,
      currentFunding: 0,
      backers: 0,
      status: 'active',
      investmentTenor: validatedData.investmentTenor,
      roiPercentage: validatedData.roiPercentage,
      documents: [],
    }).returning();
    
    res.status(201).json(newProperty);
  } catch (error) {
    console.error('Error creating property:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// Update property
router.put('/:id', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if property exists
    const [existingProperty] = await db.select().from(propertiesTable)
      .where(eq(propertiesTable.id, id));
      
    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Update property
    const [updatedProperty] = await db.update(propertiesTable)
      .set(req.body)
      .where(eq(propertiesTable.id, id))
      .returning();
    
    res.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// Archive property
router.post('/:id/archive', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if property exists
    const [existingProperty] = await db.select().from(propertiesTable)
      .where(eq(propertiesTable.id, id));
      
    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Update property status to archived
    const [archivedProperty] = await db.update(propertiesTable)
      .set({ status: 'archived' })
      .where(eq(propertiesTable.id, id))
      .returning();
    
    res.json(archivedProperty);
  } catch (error) {
    console.error('Error archiving property:', error);
    res.status(500).json({ error: 'Failed to archive property' });
  }
});

// Add document to property
router.post('/:id/documents', ensureAdmin, upload.single('document'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No document uploaded' });
    }
    
    // Check if property exists
    const [property] = await db.select().from(propertiesTable)
      .where(eq(propertiesTable.id, id));
      
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // In production: Upload document to cloud storage and get URL
    const documentUrl = `/uploads/${req.file.filename}`;
    
    // Update property documents
    const documents = [...(property.documents || []), documentUrl];
    const [updatedProperty] = await db.update(propertiesTable)
      .set({ documents })
      .where(eq(propertiesTable.id, id))
      .returning();
    
    res.json(updatedProperty);
  } catch (error) {
    console.error('Error adding document:', error);
    res.status(500).json({ error: 'Failed to add document to property' });
  }
});

// Add milestone to property
router.post('/:id/milestones', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if property exists
    const [property] = await db.select().from(propertiesTable)
      .where(eq(propertiesTable.id, id));
      
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Validate milestone data
    const validatedData = createMilestoneSchema.parse(req.body);
    
    // Insert milestone
    const [newMilestone] = await db.insert(milestonesTable).values({
      propertyId: id,
      title: validatedData.title,
      description: validatedData.description,
      completionDate: validatedData.completionDate,
      status: 'planned',
      progress: 0,
    }).returning();
    
    res.status(201).json(newMilestone);
  } catch (error) {
    console.error('Error adding milestone:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to add milestone' });
  }
});

// Update milestone
router.patch('/:id/milestones/:milestoneId', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { id, milestoneId } = req.params;
    
    // Check if property exists
    const [property] = await db.select().from(propertiesTable)
      .where(eq(propertiesTable.id, id));
      
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Check if milestone exists
    const [milestone] = await db.select().from(milestonesTable)
      .where(eq(milestonesTable.id, milestoneId))
      .where(eq(milestonesTable.propertyId, id));
      
    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }
    
    // Update milestone
    const [updatedMilestone] = await db.update(milestonesTable)
      .set(req.body)
      .where(eq(milestonesTable.id, milestoneId))
      .returning();
    
    res.json(updatedMilestone);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

export default router;