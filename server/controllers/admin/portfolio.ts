import { Request, Response } from 'express';
import { db } from '../../db';
import { eq, and, gte, lte, like, or, sql } from 'drizzle-orm';
import { investments, properties, users } from '@shared/schema';
import { createAdminLog } from '../../services/adminLogger';

/**
 * Get all investments with filtering for portfolio management
 */
export const getPortfolioInvestments = async (req: Request, res: Response) => {
  try {
    const { status, propertyId, startDate, endDate, search } = req.query;
    
    // Build query filters
    let filters = [];
    
    if (status) {
      filters.push(eq(investments.status, status as string));
    }
    
    if (propertyId) {
      filters.push(eq(investments.propertyId, Number(propertyId)));
    }
    
    if (startDate) {
      filters.push(gte(investments.investedAt, new Date(startDate as string)));
    }
    
    if (endDate) {
      filters.push(lte(investments.investedAt, new Date(endDate as string)));
    }
    
    // Search across user emails/usernames and property titles
    if (search) {
      // This will be a more complex query with joins
      // We'll fetch the data and filter in application code
    }
    
    // Fetch investments with related data
    const portfolioInvestments = await db.query.investments.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            username: true,
            name: true
          }
        },
        property: {
          columns: {
            id: true,
            title: true,
            location: true,
            fundingGoal: true
          }
        }
      },
      orderBy: [sql`${investments.investedAt} desc`]
    });
    
    // If search parameter is present, filter results client-side to handle relationships
    const filteredResults = search 
      ? portfolioInvestments.filter(investment => {
          const searchTerm = (search as string).toLowerCase();
          const userMatch = 
            (investment.user?.email?.toLowerCase().includes(searchTerm)) ||
            (investment.user?.username?.toLowerCase().includes(searchTerm)) ||
            (investment.user?.name?.toLowerCase().includes(searchTerm));
          
          const propertyMatch = 
            (investment.property?.title?.toLowerCase().includes(searchTerm)) ||
            (investment.property?.location?.toLowerCase().includes(searchTerm));
            
          return userMatch || propertyMatch;
        })
      : portfolioInvestments;
      
    // Log admin action
    await createAdminLog({
      adminId: req.user?.id,
      action: 'VIEW_PORTFOLIO',
      description: 'Viewed portfolio investments',
      ipAddress: req.ip,
      metadata: { filters: req.query }
    });
    
    res.status(200).json(filteredResults);
  } catch (error) {
    console.error('Error fetching portfolio investments:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio investments' });
  }
};

/**
 * Get portfolio performance metrics for visualization
 */
export const getPortfolioPerformance = async (req: Request, res: Response) => {
  try {
    // Get all properties with their investments
    const propertiesWithInvestments = await db.query.properties.findMany({
      with: {
        investments: true
      }
    });
    
    // Calculate average projected and actual ROI per property
    const performanceData = propertiesWithInvestments.map(property => {
      // Skip properties with no investments
      if (!property.investments || property.investments.length === 0) {
        return {
          id: property.id,
          title: property.title,
          projectedROI: property.targetROI || 0,
          actualROI: 0,
          investmentCount: 0
        };
      }
      
      const completedInvestments = property.investments.filter(
        inv => inv.status === 'completed' || inv.status === 'matured'
      );
      
      const avgProjectedROI = property.targetROI || 
        (property.investments.reduce((sum, inv) => sum + (inv.projectedROI || 0), 0) / 
        property.investments.length);
      
      const avgActualROI = completedInvestments.length > 0
        ? completedInvestments.reduce((sum, inv) => sum + (inv.actualROI || 0), 0) / 
          completedInvestments.length
        : 0;
        
      return {
        id: property.id,
        title: property.title,
        projectedROI: Number(avgProjectedROI.toFixed(2)),
        actualROI: Number(avgActualROI.toFixed(2)),
        investmentCount: property.investments.length
      };
    }).filter(item => item.investmentCount > 0);  // Only include properties with investments
    
    res.status(200).json(performanceData);
  } catch (error) {
    console.error('Error fetching portfolio performance:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio performance metrics' });
  }
};

/**
 * Get a specific investment by ID with detailed information
 */
export const getInvestmentDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const investment = await db.query.investments.findFirst({
      where: eq(investments.id, Number(id)),
      with: {
        user: true,
        property: true,
        transactions: true
      }
    });
    
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    // Log admin action
    await createAdminLog({
      adminId: req.user?.id,
      action: 'VIEW_INVESTMENT_DETAILS',
      description: `Viewed details for investment #${id}`,
      ipAddress: req.ip
    });
    
    res.status(200).json(investment);
  } catch (error) {
    console.error(`Error fetching investment details for ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch investment details' });
  }
};

/**
 * Update investment status
 */
export const updateInvestmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, actualROI } = req.body;
    
    const validStatuses = ['active', 'matured', 'withdrawn', 'defaulted', 'completed', 'cancelled'];
    
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // Fetch the current investment to log the change
    const currentInvestment = await db.query.investments.findFirst({
      where: eq(investments.id, Number(id))
    });
    
    if (!currentInvestment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    // Update the investment
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (actualROI !== undefined) {
      if (isNaN(Number(actualROI))) {
        return res.status(400).json({ error: 'Actual ROI must be a number' });
      }
      updateData.actualROI = Number(actualROI);
    }
    
    // If status is changed to withdrawn, set withdrawnAt
    if (status === 'withdrawn') {
      updateData.withdrawnAt = new Date();
    }
    
    // If status is changed to completed, set actualROI if not provided
    if (status === 'completed' && actualROI === undefined && currentInvestment.projectedROI) {
      updateData.actualROI = currentInvestment.projectedROI;
    }
    
    const updatedInvestment = await db
      .update(investments)
      .set(updateData)
      .where(eq(investments.id, Number(id)))
      .returning();
    
    // Log admin action
    await createAdminLog({
      adminId: req.user?.id,
      action: 'UPDATE_INVESTMENT_STATUS',
      description: `Updated investment #${id} status from ${currentInvestment.status} to ${status}`,
      ipAddress: req.ip,
      metadata: { 
        previousStatus: currentInvestment.status,
        newStatus: status,
        investmentId: id
      }
    });
    
    res.status(200).json(updatedInvestment[0]);
  } catch (error) {
    console.error(`Error updating investment status for ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update investment status' });
  }
};

/**
 * Get portfolio summary statistics
 */
export const getPortfolioSummary = async (req: Request, res: Response) => {
  try {
    // Count active investments
    const activeInvestmentsCount = await db
      .select({ count: sql`count(*)` })
      .from(investments)
      .where(eq(investments.status, 'active'));
    
    // Sum of all active investments
    const activeInvestmentsTotal = await db
      .select({ sum: sql`sum(amount)` })
      .from(investments)
      .where(eq(investments.status, 'active'));
    
    // Count completed investments
    const completedInvestmentsCount = await db
      .select({ count: sql`count(*)` })
      .from(investments)
      .where(eq(investments.status, 'completed'));
    
    // Average actual ROI for completed investments
    const averageActualROI = await db
      .select({ avg: sql`avg(actual_roi)` })
      .from(investments)
      .where(and(
        eq(investments.status, 'completed'),
        sql`actual_roi is not null`
      ));
    
    const summary = {
      activeInvestments: Number(activeInvestmentsCount[0]?.count || 0),
      activeInvestmentsTotal: Number(activeInvestmentsTotal[0]?.sum || 0),
      completedInvestments: Number(completedInvestmentsCount[0]?.count || 0),
      averageActualROI: Number(averageActualROI[0]?.avg || 0),
    };
    
    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio summary' });
  }
};