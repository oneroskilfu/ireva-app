import { Router, Request, Response } from 'express';
import { db } from '../db';
import { 
  investments, 
  properties, 
  wallets,
  insertInvestmentSchema, 
  walletTransaction, 
  notifications 
} from '../../shared/schema';
import { and, eq } from 'drizzle-orm';
import { verifyToken, authMiddleware, ensureAdmin } from '../auth-jwt';
import { ZodError } from 'zod';
import AdminLogger from '../services/adminLogger';

const investmentsRouter = Router();

/**
 * @route GET /api/investments
 * @desc Get all investments for the authenticated user
 * @access Private
 */
investmentsRouter.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user investments
    const userInvestments = await db.select()
      .from(investments)
      .where(eq(investments.userId, userId));

    // If no investments found, return empty array
    if (!userInvestments.length) {
      return res.json([]);
    }

    // Get property details for each investment
    const investmentsWithDetails = await Promise.all(
      userInvestments.map(async (investment) => {
        const [property] = await db.select()
          .from(properties)
          .where(eq(properties.id, investment.propertyId));
        
        return {
          ...investment,
          property
        };
      })
    );
    
    res.json(investmentsWithDetails);
  } catch (error) {
    console.error("Error fetching investments:", error);
    res.status(500).json({ 
      message: "Failed to fetch investments", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route GET /api/investments/:id
 * @desc Get a specific investment by ID
 * @access Private
 */
investmentsRouter.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const investmentId = parseInt(req.params.id);
    
    if (isNaN(investmentId)) {
      return res.status(400).json({ message: "Invalid investment ID" });
    }
    
    // Get investment
    const [investment] = await db.select()
      .from(investments)
      .where(and(
        eq(investments.id, investmentId),
        eq(investments.userId, userId)
      ));
    
    if (!investment) {
      return res.status(404).json({ message: "Investment not found or does not belong to you" });
    }
    
    // Get property details
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, investment.propertyId));
    
    res.json({
      ...investment,
      property
    });
  } catch (error) {
    console.error("Error fetching investment:", error);
    res.status(500).json({ 
      message: "Failed to fetch investment", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route POST /api/investments
 * @desc Create a new investment
 * @access Private
 */
investmentsRouter.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Extract request data
    const { projectId, amount, units } = req.body;
    
    if (!projectId || isNaN(parseInt(projectId))) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const propertyId = parseInt(projectId);
    
    // Validate investment amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid investment amount" });
    }
    
    // Check if property exists
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Check if investment amount meets minimum
    if (amount < property.minimumInvestment) {
      return res.status(400).json({ 
        message: `Minimum investment is ₦${property.minimumInvestment.toLocaleString()}` 
      });
    }
    
    // Check if user has enough balance in wallet
    const [wallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    if (wallet.balance < amount) {
      return res.status(400).json({ 
        message: "Insufficient funds in wallet", 
        currentBalance: wallet.balance,
        requiredAmount: amount
      });
    }
    
    // Begin transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // 1. Deduct amount from wallet
      await tx.update(wallets)
        .set({ 
          balance: wallet.balance - amount,
          lastUpdated: new Date()
        })
        .where(eq(wallets.id, wallet.id));
      
      // 2. Record wallet transaction
      await tx.insert(walletTransaction)
        .values({
          userId,
          amount,
          type: "investment",
          status: "completed",
          description: `Investment in ${property.name}`,
          reference: `INV-${Date.now()}-${userId}-${propertyId}`,
          metadata: { propertyId, units }
        });
      
      // 3. Create investment record
      const [investment] = await tx.insert(investments)
        .values({
          userId,
          propertyId,
          amount,
          currentValue: amount,
          status: "active",
          maturityDate: new Date(Date.now() + (property.term * 30 * 24 * 60 * 60 * 1000)) // Approximate months to milliseconds
        })
        .returning();
      
      // 4. Update property funding and investor count
      await tx.update(properties)
        .set({ 
          currentFunding: property.currentFunding + amount,
          numberOfInvestors: property.numberOfInvestors + 1
        })
        .where(eq(properties.id, propertyId));
      
      // 5. Create notification
      await tx.insert(notifications)
        .values({
          userId,
          type: "investment",
          title: "Investment Successful",
          message: `Your investment of ₦${amount.toLocaleString()} in ${property.name} was successful.`,
          link: `/investor/investments/${investment.id}`,
          isRead: false
        });
    });
    
    // Get updated investment with property details
    const [newInvestment] = await db.select()
      .from(investments)
      .where(and(
        eq(investments.userId, userId),
        eq(investments.propertyId, propertyId)
      ))
      .orderBy(investments.id)
      .limit(1);
    
    // Get updated property
    const [updatedProperty] = await db.select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    res.status(201).json({ 
      message: "Investment successful",
      investment: newInvestment,
      property: updatedProperty
    });
  } catch (error) {
    console.error("Error creating investment:", error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to create investment", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route GET /api/investments/property/:propertyId
 * @desc Get all investments for a specific property (Admin only)
 * @access Admin
 */
investmentsRouter.get('/property/:propertyId', verifyToken, ensureAdmin, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: "Invalid property ID" });
    }
    
    // Check if property exists
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Get all investments for this property
    const propertyInvestments = await db.select()
      .from(investments)
      .where(eq(investments.propertyId, propertyId));
    
    res.json({
      property,
      investments: propertyInvestments,
      totalInvested: propertyInvestments.reduce((sum, inv) => sum + inv.amount, 0),
      investorCount: propertyInvestments.length
    });
  } catch (error) {
    console.error("Error fetching property investments:", error);
    res.status(500).json({ 
      message: "Failed to fetch property investments", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route GET /api/investments/user/:userId
 * @desc Get all investments for a specific user (Admin only)
 * @access Admin
 */
investmentsRouter.get('/user/:userId', verifyToken, ensureAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Get all investments for this user
    const userInvestments = await db.select()
      .from(investments)
      .where(eq(investments.userId, userId));
    
    // Get property details for each investment
    const investmentsWithDetails = await Promise.all(
      userInvestments.map(async (investment) => {
        const [property] = await db.select()
          .from(properties)
          .where(eq(properties.id, investment.propertyId));
        
        return {
          ...investment,
          property
        };
      })
    );
    
    res.json({
      investments: investmentsWithDetails,
      totalInvested: userInvestments.reduce((sum, inv) => sum + inv.amount, 0),
      investmentCount: userInvestments.length
    });
  } catch (error) {
    console.error("Error fetching user investments:", error);
    res.status(500).json({ 
      message: "Failed to fetch user investments", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default investmentsRouter;