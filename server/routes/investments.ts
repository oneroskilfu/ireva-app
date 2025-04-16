import express from 'express';
import { db } from '../db';
import { investments, properties, users } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyToken } from '../auth-jwt';

const router = express.Router();

/**
 * @route GET /api/investments
 * @desc Get all investments for the logged in user
 * @access Private
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userInvestments = await db.select()
      .from(investments)
      .where(eq(investments.userId, userId))
      .orderBy(desc(investments.date));
      
    if (!userInvestments || userInvestments.length === 0) {
      return res.json([]);
    }
    
    res.json(userInvestments);
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({ message: 'Server error getting investments' });
  }
});

/**
 * @route GET /api/investments/:id
 * @desc Get a specific investment by ID
 * @access Private
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.jwtPayload?.id;
    const investmentId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Verify that the investment belongs to the current user
    const [investment] = await db.select()
      .from(investments)
      .where(
        and(
          eq(investments.id, investmentId),
          eq(investments.userId, userId)
        )
      );
      
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    res.json(investment);
  } catch (error) {
    console.error('Get investment error:', error);
    res.status(500).json({ message: 'Server error getting investment' });
  }
});

/**
 * @route POST /api/investments
 * @desc Create a new investment
 * @access Private
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { propertyId, amount } = req.body;
    
    // Validate input
    if (!propertyId || !amount) {
      return res.status(400).json({ message: 'Property ID and amount are required' });
    }
    
    // Verify the property exists
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, propertyId));
      
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if minimum investment is met
    if (amount < property.minimumInvestment) {
      return res.status(400).json({ 
        message: `Minimum investment for this property is ₦${property.minimumInvestment.toLocaleString()}` 
      });
    }
    
    // Check if property is for accredited investors only
    if (property.accreditedOnly) {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId));
        
      if (user.accreditationLevel === 'non_accredited') {
        return res.status(403).json({ 
          message: 'This property is available only to accredited investors' 
        });
      }
    }
    
    // Create the investment
    const [investment] = await db.insert(investments)
      .values({
        userId,
        propertyId,
        amount,
        currentValue: amount, // Initial value is the same as investment amount
        date: new Date(),
        maturityDate: new Date(new Date().setMonth(new Date().getMonth() + property.term)),
        status: 'active',
      })
      .returning();
      
    // Update property funding and investor count
    await db.update(properties)
      .set({
        currentFunding: property.currentFunding + amount,
        numberOfInvestors: property.numberOfInvestors + 1
      })
      .where(eq(properties.id, propertyId));
      
    // Update user's total invested amount
    await db.update(users)
      .set({
        totalInvested: (user.totalInvested || 0) + amount
      })
      .where(eq(users.id, userId));
      
    res.status(201).json({
      message: 'Investment created successfully',
      investment
    });
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ message: 'Server error creating investment' });
  }
});

/**
 * @route GET /api/investments/property/:propertyId
 * @desc Get all investments for a specific property
 * @access Admin
 */
router.get('/property/:propertyId', verifyToken, async (req, res) => {
  try {
    const userId = req.jwtPayload?.id;
    const userRole = req.jwtPayload?.role;
    const propertyId = parseInt(req.params.propertyId);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({ message: "Forbidden. Admin access required." });
    }
    
    const propertyInvestments = await db.select()
      .from(investments)
      .where(eq(investments.propertyId, propertyId))
      .orderBy(desc(investments.date));
      
    if (!propertyInvestments || propertyInvestments.length === 0) {
      return res.json([]);
    }
    
    // Get user details for each investment
    const investmentsWithUserDetails = await Promise.all(
      propertyInvestments.map(async (investment) => {
        const [user] = await db
          .select({
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
          })
          .from(users)
          .where(eq(users.id, investment.userId));
          
        return {
          ...investment,
          user,
        };
      })
    );
    
    res.json(investmentsWithUserDetails);
  } catch (error) {
    console.error('Get property investments error:', error);
    res.status(500).json({ message: 'Server error getting property investments' });
  }
});

/**
 * @route PATCH /api/investments/:id/cancel
 * @desc Cancel an investment (only if it's recent)
 * @access Private
 */
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const userId = req.jwtPayload?.id;
    const investmentId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Verify that the investment belongs to the current user
    const [investment] = await db.select()
      .from(investments)
      .where(
        and(
          eq(investments.id, investmentId),
          eq(investments.userId, userId)
        )
      );
      
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    // Check if investment is recent (within 24 hours)
    const investmentDate = new Date(investment.date);
    const currentDate = new Date();
    const hoursDifference = (currentDate.getTime() - investmentDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDifference > 24) {
      return res.status(400).json({ 
        message: 'Investments can only be cancelled within 24 hours of creation' 
      });
    }
    
    // Update investment status
    const [updatedInvestment] = await db.update(investments)
      .set({
        status: 'cancelled',
      })
      .where(eq(investments.id, investmentId))
      .returning();
      
    // Update property funding and investor count
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, investment.propertyId));
      
    await db.update(properties)
      .set({
        currentFunding: property.currentFunding - investment.amount,
        numberOfInvestors: property.numberOfInvestors - 1
      })
      .where(eq(properties.id, investment.propertyId));
      
    // Update user's total invested amount
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));
      
    await db.update(users)
      .set({
        totalInvested: user.totalInvested - investment.amount
      })
      .where(eq(users.id, userId));
      
    res.json({
      message: 'Investment cancelled successfully',
      investment: updatedInvestment
    });
  } catch (error) {
    console.error('Cancel investment error:', error);
    res.status(500).json({ message: 'Server error cancelling investment' });
  }
});

/**
 * @route PATCH /api/investments/:id/returns
 * @desc Update investment returns (admin only)
 * @access Admin
 */
router.patch('/:id/returns', verifyToken, async (req, res) => {
  try {
    const userId = req.jwtPayload?.id;
    const userRole = req.jwtPayload?.role;
    const investmentId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({ message: "Forbidden. Admin access required." });
    }
    
    const { currentValue, earnings, monthlyReturns } = req.body;
    
    // Validate input
    if (!currentValue && !earnings && !monthlyReturns) {
      return res.status(400).json({ 
        message: 'At least one of currentValue, earnings, or monthlyReturns must be provided' 
      });
    }
    
    // Get the investment
    const [investment] = await db.select()
      .from(investments)
      .where(eq(investments.id, investmentId));
      
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    // Update the investment
    const updateData: any = {};
    
    if (currentValue !== undefined) {
      updateData.currentValue = currentValue;
    }
    
    if (earnings !== undefined) {
      updateData.earnings = earnings;
      
      // Update user's total earnings
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, investment.userId));
        
      await db.update(users)
        .set({
          totalEarnings: (user.totalEarnings || 0) + (earnings - (investment.earnings || 0))
        })
        .where(eq(users.id, investment.userId));
    }
    
    if (monthlyReturns !== undefined) {
      updateData.monthlyReturns = monthlyReturns;
    }
    
    const [updatedInvestment] = await db.update(investments)
      .set(updateData)
      .where(eq(investments.id, investmentId))
      .returning();
      
    res.json({
      message: 'Investment returns updated successfully',
      investment: updatedInvestment
    });
  } catch (error) {
    console.error('Update investment returns error:', error);
    res.status(500).json({ message: 'Server error updating investment returns' });
  }
});

export default router;