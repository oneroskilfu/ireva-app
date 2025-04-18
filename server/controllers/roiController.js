const mongoose = require('mongoose');
const Investment = require('../models/Investment');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const RoiDistribution = require('../models/RoiDistribution');
const User = require('../models/User');
const { generateReference } = require('../utils/referenceGenerator');

/**
 * Calculate and distribute ROI for a specific project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const calculateAndDistributeROI = async (req, res) => {
  const { projectId, roiPercentage } = req.body;

  if (!projectId || !roiPercentage) {
    return res.status(400).json({ message: 'Project ID and ROI percentage are required' });
  }

  if (roiPercentage <= 0) {
    return res.status(400).json({ message: 'ROI percentage must be greater than 0' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find all active investments for the project
    const investments = await Investment.find({ 
      projectId, 
      status: 'active'
    }).session(session);

    if (investments.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        message: 'No active investments found for this project' 
      });
    }

    // Process each investment and distribute ROI
    const distributions = [];
    let totalDistributed = 0;

    for (const investment of investments) {
      // Calculate ROI amount based on investment amount and ROI percentage
      const roiAmount = (investment.amount * (roiPercentage / 100)).toFixed(2);
      
      // Create distribution record
      const distribution = new RoiDistribution({
        projectId: projectId,
        investorId: investment.investorId,
        investmentId: investment._id,
        amount: roiAmount,
        distributionDate: new Date(),
        status: 'Completed'
      });

      // Save distribution record
      await distribution.save({ session });
      distributions.push(distribution);
      
      // Update investor wallet
      const wallet = await Wallet.findOne({ userId: investment.investorId }).session(session);
      if (!wallet) {
        throw new Error(`Wallet not found for investor with ID ${investment.investorId}`);
      }
      
      wallet.balance = (parseFloat(wallet.balance) + parseFloat(roiAmount)).toFixed(2);
      await wallet.save({ session });
      
      // Create transaction record for the ROI payment
      const transaction = new Transaction({
        userId: investment.investorId,
        type: 'return',
        amount: roiAmount,
        status: 'completed',
        reference: generateReference('ROI'),
        description: `ROI distribution of ${roiPercentage}% for investment in project ${projectId}`,
        metadata: {
          projectId: projectId,
          investmentId: investment._id,
          distributionId: distribution._id
        }
      });
      
      await transaction.save({ session });
      
      // Update total distributed amount
      totalDistributed += parseFloat(roiAmount);
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'ROI distribution completed successfully',
      totalDistributed,
      distributions,
      count: distributions.length
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error distributing ROI:', error);
    res.status(500).json({ message: 'Failed to distribute ROI', error: error.message });
  }
};

/**
 * Get ROI distribution summary with totals and breakdown
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getROISummary = async (req, res) => {
  try {
    // Get total ROI distributed
    const totalDistributed = await RoiDistribution.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Get distribution by project
    const projectDistributions = await RoiDistribution.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: '$projectId', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    // Get distribution by month
    const monthlyDistributions = await RoiDistribution.aggregate([
      { $match: { status: 'Completed' } },
      { 
        $group: { 
          _id: { 
            month: { $month: '$distributionDate' }, 
            year: { $year: '$distributionDate' } 
          }, 
          total: { $sum: '$amount' } 
        } 
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      totalDistributed: totalDistributed.length > 0 ? totalDistributed[0].total : 0,
      projectDistributions,
      monthlyDistributions
    });
  } catch (error) {
    console.error('Error fetching ROI summary:', error);
    res.status(500).json({ message: 'Failed to fetch ROI summary', error: error.message });
  }
};

/**
 * Get ROI distributions for a specific project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProjectROIDistributions = async (req, res) => {
  const { projectId } = req.params;
  
  try {
    const distributions = await RoiDistribution.find({ projectId })
      .sort({ distributionDate: -1 });
    
    res.status(200).json(distributions);
  } catch (error) {
    console.error('Error fetching project ROI distributions:', error);
    res.status(500).json({ 
      message: 'Failed to fetch project ROI distributions', 
      error: error.message 
    });
  }
};

/**
 * Get ROI distributions for a specific investor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getInvestorROIDistributions = async (req, res) => {
  const { investorId } = req.params;
  
  try {
    // Verify investor exists
    const investor = await User.findById(investorId);
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }
    
    // Fetch distributions with populated project data
    const distributions = await RoiDistribution.find({ investorId })
      .populate('projectId', 'name location type')
      .sort({ distributionDate: -1 });
    
    res.status(200).json(distributions);
  } catch (error) {
    console.error('Error fetching investor ROI distributions:', error);
    res.status(500).json({ 
      message: 'Failed to fetch investor ROI distributions', 
      error: error.message 
    });
  }
};

module.exports = {
  calculateAndDistributeROI,
  getROISummary,
  getProjectROIDistributions,
  getInvestorROIDistributions
};