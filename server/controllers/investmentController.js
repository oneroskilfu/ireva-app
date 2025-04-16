const { db } = require('../db');
const { investments, properties, users } = require('../../shared/schema');
const { eq, and, desc, sql } = require('drizzle-orm');

/**
 * Get all investments for the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserInvestments = async (req, res) => {
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
    console.error('Error fetching user investments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a specific investment by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getInvestmentById = async (req, res) => {
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
    
    res.json(investment);
  } catch (error) {
    console.error('Error fetching investment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new investment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createInvestment = async (req, res) => {
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
    
    // Update property stats
    await db.update(properties)
      .set({
        currentFunding: sql`${properties.currentFunding} + ${amount}`,
        numberOfInvestors: sql`${properties.numberOfInvestors} + 1`
      })
      .where(eq(properties.id, propertyId));
    
    res.status(201).json(newInvestment);
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update investment status (for admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateInvestmentStatus = async (req, res) => {
  try {
    const investmentId = parseInt(req.params.id);
    const { status } = req.body;
    
    // Validate status
    if (!['active', 'pending', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Check if investment exists
    const existingInvestment = await db.query.investments.findFirst({
      where: eq(investments.id, investmentId)
    });
    
    if (!existingInvestment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    // Update status
    const statusData = {
      status,
      completedDate: status === 'completed' ? new Date() : existingInvestment.completedDate
    };
    
    const [updatedInvestment] = await db.update(investments)
      .set(statusData)
      .where(eq(investments.id, investmentId))
      .returning();
    
    res.json(updatedInvestment);
  } catch (error) {
    console.error('Error updating investment status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get ROI data for a user's investments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserROI = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all user investments
    const userInvestments = await db.query.investments.findMany({
      where: eq(investments.userId, userId),
      with: {
        property: true
      }
    });
    
    // Get monthly ROI data from monthlyReturns JSON field
    const roiData = userInvestments.flatMap(investment => {
      // If the investment has monthly returns data
      if (investment.monthlyReturns) {
        return investment.monthlyReturns.map((monthlyReturn, index) => {
          const date = new Date(investment.date);
          date.setMonth(date.getMonth() + index);
          
          return {
            id: `${investment.id}-${index}`,
            investmentId: investment.id,
            propertyId: investment.propertyId,
            month: date.toLocaleString('default', { month: 'long' }),
            year: date.getFullYear(),
            amount: monthlyReturn.amount,
            percentage: monthlyReturn.percentage,
            paymentDate: monthlyReturn.paymentDate,
            paymentStatus: monthlyReturn.status,
            paymentMethod: monthlyReturn.paymentMethod,
            transactionId: monthlyReturn.transactionId
          };
        });
      }
      
      // If no monthly returns data, generate placeholder data
      return [];
    });
    
    res.json(roiData);
  } catch (error) {
    console.error('Error fetching ROI data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserInvestments,
  getInvestmentById,
  createInvestment,
  updateInvestmentStatus,
  getUserROI
};