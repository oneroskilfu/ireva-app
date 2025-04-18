const Investment = require('../models/Investment');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const RoiDistribution = require('../models/RoiDistribution');
const { generateReturnReference } = require('../utils/referenceGenerator');

exports.calculateAndDistributeROI = async (req, res) => {
  const { projectId, roiPercentage } = req.body;

  try {
    const investments = await Investment.find({ projectId });

    if (!investments.length) {
      return res.status(404).json({ message: 'No investments found for project' });
    }

    const distributionResults = [];

    for (const investment of investments) {
      const roiAmount = (investment.amount * roiPercentage) / 100;

      // Log ROI distribution
      const roiRecord = new RoiDistribution({
        projectId,
        investorId: investment.investorId,
        investmentId: investment._id,
        amount: roiAmount,
        status: 'Completed'
      });
      await roiRecord.save();

      // Update wallet
      const wallet = await Wallet.findOne({ userId: investment.investorId });
      if (!wallet) {
        distributionResults.push({
          investorId: investment.investorId,
          status: 'Failed',
          reason: 'Wallet not found'
        });
        continue;
      }
      
      wallet.balance += roiAmount;
      wallet.totalReturns += roiAmount;
      await wallet.save();

      // Generate reference number for the transaction
      const reference = generateReturnReference();

      // Add transaction log
      const transaction = new Transaction({
        userId: investment.investorId,
        amount: roiAmount,
        type: 'return',
        reference: reference,
        status: 'completed',
        projectId: projectId,
        description: `ROI payment for investment in project ${projectId}`,
      });
      await transaction.save();

      distributionResults.push({
        investorId: investment.investorId,
        investmentId: investment._id,
        amount: roiAmount,
        status: 'Completed',
        transactionId: transaction._id
      });
    }

    res.status(200).json({ 
      message: 'ROI distributed successfully',
      distributions: distributionResults
    });
  } catch (err) {
    console.error('Error during ROI distribution:', err);
    res.status(500).json({ message: 'Server error during ROI distribution', error: err.message });
  }
};

exports.getProjectROIHistory = async (req, res) => {
  const { projectId } = req.params;

  try {
    const roiDistributions = await RoiDistribution.find({ projectId })
      .populate('investorId', 'username firstName lastName email')
      .sort({ distributionDate: -1 });

    res.status(200).json(roiDistributions);
  } catch (err) {
    console.error('Error fetching ROI distribution history:', err);
    res.status(500).json({ message: 'Failed to fetch ROI distribution history', error: err.message });
  }
};

exports.getInvestorROIHistory = async (req, res) => {
  const { investorId } = req.params;

  try {
    const roiDistributions = await RoiDistribution.find({ investorId })
      .populate('projectId', 'name location type')
      .sort({ distributionDate: -1 });

    res.status(200).json(roiDistributions);
  } catch (err) {
    console.error('Error fetching investor ROI history:', err);
    res.status(500).json({ message: 'Failed to fetch investor ROI history', error: err.message });
  }
};

exports.getRoiSummary = async (req, res) => {
  try {
    const totalDistributed = await RoiDistribution.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const projectDistributions = await RoiDistribution.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: '$projectId', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    const monthlyDistributions = await RoiDistribution.aggregate([
      { $match: { status: 'Completed' } },
      {
        $project: {
          month: { $month: '$distributionDate' },
          year: { $year: '$distributionDate' },
          amount: 1
        }
      },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      totalDistributed: totalDistributed[0]?.total || 0,
      projectDistributions,
      monthlyDistributions
    });
  } catch (err) {
    console.error('Error generating ROI summary:', err);
    res.status(500).json({ message: 'Failed to generate ROI summary', error: err.message });
  }
};