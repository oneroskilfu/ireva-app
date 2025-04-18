const mongoose = require('mongoose');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Project = require('../models/Project');
const { generateInvestmentReference } = require('../utils/referenceGenerator');

/**
 * Create a new investment
 */
const investInProject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, projectId, amount } = req.body;

    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Validate minimum investment amount
    if (amount < project.minimumInvestment) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum investment amount is ${project.minimumInvestment}` 
      });
    }

    // Find or create user wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
    }

    // Check wallet balance
    if (wallet.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient funds in wallet' 
      });
    }

    // Generate a unique reference
    const reference = generateInvestmentReference();

    // Create investment
    const investment = await Investment.create({
      userId,
      projectId,
      amount,
      investmentDate: new Date(),
      status: 'active',
      reference
    });

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      amount,
      type: 'investment',
      reference,
      projectId,
      status: 'completed',
      description: `Investment in ${project.name}`
    });

    // Update wallet
    wallet.balance -= amount;
    wallet.totalInvested += amount;
    await wallet.save();

    // Update project funding
    project.currentFunding += amount;
    project.numberOfInvestors = await Investment.countDocuments({ projectId, status: { $ne: 'cancelled' } });
    await project.save();

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Return success response
    res.status(201).json({ 
      success: true, 
      investment,
      transaction,
      wallet: {
        balance: wallet.balance,
        totalInvested: wallet.totalInvested
      }
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error('Investment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process investment',
      error: error.message
    });
  }
};

/**
 * Get user investments
 */
const getUserInvestments = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const investments = await Investment.find({ userId })
      .populate('projectId')
      .sort({ investmentDate: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: investments.length,
      data: investments
    });
  } catch (error) {
    console.error('Error fetching user investments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch investments',
      error: error.message
    });
  }
};

/**
 * Get investment details
 */
const getInvestmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const investment = await Investment.findById(id)
      .populate('projectId')
      .populate('userId', 'firstName lastName email username');
    
    if (!investment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Investment not found' 
      });
    }
    
    // Get related transactions
    const transactions = await Transaction.find({ 
      userId: investment.userId,
      projectId: investment.projectId,
      type: { $in: ['investment', 'return'] }
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      data: { investment, transactions }
    });
  } catch (error) {
    console.error('Error fetching investment details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch investment details',
      error: error.message
    });
  }
};

/**
 * Update investment returns
 */
const updateInvestmentReturns = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { monthlyReturn, totalReturn, returnDate } = req.body;
    
    const investment = await Investment.findById(id);
    
    if (!investment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Investment not found' 
      });
    }
    
    // Update investment returns
    investment.totalReturns = (investment.totalReturns || 0) + totalReturn;
    investment.lastReturnDate = returnDate || new Date();
    investment.monthlyReturns = investment.monthlyReturns || [];
    
    // Add monthly return record
    investment.monthlyReturns.push({
      amount: monthlyReturn,
      date: returnDate || new Date(),
      status: 'paid'
    });
    
    await investment.save();
    
    // Create transaction for the return
    const transaction = await Transaction.create({
      userId: investment.userId,
      amount: totalReturn,
      type: 'return',
      reference: `RET-${Date.now()}`,
      projectId: investment.projectId,
      status: 'completed',
      description: `Returns from investment ${investment.reference}`
    });
    
    // Update user wallet
    let wallet = await Wallet.findOne({ userId: investment.userId });
    if (wallet) {
      wallet.balance += totalReturn;
      wallet.totalReturns += totalReturn;
      await wallet.save();
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ 
      success: true, 
      data: { investment, transaction }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error updating investment returns:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update investment returns',
      error: error.message
    });
  }
};

/**
 * Cancel investment
 */
const cancelInvestment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const investment = await Investment.findById(id);
    
    if (!investment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Investment not found' 
      });
    }
    
    // Check if investment can be cancelled
    if (investment.status !== 'pending' && investment.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'This investment cannot be cancelled' 
      });
    }
    
    // Update investment status
    investment.status = 'cancelled';
    investment.cancellationReason = reason;
    investment.cancellationDate = new Date();
    await investment.save();
    
    // Refund to wallet if active
    if (investment.status === 'active') {
      // Create refund transaction
      const transaction = await Transaction.create({
        userId: investment.userId,
        amount: investment.amount,
        type: 'divestment',
        reference: `DIV-${Date.now()}`,
        projectId: investment.projectId,
        status: 'completed',
        description: `Refund from cancelled investment ${investment.reference}`
      });
      
      // Update user wallet
      let wallet = await Wallet.findOne({ userId: investment.userId });
      if (wallet) {
        wallet.balance += investment.amount;
        wallet.totalInvested -= investment.amount;
        await wallet.save();
      }
      
      // Update project funding
      const project = await Project.findById(investment.projectId);
      if (project) {
        project.currentFunding -= investment.amount;
        project.numberOfInvestors = await Investment.countDocuments({ 
          projectId: project._id, 
          status: { $ne: 'cancelled' } 
        });
        await project.save();
      }
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ 
      success: true, 
      data: investment
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error cancelling investment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel investment',
      error: error.message
    });
  }
};

module.exports = {
  investInProject,
  getUserInvestments,
  getInvestmentDetails,
  updateInvestmentReturns,
  cancelInvestment
};