const express = require('express');
const { db } = require('../db');
const { 
  properties, 
  investments, 
  paymentTransactions,
  users,
  kycDocuments
} = require('../../shared/schema');
const { eq, desc, and, sql } = require('drizzle-orm');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/investor/dashboard
 * @desc Get investor dashboard data
 * @access Private
 */
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's investments with property details
    const userInvestments = await db.query.investments.findMany({
      where: eq(investments.userId, userId),
      with: {
        property: true
      },
      orderBy: desc(investments.date)
    });
    
    // Calculate investment stats
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const currentPortfolioValue = userInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalEarnings = userInvestments.reduce((sum, inv) => sum + inv.earnings, 0);
    const portfolioGrowth = totalInvested > 0 
      ? ((currentPortfolioValue - totalInvested) / totalInvested) * 100 
      : 0;
    
    // Count active, pending and completed investments
    const activeInvestments = userInvestments.filter(inv => inv.status === 'active').length;
    const pendingInvestments = userInvestments.filter(inv => inv.status === 'pending').length;
    const completedInvestments = userInvestments.filter(inv => inv.status === 'completed').length;
    
    // Get KYC status
    const userKyc = await db.query.kycDocuments.findFirst({
      where: eq(kycDocuments.userId, userId)
    });
    
    // Get recent payment transactions
    const recentTransactions = await db.query.paymentTransactions.findMany({
      where: eq(paymentTransactions.userId, userId),
      orderBy: desc(paymentTransactions.date),
      limit: 5
    });
    
    // Recommended properties based on user's previous investments
    const investedPropertyTypes = new Set(
      userInvestments.map(inv => inv.property.type)
    );
    
    let recommendedProperties = [];
    if (investedPropertyTypes.size > 0) {
      // Find properties of similar types that user hasn't invested in yet
      const investedPropertyIds = userInvestments.map(inv => inv.propertyId);
      
      recommendedProperties = await db.query.properties.findMany({
        where: and(
          sql`${properties.type} IN (${Array.from(investedPropertyTypes)})`,
          sql`${properties.id} NOT IN (${investedPropertyIds.length > 0 ? investedPropertyIds : [0]})`
        ),
        limit: 3
      });
    } else {
      // If no previous investments, recommend popular properties
      recommendedProperties = await db.query.properties.findMany({
        orderBy: desc(properties.numberOfInvestors),
        limit: 3
      });
    }
    
    res.json({
      portfolioStats: {
        totalInvested,
        currentPortfolioValue,
        totalEarnings,
        portfolioGrowth,
        activeInvestments,
        pendingInvestments,
        completedInvestments
      },
      kycStatus: userKyc?.status || 'not_started',
      recentTransactions,
      recommendedProperties,
      recentInvestments: userInvestments.slice(0, 5)
    });
  } catch (error) {
    console.error('Investor dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/investor/investments
 * @desc Get all investments for the logged-in investor
 * @access Private
 */
router.get('/investments', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userInvestments = await db.query.investments.findMany({
      where: eq(investments.userId, userId),
      with: {
        property: true
      },
      orderBy: desc(investments.date)
    });
    
    res.json(userInvestments);
  } catch (error) {
    console.error('Investor investments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/investor/investments/:id
 * @desc Get details of a specific investment
 * @access Private
 */
router.get('/investments/:id', verifyToken, async (req, res) => {
  try {
    const investmentId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const investment = await db.query.investments.findFirst({
      where: and(
        eq(investments.id, investmentId),
        eq(investments.userId, userId)
      ),
      with: {
        property: true
      }
    });
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    // Get related payment transactions
    const transactions = await db.query.paymentTransactions.findMany({
      where: eq(paymentTransactions.investmentId, investmentId),
      orderBy: desc(paymentTransactions.date)
    });
    
    res.json({
      ...investment,
      transactions
    });
  } catch (error) {
    console.error('Investment details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/investor/investments
 * @desc Create a new investment
 * @access Private
 */
router.post('/investments', verifyToken, async (req, res) => {
  try {
    const { propertyId, amount } = req.body;
    const userId = req.user.id;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid investment amount' });
    }
    
    // Check if property exists and is available for investment
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    if (property.accreditedOnly) {
      // Check if user is accredited
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
          accreditationLevel: true
        }
      });
      
      if (!user || user.accreditationLevel === 'non_accredited') {
        return res.status(403).json({ 
          message: 'This property is only available to accredited investors' 
        });
      }
    }
    
    // Check if minimum investment amount is met
    if (amount < property.minimumInvestment) {
      return res.status(400).json({ 
        message: `Minimum investment amount is ₦${property.minimumInvestment}` 
      });
    }
    
    // Create investment
    const [newInvestment] = await db.insert(investments)
      .values({
        userId,
        propertyId,
        amount,
        date: new Date(),
        status: 'pending',
        currentValue: amount,
        earnings: 0
      })
      .returning();
    
    res.status(201).json(newInvestment);
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/investor/roi
 * @desc Get ROI data for all investments
 * @access Private
 */
router.get('/roi', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all user investments
    const userInvestments = await db.query.investments.findMany({
      where: eq(investments.userId, userId),
      with: {
        property: true
      }
    });
    
    // Get monthly ROI data
    // Normally this would come from a roiPayments table
    // For now we'll generate synthetic data based on the investment amount and property targetReturn
    const roiData = userInvestments.flatMap(investment => {
      const monthlyROI = [];
      const investmentDate = new Date(investment.date);
      const startMonth = investmentDate.getMonth();
      const startYear = investmentDate.getFullYear();
      
      const annualReturn = parseFloat(investment.property.targetReturn);
      const monthlyReturnRate = annualReturn / 12 / 100;
      
      // Generate up to 24 months of ROI data
      for (let i = 0; i < 24; i++) {
        let month = (startMonth + i) % 12;
        let year = startYear + Math.floor((startMonth + i) / 12);
        
        // Don't generate future payments
        const paymentDate = new Date(year, month, 15);
        if (paymentDate > new Date()) {
          break;
        }
        
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        
        // Calculate payment amount based on the investment and monthly return rate
        const amount = Math.round(investment.amount * monthlyReturnRate);
        
        monthlyROI.push({
          id: `${investment.id}-${year}-${month}`,
          investmentId: investment.id,
          propertyId: investment.propertyId,
          month: monthNames[month],
          year,
          amount,
          percentage: monthlyReturnRate * 100,
          paymentDate: paymentDate.toISOString(),
          // Set payment status based on date (past dates are paid, recent ones processing)
          paymentStatus: paymentDate < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
            ? 'paid' 
            : 'processing',
          paymentMethod: paymentDate < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
            ? 'Bank Transfer' 
            : undefined
        });
      }
      
      return monthlyROI;
    });
    
    res.json(roiData);
  } catch (error) {
    console.error('ROI data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;