import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Investment, { IInvestment } from '../models/Investment';
import Project from '../models/Project';
import User from '../models/User'; // Assuming you have a User model

// Get all investments for a user
export const getUserInvestments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    // Find all investments for the user and populate with project details
    const investments = await Investment.find({ investor: userId })
      .populate('property')
      .sort({ createdAt: -1 });
    
    res.json(investments);
  } catch (error) {
    console.error('Error fetching user investments:', error);
    res.status(500).json({
      message: 'Failed to fetch investments',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get a specific investment by ID
export const getInvestmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const investmentId = req.params.id;
    
    // Find investment and populate with project details
    const investment = await Investment.findById(investmentId)
      .populate('property')
      .populate('investor', 'username email firstName lastName');
    
    if (!investment) {
      res.status(404).json({ message: 'Investment not found' });
      return;
    }
    
    // Verify that the investment belongs to the user
    if (investment.investor._id.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to access this investment' });
      return;
    }
    
    res.json(investment);
  } catch (error) {
    console.error('Error fetching investment:', error);
    res.status(500).json({
      message: 'Failed to fetch investment',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Create a new investment
export const createInvestment = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const userId = req.user?.id;
    const { propertyId, amount } = req.body;
    
    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400).json({ message: 'Valid investment amount is required' });
      return;
    }
    
    // Find the project
    const project = await Project.findById(propertyId).session(session);
    
    if (!project) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    // Check if project is active
    if (project.status !== 'active') {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ message: 'Project is not available for investment' });
      return;
    }
    
    // Check minimum investment
    if (amount < project.minimumInvestment) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ 
        message: `Minimum investment for this project is ₦${project.minimumInvestment}` 
      });
      return;
    }
    
    // Check if there's enough funding capacity left
    const remainingFunding = project.totalFunding - project.currentFunding;
    if (amount > remainingFunding) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({ 
        message: `Only ₦${remainingFunding} of funding capacity remains` 
      });
      return;
    }
    
    // Check if user has enough balance (this would integrate with your wallet system)
    // We'll leave this for you to implement based on your wallet structure
    
    // Create the investment
    const investment = new Investment({
      investor: userId,
      property: propertyId,
      amount,
      status: 'pending',
      monthlyReturn: parseFloat(project.targetReturn) / 12, // Monthly return rate
      term: project.term,
      roi: parseFloat(project.targetReturn),
      startDate: new Date(),
      endDate: new Date(Date.now() + project.term * 30 * 24 * 60 * 60 * 1000), // Approximate end date
      payoutHistory: [],
      documents: []
    });
    
    await investment.save({ session });
    
    // Update project funding status
    project.currentFunding += amount;
    project.numberOfInvestors += 1;
    
    // Update project status if fully funded
    if (project.currentFunding >= project.totalFunding) {
      project.status = 'active';
    }
    
    await project.save({ session });
    
    // Generate investment receipt document
    const receiptDocument = {
      name: `Investment Receipt - ${project.name}`,
      url: `/receipts/investment_${investment._id}.pdf`, // URL would be generated when PDF is created
      type: 'receipt',
      createdAt: new Date()
    };
    
    investment.documents.push(receiptDocument);
    await investment.save({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    // Populate the investment with project details
    const populatedInvestment = await Investment.findById(investment._id)
      .populate('property');
    
    res.status(201).json({
      message: 'Investment created successfully',
      investment: populatedInvestment
    });
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error creating investment:', error);
    res.status(500).json({
      message: 'Failed to create investment',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Update investment returns (admin only)
export const updateInvestmentReturns = async (req: Request, res: Response): Promise<void> => {
  try {
    const { earnings, monthlyReturns } = req.body;
    
    if (typeof earnings !== 'number' || earnings < 0) {
      res.status(400).json({ message: 'Valid earnings amount is required' });
      return;
    }
    
    const investment = await Investment.findById(req.params.id);
    
    if (!investment) {
      res.status(404).json({ message: 'Investment not found' });
      return;
    }
    
    // Update the investment with new earnings
    investment.earnings = earnings;
    
    // Update monthly return rate if provided
    if (typeof monthlyReturns === 'number' && monthlyReturns >= 0) {
      investment.monthlyReturn = monthlyReturns;
    }
    
    // Calculate accrued ROI
    investment.roiAccrued = (earnings / investment.amount) * 100;
    
    // Set next payout date to 30 days from now
    investment.nextPayoutDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Add to payout history
    investment.payoutHistory.push({
      date: new Date(),
      amount: earnings - investment.earnings, // The difference is the newly added earnings
      status: 'completed'
    });
    
    await investment.save();
    
    res.json({
      message: 'Investment returns updated successfully',
      investment
    });
  } catch (error) {
    console.error('Error updating investment returns:', error);
    res.status(500).json({
      message: 'Failed to update investment returns',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Request investment withdrawal
export const requestWithdrawal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { investmentId, amount, reason } = req.body;
    
    if (!investmentId || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ message: 'Valid investment ID and amount are required' });
      return;
    }
    
    // Find the investment
    const investment = await Investment.findById(investmentId);
    
    if (!investment) {
      res.status(404).json({ message: 'Investment not found' });
      return;
    }
    
    // Verify that the investment belongs to the user
    if (investment.investor.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to access this investment' });
      return;
    }
    
    // Check if the investment is active
    if (investment.status !== 'active') {
      res.status(400).json({ message: 'Only active investments can have withdrawals' });
      return;
    }
    
    // Check if there are enough earnings
    if (amount > investment.earnings) {
      res.status(400).json({ 
        message: `Cannot withdraw more than available earnings (₦${investment.earnings})` 
      });
      return;
    }
    
    // Create a withdrawal record
    // This would normally integrate with your wallet and transaction system
    // For now, we'll just update the investment record
    
    // Reduce earnings
    investment.earnings -= amount;
    
    // Add to payout history
    investment.payoutHistory.push({
      date: new Date(),
      amount,
      status: 'pending',
      reference: `WD-${Date.now()}`,
      notes: reason || 'User-requested withdrawal'
    });
    
    await investment.save();
    
    // Here you would typically create a withdrawal transaction in your wallet system
    
    res.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        amount,
        status: 'pending',
        investment: investment._id,
        property: investment.property,
        date: new Date()
      }
    });
  } catch (error) {
    console.error('Error requesting withdrawal:', error);
    res.status(500).json({
      message: 'Failed to process withdrawal request',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get ROI summary for an investor
export const getROISummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    // Get all investments for the user
    const investments = await Investment.find({ investor: userId });
    
    // Calculate summary statistics
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalEarnings = investments.reduce((sum, inv) => sum + inv.earnings, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'active').length;
    
    // Calculate average ROI (weighted by investment amount)
    let weightedRoiSum = 0;
    let totalWeight = 0;
    
    investments.forEach(inv => {
      if (inv.status === 'active') {
        weightedRoiSum += inv.roi * inv.amount;
        totalWeight += inv.amount;
      }
    });
    
    const averageROI = totalWeight > 0 ? weightedRoiSum / totalWeight : 0;
    
    // Calculate projected annual return
    const projectedAnnualReturn = investments.reduce((sum, inv) => {
      if (inv.status === 'active') {
        return sum + (inv.amount * (inv.roi / 100));
      }
      return sum;
    }, 0);
    
    res.json({
      totalInvested,
      totalEarnings,
      activeInvestments,
      averageROI,
      projectedAnnualReturn
    });
  } catch (error) {
    console.error('Error calculating ROI summary:', error);
    res.status(500).json({
      message: 'Failed to calculate ROI summary',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};