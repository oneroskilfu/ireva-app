import express from 'express';
import { db } from '../../db';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import { 
  properties,
  payoutSchedules,
  roiDistributions,
  investorPayouts,
  investments,
  transactions
} from '@shared/schema';

const router = express.Router();

/**
 * Get ROI performance for a property
 * Returns total distributed amount, pending amount, and next payout date
 */
router.get('/:propertyId/performance', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const result = await db
      .select({
        totalDistributed: sql<string>`sum(${roiDistributions.totalAmount})::text`,
        pendingAmount: sql<string>`sum(case when ${roiDistributions.status} = 'pending' then ${roiDistributions.totalAmount} else 0 end)::text`,
        nextPayoutDate: sql<Date>`min(${roiDistributions.payoutDate})`,
      })
      .from(roiDistributions)
      .where(eq(roiDistributions.propertyId, propertyId));

    if (!result[0] || !result[0].totalDistributed) {
      return res.json({
        totalDistributed: "0",
        pendingAmount: "0",
        nextPayoutDate: null
      });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching ROI performance:', error);
    res.status(500).json({ error: 'Failed to fetch ROI performance' });
  }
});

/**
 * Create payout schedule for a property
 * Schedule defines when and how ROI will be distributed
 */
router.post('/:propertyId/schedules', async (req, res) => {
  try {
    const newSchedule = await db
      .insert(payoutSchedules)
      .values({
        propertyId: req.params.propertyId,
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      })
      .returning();

    res.status(201).json(newSchedule[0]);
  } catch (error) {
    console.error('Error creating payout schedule:', error);
    res.status(500).json({ error: 'Failed to create payout schedule' });
  }
});

/**
 * Get all payout schedules for a property
 */
router.get('/:propertyId/schedules', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const schedules = await db
      .select()
      .from(payoutSchedules)
      .where(eq(payoutSchedules.propertyId, propertyId));

    res.json(schedules);
  } catch (error) {
    console.error('Error fetching payout schedules:', error);
    res.status(500).json({ error: 'Failed to fetch payout schedules' });
  }
});

/**
 * Trigger ROI distribution for a property
 * Creates a distribution record and calculates individual investor payouts
 */
router.post('/:propertyId/distributions', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { amount, percentage } = req.body;
    
    // Validate inputs
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    // 1. Create distribution record
    const distribution = await db
      .insert(roiDistributions)
      .values({
        propertyId,
        payoutDate: new Date(),
        totalAmount: amount.toString(),
        initiatedBy: req.user.id,
      })
      .returning();

    // 2. Get all investors for this property
    const propertyInvestments = await db
      .select()
      .from(investments)
      .where(eq(investments.projectId, propertyId));

    if (propertyInvestments.length === 0) {
      return res.status(400).json({ 
        error: 'No investments found for this property',
        distributionId: distribution[0].id
      });
    }

    // 3. Calculate and create individual investor payouts
    const totalInvestment = propertyInvestments.reduce(
      (sum, inv) => sum + parseFloat(inv.totalAmount), 
      0
    );
    
    for (const investment of propertyInvestments) {
      // Calculate investor's share based on their investment proportion
      const investmentRatio = parseFloat(investment.totalAmount) / totalInvestment;
      const payoutAmount = (parseFloat(amount) * investmentRatio * (percentage / 100)).toFixed(2);
      
      await db.insert(investorPayouts).values({
        distributionId: distribution[0].id,
        investorId: investment.userId,
        amount: payoutAmount,
      });
    }
    
    res.status(201).json({
      ...distribution[0],
      investorCount: propertyInvestments.length
    });
  } catch (error) {
    console.error('Error triggering distribution:', error);
    res.status(500).json({ error: 'Failed to trigger distribution' });
  }
});

/**
 * Process pending investor payouts
 * Updates status and creates wallet transactions
 */
router.post('/distributions/:distributionId/process', async (req, res) => {
  try {
    const { distributionId } = req.params;
    
    // Get all pending payouts for this distribution
    const pendingPayouts = await db
      .select()
      .from(investorPayouts)
      .where(and(
        eq(investorPayouts.distributionId, distributionId),
        eq(investorPayouts.status, 'pending')
      ));
    
    const results = {
      processed: 0,
      failed: 0
    };
    
    // Process each payout (in a real system, this might be batched)
    for (const payout of pendingPayouts) {
      try {
        // 1. Create transaction record
        const transaction = await db
          .insert(transactions)
          .values({
            userId: payout.investorId,
            amount: payout.amount,
            type: 'roi_credit',
            description: `ROI payout for distribution #${distributionId}`,
            reference: 'ROI_DISTRIBUTION',
            referenceId: distributionId,
          })
          .returning();
        
        // 2. Update payout with transaction ID and status
        await db
          .update(investorPayouts)
          .set({
            status: 'paid',
            paidAt: new Date(),
            transactionId: transaction[0].id
          })
          .where(eq(investorPayouts.id, payout.id));
        
        results.processed++;
      } catch (err) {
        results.failed++;
      }
    }
    
    res.json({
      message: `Processed ${results.processed} payouts with ${results.failed} failures`,
      ...results
    });
  } catch (error) {
    console.error('Error processing payouts:', error);
    res.status(500).json({ error: 'Failed to process payouts' });
  }
});

/**
 * Generate ROI report for a property within a date range
 */
router.get('/:propertyId/report', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const report = await db
      .select({
        date: roiDistributions.payoutDate,
        totalAmount: roiDistributions.totalAmount,
        status: roiDistributions.status,
        paidInvestors: sql<number>`count(${investorPayouts.id}) filter (where ${investorPayouts.status} = 'paid')`,
        pendingAmount: sql<string>`sum(${investorPayouts.amount}) filter (where ${investorPayouts.status} = 'pending')`,
      })
      .from(roiDistributions)
      .leftJoin(investorPayouts, eq(roiDistributions.id, investorPayouts.distributionId))
      .where(and(
        eq(roiDistributions.propertyId, propertyId),
        gte(roiDistributions.payoutDate, new Date(startDate as string)),
        lte(roiDistributions.payoutDate, new Date(endDate as string))
      ))
      .groupBy(roiDistributions.id);

    // For API response without CSV conversion
    res.json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;