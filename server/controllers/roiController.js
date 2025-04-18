const RoiDistribution = require('../models/RoiDistribution');
const Project = require('../models/Project');
const Investment = require('../models/Investment');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { generateReference } = require('../utils/referenceGenerator');
const sendMail = require('../utils/sendMail');
const { logAdminAction } = require('../utils/adminLogger');
const mongoose = require('mongoose');

/**
 * Calculate and distribute ROI for a specific project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const calculateAndDistributeROI = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { projectId, roiPercentage, notes, distributionPeriod } = req.body;

    if (!projectId || !roiPercentage) {
      return res.status(400).json({ message: 'Project ID and ROI percentage are required' });
    }

    // Validate project exists
    const project = await Project.findById(projectId).session(session);
    if (!project) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find all investments for this project
    const investments = await Investment.find({ 
      projectId: projectId,
      status: 'active' // Only distribute to active investments
    }).session(session);

    if (investments.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'No active investments found for this project' });
    }

    const distributionDate = new Date();
    const distributions = [];
    const failedDistributions = [];

    // Process each investment
    for (const investment of investments) {
      try {
        // Calculate ROI amount based on investment amount and ROI percentage
        const roiAmount = (investment.amount * roiPercentage) / 100;
        
        // Generate unique reference for this transaction
        const transactionReference = generateReference('ROI');
        
        // Get investor
        const investor = await User.findById(investment.userId).session(session);
        if (!investor) {
          failedDistributions.push({
            investmentId: investment._id,
            reason: 'Investor not found'
          });
          continue;
        }
        
        // Get or create investor wallet
        let wallet = await Wallet.findOne({ userId: investor._id }).session(session);
        if (!wallet) {
          wallet = new Wallet({
            userId: investor._id,
            balance: 0,
            status: 'active'
          });
          await wallet.save({ session });
        }
        
        // Create ROI distribution record
        const distribution = new RoiDistribution({
          projectId,
          investorId: investor._id,
          investmentId: investment._id,
          amount: roiAmount,
          distributionDate,
          status: 'Pending',
          notes,
          distributionPeriod,
          roiPercentage,
          transactionReference
        });
        
        await distribution.save({ session });
        
        // Create transaction record
        const transaction = new Transaction({
          userId: investor._id,
          type: 'return',
          amount: roiAmount,
          status: 'completed',
          description: `ROI distribution for ${project.name} - ${distributionPeriod || 'current period'}`,
          reference: transactionReference,
          metadata: {
            projectId,
            investmentId: investment._id,
            distributionId: distribution._id,
            roiPercentage
          }
        });
        
        await transaction.save({ session });
        
        // Update wallet balance
        wallet.balance += roiAmount;
        await wallet.save({ session });
        
        // Update distribution status
        distribution.status = 'Completed';
        await distribution.save({ session });
        
        // Send email notification to investor
        if (investor.email) {
          const formattedAmount = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
          }).format(roiAmount);
          
          const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #3a3a3a; margin-bottom: 5px;">ROI Distribution Notification</h1>
                <p style="color: #666; font-size: 16px;">Your investment is generating returns!</p>
              </div>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h2 style="color: #2d8259; margin-top: 0;">Distribution Summary</h2>
                <p><strong>Project:</strong> ${project.name}</p>
                <p><strong>Amount:</strong> ${formattedAmount}</p>
                <p><strong>Distribution Date:</strong> ${new Date(distributionDate).toLocaleDateString()}</p>
                <p><strong>ROI Rate:</strong> ${roiPercentage}%</p>
                <p><strong>Reference:</strong> ${transactionReference}</p>
                <p><strong>Period:</strong> ${distributionPeriod || 'Current period'}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <p>This amount has been credited to your iREVA wallet. You can view the complete details in your investment dashboard.</p>
                <p>Thank you for investing with iREVA!</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="color: #888; font-size: 12px;">
                  &copy; ${new Date().getFullYear()} iREVA Platform. All rights reserved.<br>
                  This is an automated message, please do not reply.
                </p>
              </div>
            </div>
          `;
          
          sendMail(investor.email, `ROI Payment Credited - ${project.name}`, emailHTML).catch(err => {
            console.error(`Failed to send ROI notification email to ${investor.email}:`, err);
          });
        }
        
        distributions.push(distribution);
      } catch (error) {
        console.error(`Error processing distribution for investment ${investment._id}:`, error);
        failedDistributions.push({
          investmentId: investment._id,
          reason: error.message
        });
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'ROI distribution completed',
      projectId,
      roiPercentage,
      distributionDate,
      distributionCount: distributions.length,
      failedCount: failedDistributions.length,
      distributions,
      failedDistributions
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in ROI distribution:', error);
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
    // Get total amount distributed
    const totalDistributed = await RoiDistribution.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get distribution by project
    const projectDistributions = await RoiDistribution.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { 
        _id: '$projectId', 
        totalDistributed: { $sum: '$amount' },
        distributionCount: { $sum: 1 },
        averageDistribution: { $avg: '$amount' }
      } },
      { $sort: { totalDistributed: -1 } }
    ]);
    
    // Get project details for each project
    const projectsWithDetails = await Promise.all(
      projectDistributions.map(async (item) => {
        const project = await Project.findById(item._id, 'name location type');
        return {
          ...item,
          project: project || { name: 'Unknown Project' }
        };
      })
    );
    
    // Get monthly distribution totals
    const monthlyDistributions = await RoiDistribution.aggregate([
      { $match: { status: 'Completed' } },
      { 
        $group: { 
          _id: { 
            year: { $year: '$distributionDate' }, 
            month: { $month: '$distributionDate' } 
          },
          totalDistributed: { $sum: '$amount' },
          distributionCount: { $sum: 1 }
        } 
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
    
    res.status(200).json({
      totalDistributed: totalDistributed.length > 0 ? totalDistributed[0].total : 0,
      projectDistributions: projectsWithDetails,
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
  try {
    const { projectId } = req.params;
    
    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Get distributions for this project
    const distributions = await RoiDistribution.find({ projectId })
      .sort({ distributionDate: -1 })
      .populate('investorId', 'firstName lastName username email')
      .populate('investmentId');
    
    // Calculate summary stats
    const totalDistributed = distributions.reduce((sum, dist) => sum + dist.amount, 0);
    const completedCount = distributions.filter(dist => dist.status === 'Completed').length;
    const pendingCount = distributions.filter(dist => dist.status === 'Pending').length;
    const failedCount = distributions.filter(dist => dist.status === 'Failed').length;
    
    res.status(200).json({
      projectId,
      projectName: project.name,
      totalDistributed,
      distributionCount: distributions.length,
      completedCount,
      pendingCount,
      failedCount,
      distributions
    });
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
  try {
    const { investorId } = req.params;
    
    // For security, verify the requester is either the investor or an admin
    if (req.jwtPayload.role !== 'admin' && req.jwtPayload.id.toString() !== investorId) {
      return res.status(403).json({ message: 'Unauthorized to access this investor data' });
    }
    
    // Validate investor exists
    const investor = await User.findById(investorId);
    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }
    
    // Get distributions for this investor
    const distributions = await RoiDistribution.find({ investorId })
      .sort({ distributionDate: -1 })
      .populate('projectId', 'name location type imageUrl targetReturn')
      .populate('investmentId');
    
    // Calculate summary stats
    const totalDistributed = distributions.reduce((sum, dist) => sum + dist.amount, 0);
    
    // Group distributions by project
    const projectSummary = [];
    const projectMap = new Map();
    
    distributions.forEach(dist => {
      // Skip if project is undefined
      if (!dist.projectId) return;
      
      // Group by projectId
      const projectIdStr = dist.projectId._id.toString();
      if (!projectMap.has(projectIdStr)) {
        projectMap.set(projectIdStr, {
          projectId: dist.projectId._id,
          projectName: dist.projectId.name,
          totalDistributed: 0,
          distributionCount: 0,
          distributions: []
        });
      }
      
      const projectData = projectMap.get(projectIdStr);
      projectData.totalDistributed += dist.amount;
      projectData.distributionCount += 1;
      projectData.distributions.push(dist);
    });
    
    // Convert map to array for response
    projectMap.forEach(data => projectSummary.push(data));
    
    res.status(200).json({
      investorId,
      investorName: `${investor.firstName} ${investor.lastName}`,
      totalDistributed,
      distributionCount: distributions.length,
      distributions,
      projectSummary
    });
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