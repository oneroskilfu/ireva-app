import { Router, Request, Response } from 'express';
import { db } from '../db';
import { investments, properties, wallets, transactions } from '../../shared/schema';
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
    const { projectId, unitsInvested } = req.body;
    
    if (!projectId || !unitsInvested || unitsInvested <= 0) {
      return res.status(400).json({ message: "Invalid investment data" });
    }
    
    // Get property details
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, projectId));
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Check if property is available for investment
    if (!property.minimumInvestment || property.minimumInvestment > unitsInvested) {
      return res.status(400).json({ message: "Minimum investment amount not met" });
    }
    
    // Calculate total investment amount
    const amount = unitsInvested;
    
    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid investment amount" });
    }
    
    // Get user wallet
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId.toString()));
    
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    
    // Check if sufficient balance
    if (Number(wallet.balance || 0) < amount) {
      return res.status(400).json({ 
        message: "Insufficient funds", 
        balance: wallet.balance,
        required: amount
      });
    }
    
    // Generate reference
    const reference = `INV-${Date.now()}-${userId}-${projectId}`;
    
    // Process investment in a transaction
    let investment;
    await db.transaction(async (tx) => {
      // Record wallet transaction
      await tx.insert(transactions)
        .values({
          walletId: wallet.id,
          type: "debit",
          amount: amount.toString(),
          reference,
          description: `Investment in ${property.name}`,
          status: "completed",
          metadata: JSON.stringify({
            propertyId: property.id,
            propertyName: property.name
          })
        });
      
      // Update wallet balance
      await tx.update(wallets)
        .set({ 
          balance: String(Number(wallet.balance) - amount)
        })
        .where(eq(wallets.id, wallet.id));
      
      // Create investment
      const [newInvestment] = await tx.insert(investments)
        .values({
          userId: userId.toString(),
          projectId: projectId.toString(),
          unitsInvested,
          totalAmount: amount.toString(),
          status: "active",
          roiEarned: "0"
        })
        .returning();
      
      investment = newInvestment;
      
      // Update property information
      await tx.update(properties)
        .set({ 
          currentFunding: (property.currentFunding || 0) + unitsInvested,
          numberOfInvestors: (property.numberOfInvestors || 0) + 1
        })
        .where(eq(properties.id, property.id));
    });
    
    // Get updated property
    const [updatedProperty] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, projectId));
    
    // Get updated wallet
    const [updatedWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId.toString()));
    
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
          description: properties.description,
          targetReturn: properties.targetReturn,
          term: properties.term,
          totalFunding: properties.totalFunding,
          currentFunding: properties.currentFunding,
          type: properties.type
        }
      })
      .from(investments)
      .leftJoin(properties, eq(investments.projectId, properties.id.toString()))
      .where(eq(investments.userId, userId.toString()));
    
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
    
    const investmentId = req.params.id;
    
    // Get specific investment with property details
    const [investmentData] = await db
      .select({
        investment: investments,
        property: {
          id: properties.id,
          name: properties.name,
          location: properties.location,
          description: properties.description,
          targetReturn: properties.targetReturn,
          term: properties.term,
          totalFunding: properties.totalFunding,
          currentFunding: properties.currentFunding,
          type: properties.type
        }
      })
      .from(investments)
      .leftJoin(properties, eq(investments.projectId, properties.id.toString()))
      .where(
        and(
          eq(investments.id, investmentId),
          eq(investments.userId, userId.toString())
        )
      );
    
    if (!investmentData) {
      return res.status(404).json({ message: "Investment not found" });
    }
    
    // Format the investment for response
    const formattedInvestment = {
      ...investmentData.investment,
      property: investmentData.property
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