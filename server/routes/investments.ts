import { Router, Request, Response } from 'express';
import { db } from '../db';
import { investments, projects, wallets, transactions } from '../../shared/schema';
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
    
    // Get project details
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Check if project is available for investment
    if (!project.availableUnits || project.availableUnits < unitsInvested) {
      return res.status(400).json({ message: "Not enough available units" });
    }
    
    // Calculate total investment amount
    const amount = Number(project.pricePerUnit || 0) * unitsInvested;
    
    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid investment amount" });
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
          amount: amount.toString(),
          type: "investment",
          status: "completed",
          reference
        });
      
      // Update wallet balance
      await tx.update(wallets)
        .set({ 
          balance: (Number(wallet.balance) - amount).toString(),
          lastUpdated: new Date()
        })
        .where(eq(wallets.id, wallet.id));
      
      // Create investment
      const [newInvestment] = await tx.insert(investments)
        .values({
          userId,
          projectId,
          unitsInvested,
          totalAmount: amount.toString(),
          status: "active",
          roiEarned: "0"
        })
        .returning();
      
      investment = newInvestment;
      
      // Update project available units
      await tx.update(projects)
        .set({ 
          availableUnits: project.availableUnits - unitsInvested
        })
        .where(eq(projects.id, project.id));
    });
    
    // Get updated project
    const [updatedProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));
    
    // Get updated wallet
    const [updatedWallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    res.status(201).json({ 
      message: "Investment successful",
      investment,
      project: updatedProject,
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
    
    // Get user investments with project details
    const userInvestments = await db
      .select({
        investment: investments,
        project: {
          id: projects.id,
          title: projects.title,
          location: projects.location,
          pricePerUnit: projects.pricePerUnit,
          roiPercent: projects.roiPercent,
          tenorMonths: projects.tenorMonths,
          totalUnits: projects.totalUnits,
          availableUnits: projects.availableUnits,
          status: projects.status
        }
      })
      .from(investments)
      .leftJoin(projects, eq(investments.projectId, projects.id))
      .where(eq(investments.userId, userId))
      .orderBy(investments.investedAt);
    
    // Format the investments for response
    const formattedInvestments = userInvestments.map(({ investment, project }) => ({
      ...investment,
      project
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
    
    // Get investment with project details
    const [investmentWithProject] = await db
      .select({
        investment: investments,
        project: {
          id: projects.id,
          title: projects.title,
          location: projects.location,
          pricePerUnit: projects.pricePerUnit,
          roiPercent: projects.roiPercent,
          tenorMonths: projects.tenorMonths,
          totalUnits: projects.totalUnits,
          availableUnits: projects.availableUnits,
          status: projects.status
        }
      })
      .from(investments)
      .leftJoin(projects, eq(investments.projectId, projects.id))
      .where(and(
        eq(investments.id, investmentId),
        eq(investments.userId, userId)
      ));
    
    if (!investmentWithProject) {
      return res.status(404).json({ message: "Investment not found" });
    }
    
    // Format the investment for response
    const formattedInvestment = {
      ...investmentWithProject.investment,
      project: investmentWithProject.project
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