import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertInvestmentSchema } from '@shared/schema';
import { ZodError } from 'zod';
import { requireAuth } from '../middleware/authMiddleware';

// Define extended request that includes the user from JWT payload
interface AuthenticatedRequest extends Request {
  jwtPayload?: {
    id: number;
    username: string;
    role: string;
  };
  user?: any;
}

const investmentRouter = Router();

// Apply authentication to all investment routes
investmentRouter.use(requireAuth);

// Get user investments
investmentRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get user ID from JWT payload or session
    const userId = req.jwtPayload?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const investments = await storage.getUserInvestments(userId);
    
    // Get property details for each investment
    const investmentsWithDetails = await Promise.all(
      investments.map(async (investment) => {
        const property = await storage.getProperty(investment.propertyId);
        return {
          ...investment,
          property,
        };
      })
    );
    
    res.json(investmentsWithDetails);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch investments" });
  }
});

// Create a new investment
investmentRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get user ID from JWT payload or session
    const userId = req.jwtPayload?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Validate investment data
    const validatedData = insertInvestmentSchema.parse({
      ...req.body,
      userId
    });
    
    // Check if property exists
    const property = await storage.getProperty(validatedData.propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Check if investment amount meets minimum
    if (validatedData.amount < property.minimumInvestment) {
      return res.status(400).json({ 
        message: `Minimum investment is $${property.minimumInvestment}` 
      });
    }
    
    // Create investment
    const investment = await storage.createInvestment(validatedData);
    
    // Create notification for the user
    await storage.createNotification({
      userId,
      type: "investment",
      title: "Investment Successful",
      message: `Your investment of $${validatedData.amount} in ${property.name} was successful.`,
      link: `/property/${property.id}`
    });
    
    // Get updated property
    const updatedProperty = await storage.getProperty(property.id);
    
    res.status(201).json({ 
      investment,
      property: updatedProperty
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: "Invalid investment data", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create investment" });
    }
  }
});

// Get specific investment by ID
investmentRouter.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const investmentId = parseInt(req.params.id);
    const investment = await storage.getInvestment(investmentId);
    
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }
    
    // Verify that the investment belongs to the authenticated user
    if (investment.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Get property details
    const property = await storage.getProperty(investment.propertyId);
    
    res.json({
      ...investment,
      property
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch investment" });
  }
});

// Update investment returns (for simulation purposes)
investmentRouter.patch('/:id/returns', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const investmentId = parseInt(req.params.id);
    const { earnings, monthlyReturns } = req.body;
    
    const investment = await storage.getInvestment(investmentId);
    
    if (!investment) {
      return res.status(404).json({ message: "Investment not found" });
    }
    
    // Verify that the investment belongs to the authenticated user
    if (investment.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Update the investment returns
    const updatedInvestment = await storage.updateInvestmentReturns(
      investmentId, 
      earnings, 
      monthlyReturns
    );
    
    res.json(updatedInvestment);
  } catch (error) {
    res.status(500).json({ message: "Failed to update investment returns" });
  }
});

export default investmentRouter;