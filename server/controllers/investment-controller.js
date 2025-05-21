/**
 * Investment Controller
 * 
 * Handles investment operations, tracking, and real-time statistics
 * for both investors and admins
 */

const { eq, and, desc, sql, gte, lte } = require('drizzle-orm');
const { db } = require('../db.cjs');
const { investments, properties, users, transactions, wallets, roiPayments } = require('../../shared/schema');

/**
 * Get all investments for the current user
 */
exports.getMyInvestments = async (req, res) => {
  try {
    const { status, sortBy = 'investmentDate', order = 'desc', limit = 10, page = 1 } = req.query;
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Build query conditions
    let conditions = [eq(investments.userId, req.user.id)];
    
    if (status) {
      conditions.push(eq(investments.status, status));
    }
    
    // Get investments with property details
    const userInvestments = await db.select({
      id: investments.id,
      amount: investments.amount,
      status: investments.status,
      investmentDate: investments.investmentDate,
      property: {
        id: properties.id,
        name: properties.name,
        location: properties.location,
        propertyType: properties.propertyType,
        roi: properties.roi,
        images: properties.images,
        status: properties.status
      }
    })
    .from(investments)
    .leftJoin(properties, eq(investments.propertyId, properties.id))
    .where(and(...conditions))
    .orderBy(order.toLowerCase() === 'desc' ? desc(investments[sortBy]) : investments[sortBy])
    .limit(Number(limit))
    .offset(Number(offset));
    
    // Get total count for pagination
    const [{ count }] = await db.select({
      count: sql`count(*)`
    })
    .from(investments)
    .where(and(...conditions));
    
    // Calculate investment statistics
    const [stats] = await db.select({
      totalInvested: sql`sum(${investments.amount})`,
      totalProperties: sql`count(distinct ${investments.propertyId})`,
      avgInvestment: sql`avg(${investments.amount})`
    })
    .from(investments)
    .where(eq(investments.userId, req.user.id));
    
    // Get ROI payments
    const roiPaymentsData = await db.select({
      id: roiPayments.id,
      amount: roiPayments.amount,
      paymentDate: roiPayments.paymentDate,
      status: roiPayments.status,
      propertyId: roiPayments.propertyId,
      propertyName: properties.name
    })
    .from(roiPayments)
    .leftJoin(properties, eq(roiPayments.propertyId, properties.id))
    .where(eq(roiPayments.userId, req.user.id))
    .orderBy(desc(roiPayments.paymentDate))
    .limit(5);
    
    res.status(200).json({
      status: 'success',
      results: userInvestments.length,
      pagination: {
        totalItems: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
        currentPage: Number(page),
        limit: Number(limit)
      },
      data: {
        investments: userInvestments,
        stats: {
          totalInvested: stats.totalInvested || '0',
          totalProperties: Number(stats.totalProperties) || 0,
          avgInvestment: stats.avgInvestment || '0'
        },
        roiPayments: roiPaymentsData
      }
    });
  } catch (error) {
    console.error('Get my investments error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve investments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a specific investment by ID
 */
exports.getInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get investment with property details
    const [investment] = await db.select({
      id: investments.id,
      userId: investments.userId,
      propertyId: investments.propertyId,
      amount: investments.amount,
      status: investments.status,
      investmentDate: investments.investmentDate,
      paymentId: investments.paymentId,
      contractId: investments.contractId,
      sharesCount: investments.sharesCount,
      property: {
        id: properties.id,
        name: properties.name,
        location: properties.location,
        propertyType: properties.propertyType,
        roi: properties.roi,
        status: properties.status,
        images: properties.images,
        fundingGoal: properties.fundingGoal,
        fundingProgress: properties.fundingProgress
      }
    })
    .from(investments)
    .leftJoin(properties, eq(investments.propertyId, properties.id))
    .where(eq(investments.id, id))
    .limit(1);
    
    if (!investment) {
      return res.status(404).json({
        status: 'error',
        message: 'Investment not found'
      });
    }
    
    // Check if the user is authorized to view this investment
    if (investment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view this investment'
      });
    }
    
    // Get ROI payments for this investment
    const roiPaymentsData = await db.select()
      .from(roiPayments)
      .where(eq(roiPayments.investmentId, id))
      .orderBy(desc(roiPayments.paymentDate));
    
    // Get related transactions
    const transactionsData = await db.select()
      .from(transactions)
      .where(eq(transactions.investmentId, id))
      .orderBy(desc(transactions.createdAt));
    
    res.status(200).json({
      status: 'success',
      data: {
        investment,
        roiPayments: roiPaymentsData,
        transactions: transactionsData
      }
    });
  } catch (error) {
    console.error('Get investment error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve investment details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Make a new investment
 */
exports.createInvestment = async (req, res) => {
  try {
    const { propertyId, amount } = req.body;
    
    // Validate required fields
    if (!propertyId || !amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide propertyId and amount'
      });
    }
    
    // Ensure amount is numeric
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Investment amount must be a positive number'
      });
    }
    
    // Check if property exists and is available for investment
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);
    
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }
    
    if (property.status !== 'active' && req.user.role !== 'admin') {
      return res.status(400).json({
        status: 'error',
        message: 'Property is not currently available for investment'
      });
    }
    
    // Check if amount meets minimum investment requirement
    if (numericAmount < Number(property.minInvestment) && req.user.role !== 'admin') {
      return res.status(400).json({
        status: 'error',
        message: `Minimum investment amount is ${property.minInvestment}`
      });
    }
    
    // Check if amount exceeds maximum investment (if set)
    if (property.maxInvestment && numericAmount > Number(property.maxInvestment) && req.user.role !== 'admin') {
      return res.status(400).json({
        status: 'error',
        message: `Maximum investment amount is ${property.maxInvestment}`
      });
    }
    
    // Check if the investment would exceed the funding goal
    const remainingFunding = Number(property.fundingGoal) - Number(property.fundingProgress);
    if (numericAmount > remainingFunding && req.user.role !== 'admin') {
      return res.status(400).json({
        status: 'error',
        message: `Investment amount exceeds remaining funding needed (${remainingFunding})`
      });
    }
    
    // Check user wallet balance (skip this check for admins)
    if (req.user.role !== 'admin') {
      const [userWallet] = await db.select()
        .from(wallets)
        .where(eq(wallets.userId, req.user.id))
        .limit(1);
      
      if (!userWallet || Number(userWallet.balance) < numericAmount) {
        return res.status(400).json({
          status: 'error',
          message: 'Insufficient funds in wallet',
          data: {
            currentBalance: userWallet ? userWallet.balance : '0',
            requiredAmount: amount
          }
        });
      }
    }
    
    // Start a transaction to ensure data consistency
    await db.transaction(async (tx) => {
      // Create the investment
      const [newInvestment] = await tx.insert(investments)
        .values({
          userId: req.user.id,
          propertyId,
          amount: amount.toString(),
          status: 'confirmed', // Auto-confirm for simplicity (in real app might start as 'pending')
          investmentDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Update property funding progress
      await tx.update(properties)
        .set({
          fundingProgress: sql`${properties.fundingProgress} + ${amount}`,
          updatedAt: new Date()
        })
        .where(eq(properties.id, propertyId));
      
      // Deduct from user wallet (skip for admins)
      if (req.user.role !== 'admin') {
        await tx.update(wallets)
          .set({
            balance: sql`${wallets.balance} - ${amount}`,
            lastUpdated: new Date()
          })
          .where(eq(wallets.userId, req.user.id));
      }
      
      // Record the transaction
      await tx.insert(transactions)
        .values({
          userId: req.user.id,
          investmentId: newInvestment.id,
          type: 'investment',
          amount: amount.toString(),
          status: 'completed',
          description: `Investment in ${property.name}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
    });
    
    // Get the updated property and investment details
    const [updatedProperty] = await db.select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);
    
    const [newInvestment] = await db.select()
      .from(investments)
      .where(and(
        eq(investments.userId, req.user.id),
        eq(investments.propertyId, propertyId)
      ))
      .orderBy(desc(investments.createdAt))
      .limit(1);
    
    // Get updated wallet balance
    const [userWallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, req.user.id))
      .limit(1);
    
    res.status(201).json({
      status: 'success',
      message: 'Investment successful',
      data: {
        investment: newInvestment,
        property: {
          id: updatedProperty.id,
          name: updatedProperty.name,
          fundingGoal: updatedProperty.fundingGoal,
          fundingProgress: updatedProperty.fundingProgress,
          fundingPercentage: (Number(updatedProperty.fundingProgress) / Number(updatedProperty.fundingGoal) * 100).toFixed(2)
        },
        wallet: userWallet ? {
          balance: userWallet.balance,
          currency: userWallet.currency
        } : undefined
      }
    });
  } catch (error) {
    console.error('Create investment error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to process investment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get investment dashboard data for admin
 */
exports.getInvestmentDashboard = async (req, res) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this resource'
      });
    }
    
    // Get overall investment statistics
    const [stats] = await db.select({
      totalInvestments: sql`count(*)`,
      totalAmount: sql`sum(${investments.amount})`,
      avgAmount: sql`avg(${investments.amount})`,
      totalInvestors: sql`count(distinct ${investments.userId})`
    })
    .from(investments);
    
    // Get investment counts by status
    const statusCounts = await db.select({
      status: investments.status,
      count: sql`count(*)`
    })
    .from(investments)
    .groupBy(investments.status);
    
    // Get investment trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await db.select({
      month: sql`date_trunc('month', ${investments.investmentDate})`,
      total: sql`sum(${investments.amount})`,
      count: sql`count(*)`
    })
    .from(investments)
    .where(gte(investments.investmentDate, sixMonthsAgo))
    .groupBy(sql`date_trunc('month', ${investments.investmentDate})`)
    .orderBy(sql`date_trunc('month', ${investments.investmentDate})`);
    
    // Get top properties by investment
    const topProperties = await db.select({
      propertyId: investments.propertyId,
      propertyName: properties.name,
      totalInvested: sql`sum(${investments.amount})`,
      investorCount: sql`count(distinct ${investments.userId})`,
      fundingPercentage: sql`(sum(${investments.amount}) / ${properties.fundingGoal}) * 100`
    })
    .from(investments)
    .leftJoin(properties, eq(investments.propertyId, properties.id))
    .groupBy(investments.propertyId, properties.name, properties.fundingGoal)
    .orderBy(desc(sql`sum(${investments.amount})`))
    .limit(5);
    
    // Get recent investments
    const recentInvestments = await db.select({
      id: investments.id,
      amount: investments.amount,
      investmentDate: investments.investmentDate,
      status: investments.status,
      propertyId: investments.propertyId,
      propertyName: properties.name,
      userId: investments.userId,
      userName: users.name
    })
    .from(investments)
    .leftJoin(properties, eq(investments.propertyId, properties.id))
    .leftJoin(users, eq(investments.userId, users.id))
    .orderBy(desc(investments.investmentDate))
    .limit(10);
    
    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalInvestments: Number(stats.totalInvestments) || 0,
          totalAmount: stats.totalAmount || '0',
          avgAmount: stats.avgAmount || '0',
          totalInvestors: Number(stats.totalInvestors) || 0
        },
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = Number(item.count);
          return acc;
        }, {}),
        monthlyTrend: monthlyTrend.map(item => ({
          month: item.month,
          total: item.total || '0',
          count: Number(item.count) || 0
        })),
        topProperties,
        recentInvestments
      }
    });
  } catch (error) {
    console.error('Get investment dashboard error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve investment dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update investment status (admin only)
 */
exports.updateInvestmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'refunded'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Get investment
    const [investment] = await db.select()
      .from(investments)
      .where(eq(investments.id, id))
      .limit(1);
    
    if (!investment) {
      return res.status(404).json({
        status: 'error',
        message: 'Investment not found'
      });
    }
    
    // If cancelling or refunding, handle property funding progress
    if ((status === 'cancelled' || status === 'refunded') && investment.status === 'confirmed') {
      await db.transaction(async (tx) => {
        // Update investment status
        await tx.update(investments)
          .set({
            status,
            updatedAt: new Date()
          })
          .where(eq(investments.id, id));
        
        // Reduce property funding progress
        await tx.update(properties)
          .set({
            fundingProgress: sql`${properties.fundingProgress} - ${investment.amount}`,
            updatedAt: new Date()
          })
          .where(eq(properties.id, investment.propertyId));
        
        // Return funds to wallet if refunded
        if (status === 'refunded') {
          await tx.update(wallets)
            .set({
              balance: sql`${wallets.balance} + ${investment.amount}`,
              lastUpdated: new Date()
            })
            .where(eq(wallets.userId, investment.userId));
          
          // Record the refund transaction
          await tx.insert(transactions)
            .values({
              userId: investment.userId,
              investmentId: investment.id,
              type: 'refund',
              amount: investment.amount.toString(),
              status: 'completed',
              description: 'Investment refund',
              createdAt: new Date(),
              updatedAt: new Date()
            });
        }
      });
    } else {
      // Just update the status for other status changes
      await db.update(investments)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(eq(investments.id, id));
    }
    
    // Get updated investment
    const [updatedInvestment] = await db.select()
      .from(investments)
      .where(eq(investments.id, id))
      .limit(1);
    
    res.status(200).json({
      status: 'success',
      data: {
        investment: updatedInvestment
      }
    });
  } catch (error) {
    console.error('Update investment status error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update investment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add ROI payment for an investment (admin only)
 */
exports.addROIPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, notes } = req.body;
    
    // Validate required fields
    if (!amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide payment amount'
      });
    }
    
    // Ensure amount is numeric and positive
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment amount must be a positive number'
      });
    }
    
    // Get investment
    const [investment] = await db.select()
      .from(investments)
      .where(eq(investments.id, id))
      .limit(1);
    
    if (!investment) {
      return res.status(404).json({
        status: 'error',
        message: 'Investment not found'
      });
    }
    
    // Get property
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, investment.propertyId))
      .limit(1);
    
    // Create ROI payment
    await db.transaction(async (tx) => {
      // Create ROI payment record
      const [payment] = await tx.insert(roiPayments)
        .values({
          investmentId: investment.id,
          userId: investment.userId,
          propertyId: investment.propertyId,
          amount: amount.toString(),
          paymentDate: new Date(),
          status: 'completed',
          notes: notes || `ROI payment for ${property.name}`
        })
        .returning();
      
      // Add funds to user's wallet
      await tx.update(wallets)
        .set({
          balance: sql`${wallets.balance} + ${amount}`,
          lastUpdated: new Date()
        })
        .where(eq(wallets.userId, investment.userId));
      
      // Record the transaction
      const [transaction] = await tx.insert(transactions)
        .values({
          userId: investment.userId,
          investmentId: investment.id,
          type: 'dividend',
          amount: amount.toString(),
          status: 'completed',
          description: `ROI payment for ${property.name}`,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Update ROI payment with transaction ID
      await tx.update(roiPayments)
        .set({
          transactionId: transaction.id
        })
        .where(eq(roiPayments.id, payment.id));
    });
    
    // Get updated wallet balance
    const [userWallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, investment.userId))
      .limit(1);
    
    res.status(201).json({
      status: 'success',
      message: 'ROI payment processed successfully',
      data: {
        paymentAmount: amount,
        newWalletBalance: userWallet.balance
      }
    });
  } catch (error) {
    console.error('Add ROI payment error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to process ROI payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};