const User = require('../models/User');
const Property = require('../models/Property');
const Investment = require('../models/Investment');

/**
 * Get platform statistics for the admin dashboard
 * @returns {Promise<Object>} Statistics object
 */
exports.getPlatformStatistics = async () => {
  try {
    const [userCount, propertyCount, investments] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Investment.find()
    ]);

    const totalInvestments = investments.length;
    const totalAmountInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingKYCCount = await User.countDocuments({ isKYCApproved: false });

    // Get recent activities (last 10)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentInvestments = await Investment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate('property', 'name');

    // Format recent activities
    const recentActivities = [
      ...recentUsers.map(user => ({
        type: 'user',
        message: `New user registered: ${user.name}`,
        timestamp: user.createdAt.toLocaleDateString('en-NG')
      })),
      ...recentInvestments.map(inv => ({
        type: 'investment',
        message: `New investment of ₦${inv.amount.toLocaleString()} in ${inv.property.name} by ${inv.user.name}`,
        timestamp: inv.createdAt.toLocaleDateString('en-NG')
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    return {
      totalUsers: userCount,
      totalProperties: propertyCount,
      totalInvestments,
      totalAmountInvested,
      pendingKYCCount,
      recentActivities
    };
  } catch (error) {
    console.error('Error getting platform statistics:', error);
    throw error;
  }
};

/**
 * Get user growth data for a specified period
 * @param {number} months - Number of months to get data for
 * @returns {Promise<Array>} Array of user growth data points
 */
exports.getUserGrowthData = async (months = 12) => {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - months);
    
    // Get all users created after the start date
    const users = await User.find({
      createdAt: { $gte: startDate }
    }).select('createdAt');
    
    // Group users by month
    const monthlyData = [];
    
    for (let i = 0; i <= months; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const label = `${month} ${year}`;
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = users.filter(user => 
        user.createdAt >= monthStart && user.createdAt <= monthEnd
      ).length;
      
      monthlyData.push({ month: label, count });
    }
    
    return monthlyData;
  } catch (error) {
    console.error('Error getting user growth data:', error);
    throw error;
  }
};

/**
 * Get investment trend data for a specified period
 * @param {number} months - Number of months to get data for
 * @returns {Promise<Array>} Array of investment trend data points
 */
exports.getInvestmentTrendData = async (months = 12) => {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - months);
    
    // Get all investments created after the start date
    const investments = await Investment.find({
      createdAt: { $gte: startDate }
    }).select('amount createdAt');
    
    // Group investments by month
    const monthlyData = [];
    
    for (let i = 0; i <= months; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const label = `${month} ${year}`;
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthInvestments = investments.filter(inv => 
        inv.createdAt >= monthStart && inv.createdAt <= monthEnd
      );
      
      const count = monthInvestments.length;
      const amount = monthInvestments.reduce((sum, inv) => sum + inv.amount, 0);
      
      monthlyData.push({ 
        month: label, 
        count, 
        amount 
      });
    }
    
    return monthlyData;
  } catch (error) {
    console.error('Error getting investment trend data:', error);
    throw error;
  }
};