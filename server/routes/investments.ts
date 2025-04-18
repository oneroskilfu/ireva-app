import { Router, Request, Response } from 'express';
import { db } from '../db';
import { investments, properties, wallets, walletTransaction } from '../../shared/schema';
import { and, eq, sql } from 'drizzle-orm';
import { verifyToken } from '../auth-jwt';
import { insertInvestmentSchema } from '../../shared/schema';
import { ZodError } from 'zod';

const investmentsRouter = Router();

/**
 * @route POST /api/investments
 * @desc Create a new investment using wallet funds
 * @access Private
 */
investmentsRouter.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Validate investment data
    const { propertyId, amount } = req.body;
    
    if (!propertyId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid investment data" });
    }
    
    // Get property details
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Check if property is available for investment
    if (property.currentFunding >= property.totalFunding) {
      return res.status(400).json({ message: "Property is fully funded" });
    }
    
    // Check minimum investment amount
    if (amount < property.minimumInvestment) {
      return res.status(400).json({ 
        message: `Minimum investment is ₦${property.minimumInvestment.toLocaleString()}`,
        minimumInvestment: property.minimumInvestment 
      });
    }
    
    // Get user wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    // Check if sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({ 
        message: "Insufficient funds", 
        balance: wallet.balance,
        required: amount
      });
    }
    
    // Generate reference
    const reference = `INV-${Date.now()}-${userId}-${propertyId}`;
    
    // Process investment in a transaction
    let investment;
    await db.transaction(async (tx) => {
      // Record wallet transaction
      await tx.insert(walletTransaction)
        .values({
          userId,
          amount,
          type: "investment",
          status: "completed",
          description: `Investment in ${property.name}`,
          reference,
          metadata: { propertyId }
        });
      
      // Update wallet balance
      await tx.update(wallets)
        .set({ 
          balance: wallet.balance - amount,
          lastUpdated: new Date()
        })
        .where(eq(wallets.id, wallet.id));
      
      // Create investment
      const [newInvestment] = await tx.insert(investments)
        .values({
          userId,
          propertyId,
          amount,
          date: new Date(),
          status: "active",
          currentValue: amount,
          transactionId: reference,
          maturityDate: new Date(Date.now() + (property.term * 30 * 24 * 60 * 60 * 1000)) // Approximate months to milliseconds
        })
        .returning();
      
      investment = newInvestment;
      
      // Update property funding
      await tx.update(properties)
        .set({ 
          currentFunding: property.currentFunding + amount,
          numberOfInvestors: property.numberOfInvestors + 1
        })
        .where(eq(properties.id, property.id));
    });
    
    // Get updated property
    const [updatedProperty] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    // Get updated wallet
    const [updatedWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    res.status(201).json({ 
      message: "Investment successful",
      investment,
      property: updatedProperty,
      wallet: updatedWallet
    });
  } catch (error) {
    console.error("Error creating investment:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Invalid investment data", 
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
 * @route GET /api/investments
 * @desc Get user's investments
 * @access Private
 */
investmentsRouter.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get user investments with property details
    const userInvestments = await db
      .select({
        investment: investments,
        property: {
          id: properties.id,
          name: properties.name,
          location: properties.location,
          type: properties.type,
          imageUrl: properties.imageUrl,
          targetReturn: properties.targetReturn,
          term: properties.term,
          currentFunding: properties.currentFunding,
          totalFunding: properties.totalFunding
        }
      })
      .from(investments)
      .leftJoin(properties, eq(investments.propertyId, properties.id))
      .where(eq(investments.userId, userId))
      .orderBy(sql`${investments.date} DESC`);
    
    // Format the investments for response
    const formattedInvestments = userInvestments.map(({ investment, property }) => ({
      ...investment,
      property
    }));
    
    res.json(formattedInvestments);
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
 * @desc Get a specific investment
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
    
    // Get investment with property details
    const [investmentWithProperty] = await db
      .select({
        investment: investments,
        property: properties
      })
      .from(investments)
      .leftJoin(properties, eq(investments.propertyId, properties.id))
      .where(and(
        eq(investments.id, investmentId),
        eq(investments.userId, userId)
      ));
    
    if (!investmentWithProperty) {
      return res.status(404).json({ message: "Investment not found" });
    }
    
    // Format the investment for response
    const formattedInvestment = {
      ...investmentWithProperty.investment,
      property: investmentWithProperty.property
    };
    
    res.json(formattedInvestment);
  } catch (error) {
    console.error("Error fetching investment:", error);
    res.status(500).json({ 
      message: "Failed to fetch investment", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default investmentsRouter;