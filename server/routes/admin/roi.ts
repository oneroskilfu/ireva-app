import express, { Request, Response } from 'express';
import { db } from '../../db';
import { roiDistributions, payoutSchedules, investorPayouts } from '../../../shared/schema';
import { authMiddleware, ensureAdmin } from '../../auth-jwt';
import { sql, eq, and, between, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const router = express.Router();

// Middleware to ensure admin access
router.use(authMiddleware, ensureAdmin);

/**
 * Get ROI performance summary for a property
 */
router.get('/:propertyId/performance', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    
    // Get total distributed amount
    const totalDistributedResult = await db.select({
      total: sql`SUM(${roiDistributions.totalAmount}::numeric)`.mapWith(Number)
    }).from(roiDistributions)
      .where(
        and(
          eq(roiDistributions.propertyId, propertyId),
          eq(roiDistributions.status, 'paid')
        )
      );
    
    // Get pending amount
    const pendingAmountResult = await db.select({
      total: sql`SUM(${roiDistributions.totalAmount}::numeric)`.mapWith(Number)
    }).from(roiDistributions)
      .where(
        and(
          eq(roiDistributions.propertyId, propertyId),
          eq(roiDistributions.status, 'pending')
        )
      );
    
    // Get next scheduled payout date
    const nextPayoutDateResult = await db.select({
      nextDate: payoutSchedules.startDate
    }).from(payoutSchedules)
      .where(
        and(
          eq(payoutSchedules.propertyId, propertyId),
          sql`${payoutSchedules.startDate} > NOW()`
        )
      )
      .orderBy(payoutSchedules.startDate)
      .limit(1);
    
    const totalDistributed = totalDistributedResult[0]?.total || 0;
    const pendingAmount = pendingAmountResult[0]?.total || 0;
    const nextPayoutDate = nextPayoutDateResult[0]?.nextDate || null;
    
    res.json({
      totalDistributed: totalDistributed.toFixed(2),
      pendingAmount: pendingAmount.toFixed(2),
      nextPayoutDate
    });
  } catch (error) {
    console.error('Error fetching ROI performance:', error);
    res.status(500).json({ message: 'Failed to fetch ROI performance' });
  }
});

/**
 * Get payout schedules for a property
 */
router.get('/:propertyId/schedules', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    
    const schedules = await db.select()
      .from(payoutSchedules)
      .where(eq(payoutSchedules.propertyId, propertyId))
      .orderBy(payoutSchedules.createdAt);
    
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching payout schedules:', error);
    res.status(500).json({ message: 'Failed to fetch payout schedules' });
  }
});

/**
 * Create a new payout schedule
 */
router.post('/:propertyId/schedules', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { frequency, startDate, endDate, amountType, amountValue } = req.body;
    
    if (!frequency || !startDate || !amountType || !amountValue) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newSchedule = await db.insert(payoutSchedules)
      .values({
        id: uuidv4(),
        propertyId,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        amountType,
        amountValue,
        createdAt: new Date()
      })
      .returning();
    
    res.status(201).json(newSchedule[0]);
  } catch (error) {
    console.error('Error creating payout schedule:', error);
    res.status(500).json({ message: 'Failed to create payout schedule' });
  }
});

/**
 * Update a payout schedule
 */
router.put('/:propertyId/schedules/:scheduleId', async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    const { frequency, startDate, endDate, amountType, amountValue } = req.body;
    
    if (!frequency || !startDate || !amountType || !amountValue) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const updatedSchedule = await db.update(payoutSchedules)
      .set({
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        amountType,
        amountValue
      })
      .where(eq(payoutSchedules.id, scheduleId))
      .returning();
    
    if (!updatedSchedule.length) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    res.json(updatedSchedule[0]);
  } catch (error) {
    console.error('Error updating payout schedule:', error);
    res.status(500).json({ message: 'Failed to update payout schedule' });
  }
});

/**
 * Delete a payout schedule
 */
router.delete('/:propertyId/schedules/:scheduleId', async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    
    await db.delete(payoutSchedules)
      .where(eq(payoutSchedules.id, scheduleId));
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting payout schedule:', error);
    res.status(500).json({ message: 'Failed to delete payout schedule' });
  }
});

/**
 * Get distribution history for a property
 */
router.get('/:propertyId/distributions', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = db.select({
      ...roiDistributions,
      payoutCount: sql`(SELECT COUNT(*) FROM ${investorPayouts} WHERE ${investorPayouts.distributionId} = ${roiDistributions.id})`.mapWith(Number),
      completedPayouts: sql`(SELECT COUNT(*) FROM ${investorPayouts} WHERE ${investorPayouts.distributionId} = ${roiDistributions.id} AND ${investorPayouts.status} = 'paid')`.mapWith(Number)
    })
      .from(roiDistributions)
      .where(eq(roiDistributions.propertyId, propertyId))
      .orderBy(desc(roiDistributions.createdAt));
    
    // Add date filtering if provided
    if (startDate && endDate) {
      query = query.where(
        between(
          roiDistributions.payoutDate,
          new Date(startDate as string),
          new Date(endDate as string)
        )
      );
    }
    
    const distributions = await query;
    
    res.json(distributions);
  } catch (error) {
    console.error('Error fetching distributions:', error);
    res.status(500).json({ message: 'Failed to fetch distributions' });
  }
});

/**
 * Create a new distribution
 */
router.post('/:propertyId/distributions', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { amount, percentage } = req.body;
    
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }
    
    const distributionId = uuidv4();
    
    // Create the distribution record
    const [distribution] = await db.insert(roiDistributions)
      .values({
        id: distributionId,
        propertyId,
        payoutDate: new Date(),
        totalAmount: amount,
        status: 'pending',
        initiatedBy: req.user?.username || 'admin', // Fallback to 'admin' if username not available
        createdAt: new Date()
      })
      .returning();
    
    // Here you would also create individual investor payout records
    // based on their investment amounts, but that requires querying investments
    // and calculating individual amounts. For now, this is a placeholder:
    
    // In a real implementation, you would:
    // 1. Get all investors for this property
    // 2. Calculate each investor's share based on their investment amount
    // 3. Create investor payout records
    
    // This demo just returns the distribution
    res.status(201).json({
      ...distribution,
      message: `Distribution of $${amount} created successfully. Individual investor payouts will be calculated when processed.`
    });
  } catch (error) {
    console.error('Error creating distribution:', error);
    res.status(500).json({ message: 'Failed to create distribution' });
  }
});

/**
 * Process a distribution (make the payments)
 */
router.post('/distributions/:distributionId/process', async (req: Request, res: Response) => {
  try {
    const { distributionId } = req.params;
    
    // First, update the distribution status
    const [distribution] = await db.update(roiDistributions)
      .set({
        status: 'processing'
      })
      .where(eq(roiDistributions.id, distributionId))
      .returning();
    
    if (!distribution) {
      return res.status(404).json({ message: 'Distribution not found' });
    }
    
    // In a real implementation, you would now:
    // 1. Get all investor payouts for this distribution
    // 2. Process each payment (e.g., add to wallet balance)
    // 3. Update each payout status
    // 4. Finally update the distribution status to 'paid'
    
    // For this demo, we'll simulate this happening
    // by creating a timeout to update the status to 'paid' after a few seconds
    // This would normally be handled by a background job
    
    // Update the distribution to 'paid' after a delay
    setTimeout(async () => {
      try {
        await db.update(roiDistributions)
          .set({
            status: 'paid'
          })
          .where(eq(roiDistributions.id, distributionId));
        
        console.log(`Distribution ${distributionId} marked as paid`);
      } catch (updateError) {
        console.error('Error updating distribution status:', updateError);
      }
    }, 5000); // 5 second delay
    
    res.json({
      ...distribution,
      message: 'Distribution is being processed. Payments will be completed shortly.'
    });
  } catch (error) {
    console.error('Error processing distribution:', error);
    res.status(500).json({ message: 'Failed to process distribution' });
  }
});

/**
 * Generate a distribution report
 */
router.get('/:propertyId/report', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }
    
    // Query distributions within date range
    const distributions = await db.select()
      .from(roiDistributions)
      .where(
        and(
          eq(roiDistributions.propertyId, propertyId),
          between(
            roiDistributions.payoutDate,
            new Date(startDate as string),
            new Date(endDate as string)
          )
        )
      )
      .orderBy(desc(roiDistributions.payoutDate));
    
    // Calculate totals
    const totalDistributed = distributions.reduce((sum, dist) => {
      return sum + parseFloat(dist.totalAmount);
    }, 0);
    
    // In a real implementation, you would format this as a CSV, PDF or other report format
    // For this demo, we'll just return JSON
    res.json({
      propertyId,
      reportPeriod: {
        from: startDate,
        to: endDate
      },
      totalDistributed: totalDistributed.toFixed(2),
      distributionCount: distributions.length,
      distributions
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

export default router;