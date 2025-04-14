const User = require('../models/User');
const Property = require('../models/Property');
const Project = require('../models/Project');
const Investment = require('../models/Investment');

/**
 * Generate platform summary statistics
 * @returns {Object} Object containing platform statistics
 */
exports.getPlatformStatistics = async () => {
  try {
    // Get basic counts
    const userCount = await User.countDocuments();
    const propertyCount = await Property.countDocuments();
    const projectCount = await Project.countDocuments();
    const investmentCount = await Investment.countDocuments();
    
    // Get KYC statistics
    const kycApprovedCount = await User.countDocuments({ isKYCApproved: true });
    const kycPendingCount = userCount - kycApprovedCount;
    
    // Get funding statistics
    const projects = await Project.find();
    const totalFundingTarget = projects.reduce((sum, project) => sum + project.totalFunding, 0);
    const totalCurrentFunding = projects.reduce((sum, project) => sum + project.currentFunding, 0);
    const fundingProgress = totalFundingTarget > 0 
      ? (totalCurrentFunding / totalFundingTarget) * 100 
      : 0;
    
    // Get property type distribution
    const residentialCount = await Property.countDocuments({ type: 'residential' });
    const commercialCount = await Property.countDocuments({ type: 'commercial' });
    const industrialCount = await Property.countDocuments({ type: 'industrial' });
    const mixedUseCount = await Property.countDocuments({ type: 'mixed-use' });
    const landCount = await Property.countDocuments({ type: 'land' });
    
    // Get project status distribution
    const planningCount = await Project.countDocuments({ status: 'planning' });
    const fundingCount = await Project.countDocuments({ status: 'funding' });
    const constructionCount = await Project.countDocuments({ status: 'construction' });
    const completedCount = await Project.countDocuments({ status: 'completed' });
    
    // Get investment summary
    const investments = await Investment.find();
    const totalInvestmentAmount = investments.reduce((sum, investment) => sum + investment.amount, 0);
    const avgInvestmentAmount = investmentCount > 0 
      ? totalInvestmentAmount / investmentCount 
      : 0;
    
    // Return all statistics
    return {
      users: {
        total: userCount,
        kycApproved: kycApprovedCount,
        kycPending: kycPendingCount,
        kycApprovalRate: userCount > 0 ? (kycApprovedCount / userCount) * 100 : 0
      },
      properties: {
        total: propertyCount,
        byType: {
          residential: residentialCount,
          commercial: commercialCount,
          industrial: industrialCount,
          mixedUse: mixedUseCount,
          land: landCount
        }
      },
      projects: {
        total: projectCount,
        byStatus: {
          planning: planningCount,
          funding: fundingCount,
          construction: constructionCount,
          completed: completedCount
        },
        funding: {
          target: totalFundingTarget,
          current: totalCurrentFunding,
          progress: fundingProgress.toFixed(2)
        }
      },
      investments: {
        total: investmentCount,
        totalAmount: totalInvestmentAmount,
        averageAmount: avgInvestmentAmount
      }
    };
  } catch (error) {
    console.error('Error generating platform statistics:', error);
    throw error;
  }
};

/**
 * Generate user growth data for charts
 * @param {Number} months - Number of months to show data for
 * @returns {Array} Array of user counts by month
 */
exports.getUserGrowthData = async (months = 12) => {
  try {
    const userData = [];
    const currentDate = new Date();
    
    for (let i = 0; i < months; i++) {
      const targetDate = new Date();
      targetDate.setMonth(currentDate.getMonth() - i);
      
      // Start of month
      const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      
      // End of month
      const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      
      // Query for users created in this month
      const userCount = await User.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      });
      
      // Generate month name
      const monthName = startDate.toLocaleString('default', { month: 'short' });
      const year = startDate.getFullYear();
      
      userData.unshift({
        month: `${monthName} ${year}`,
        users: userCount
      });
    }
    
    return userData;
  } catch (error) {
    console.error('Error generating user growth data:', error);
    throw error;
  }
};

/**
 * Generate investment data for charts
 * @param {Number} months - Number of months to show data for
 * @returns {Array} Array of investment amounts by month
 */
exports.getInvestmentTrendData = async (months = 12) => {
  try {
    const investmentData = [];
    const currentDate = new Date();
    
    for (let i = 0; i < months; i++) {
      const targetDate = new Date();
      targetDate.setMonth(currentDate.getMonth() - i);
      
      // Start of month
      const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      
      // End of month
      const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      
      // Query for investments created in this month
      const investments = await Investment.find({
        investmentDate: {
          $gte: startDate,
          $lte: endDate
        }
      });
      
      // Calculate total investment amount for the month
      const totalAmount = investments.reduce((sum, investment) => sum + investment.amount, 0);
      
      // Generate month name
      const monthName = startDate.toLocaleString('default', { month: 'short' });
      const year = startDate.getFullYear();
      
      investmentData.unshift({
        month: `${monthName} ${year}`,
        amount: totalAmount
      });
    }
    
    return investmentData;
  } catch (error) {
    console.error('Error generating investment trend data:', error);
    throw error;
  }
};