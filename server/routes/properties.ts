import express from 'express';
import { z } from 'zod';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth';
import { storage } from '../storage';

const router = express.Router();

// Validation schemas
const createPropertySchema = z.object({
  title: z.string().min(1, 'Property title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  price: z.number().positive('Price must be positive'),
  expectedReturn: z.number().min(0).max(100, 'Expected return must be between 0 and 100'),
  minimumInvestment: z.number().positive('Minimum investment must be positive'),
  images: z.array(z.string().url()).optional().default([]),
  propertyType: z.enum(['residential', 'commercial', 'industrial']).optional().default('residential'),
  fundingGoal: z.number().positive('Funding goal must be positive'),
});

// GET /api/properties - Get all properties
router.get('/', async (req, res) => {
  try {
    const { status, location, minPrice, maxPrice, limit = 20, offset = 0 } = req.query;
    
    const filters = {
      status: status as string,
      location: location as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    };

    const properties = await storage.getProperties(filters, Number(limit), Number(offset));
    
    res.json({
      properties,
      total: properties.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/properties/:id - Get single property
router.get('/:id', async (req, res) => {
  try {
    const property = await storage.getProperty(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/properties - Create new property (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const propertyData = createPropertySchema.parse(req.body);
    
    const newProperty = await storage.createProperty({
      ...propertyData,
      createdBy: req.user!.id,
      status: 'available' as const,
      fundingProgress: 0,
      investorCount: 0,
    });

    res.status(201).json(newProperty);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/properties/:id - Update property (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const updateSchema = createPropertySchema.partial();
    const updateData = updateSchema.parse(req.body);
    
    const updatedProperty = await storage.updateProperty(req.params.id, updateData);
    
    if (!updatedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(updatedProperty);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/properties/:id/invest - Invest in property
router.post('/:id/invest', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const investSchema = z.object({
      amount: z.number().positive('Investment amount must be positive'),
    });

    const { amount } = investSchema.parse(req.body);
    
    // Get property details
    const property = await storage.getProperty(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if property is available for investment
    if (property.status !== 'available') {
      return res.status(400).json({ message: 'Property is not available for investment' });
    }

    // Check minimum investment
    if (amount < property.minimumInvestment) {
      return res.status(400).json({ 
        message: `Minimum investment is ₦${property.minimumInvestment.toLocaleString()}` 
      });
    }

    // Create investment record
    const investment = await storage.createInvestment({
      propertyId: req.params.id,
      investorId: req.user!.id,
      amount,
      status: 'pending' as const,
    });

    res.status(201).json({
      message: 'Investment created successfully',
      investment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    console.error('Investment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/properties/:id/investments - Get property investments (Admin only)
router.get('/:id/investments', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const investments = await storage.getPropertyInvestments(req.params.id);
    res.json(investments);
  } catch (error) {
    console.error('Get property investments error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;