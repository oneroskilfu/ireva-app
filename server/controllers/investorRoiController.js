import mongoose from 'mongoose';
import Transaction from '../models/Transaction';
import Wallet from '../models/Wallet';
import Property from '../models/Property';
import Investment from '../models/Investment';
import RoiDistribution from '../models/RoiDistribution';

/**
 * Get ROI summary statistics for an investor
 */
const getRoiStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get total ROI earnings
    const totalEarnings = await Transaction.aggregate([
      { 
        $match: { 
          userId: mongoose.Types.ObjectId(userId),
          type: 'return'
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);
    
    // Get last month's ROI earnings
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthEarnings = await Transaction.aggregate([
      { 
        $match: { 
          userId: mongoose.Types.ObjectId(userId),
          type: 'return',
          createdAt: { $gte: lastMonth }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);
    
    // Get average ROI percentage
    const investments = await Investment.find({ 
      userId: mongoose.Types.ObjectId(userId),
      status: { $in: ['active', 'completed'] }
    });
    
    const propertyIds = investments.map(inv => inv.propertyId);
    const properties = await Property.find({ _id: { $in: propertyIds } });
    
    const targetReturns = properties.map(p => parseFloat(p.targetReturn));
    const averageRoi = targetReturns.length > 0 
      ? targetReturns.reduce((a, b) => a + b, 0) / targetReturns.length 
      : 0;
    
    // Get next payout date (estimate from the latest ROI distribution)
    const latestDistribution = await RoiDistribution.findOne({})
      .sort({ distributionDate: -1 });
    
    const nextPayoutDate = latestDistribution 
      ? new Date(latestDistribution.distributionDate)
      : new Date();
    
    nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
    
    // Get active properties with investments
    const activeInvestments = await Investment.countDocuments({ 
      userId: mongoose.Types.ObjectId(userId),
      status: 'active'
    });

    res.status(200).json({
      success: true,
      data: {
        totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
        lastMonthEarnings: lastMonthEarnings.length > 0 ? lastMonthEarnings[0].total : 0,
        averageRoi: averageRoi.toFixed(1),
        nextPayoutDate: nextPayoutDate.toISOString(),
        activeInvestments
      }
    });
  } catch (error) {
    console.error('Error fetching investor ROI stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ROI statistics',
      error: error.message
    });
  }
};

/**
 * Get ROI distribution chart data for an investor
 */
const getRoiChartData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get monthly ROI distributions for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const roiTransactions = await Transaction.find({
      userId: mongoose.Types.ObjectId(userId),
      type: 'return',
      createdAt: { $gte: sixMonthsAgo }
    }).sort({ createdAt: 1 });
    
    // Group transactions by month
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    roiTransactions.forEach(transaction => {
      const date = new Date(transaction.createdAt);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          amount: 0
        };
      }
      
      monthlyData[monthKey].amount += transaction.amount;
    });
    
    // Convert to array and ensure we have at least 6 months of data
    const chartData = Object.values(monthlyData);
    
    // Fill in missing months with zeros if needed
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!monthlyData[monthKey]) {
        chartData.push({
          month: monthKey,
          amount: 0
        });
      }
    }
    
    // Sort by date
    chartData.sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      
      const aMonthIndex = months.indexOf(aMonth);
      const bMonthIndex = months.indexOf(bMonth);
      
      if (aYear === bYear) {
        return aMonthIndex - bMonthIndex;
      }
      
      return aYear - bYear;
    });
    
    // Only return the last 6 months
    const last6Months = chartData.slice(-6);
    
    res.status(200).json({
      success: true,
      data: last6Months
    });
  } catch (error) {
    console.error('Error fetching investor ROI chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ROI chart data',
      error: error.message
    });
  }
};

/**
 * Get ROI transaction history for an investor
 */
const getRoiTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, sort = 'desc', projectId } = req.query;
    
    // Build query
    const query = {
      userId: mongoose.Types.ObjectId(userId),
      type: 'return'
    };
    
    if (projectId) {
      query.propertyId = mongoose.Types.ObjectId(projectId);
    }
    
    // Get total count
    const totalCount = await Transaction.countDocuments(query);
    
    // Get transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ createdAt: sort === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('propertyId', 'name location');
    
    // Format transactions for frontend
    const formattedTransactions = transactions.map(t => ({
      id: t._id,
      date: t.createdAt,
      propertyId: t.propertyId?._id || null,
      propertyName: t.propertyId?.name || 'Unknown Property',
      propertyLocation: t.propertyId?.location || null,
      amount: t.amount,
      status: t.status,
      reference: t.reference
    }));
    
    res.status(200).json({
      success: true,
      data: formattedTransactions,
      totalCount,
      page: parseInt(page),
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching investor ROI transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ROI transactions',
      error: error.message
    });
  }
};

/**
 * Get investment performance metrics for an investor
 */
const getInvestmentPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all of the user's investments
    const investments = await Investment.find({ 
      userId: mongoose.Types.ObjectId(userId) 
    }).populate('propertyId', 'name targetReturn');
    
    // Group investments by property
    const propertiesMap = new Map();
    
    for (const investment of investments) {
      const propertyId = investment.propertyId?._id?.toString();
      if (!propertyId) continue;
      
      if (!propertiesMap.has(propertyId)) {
        propertiesMap.set(propertyId, {
          id: propertyId,
          name: investment.propertyId.name,
          targetReturn: parseFloat(investment.propertyId.targetReturn || 0),
          totalInvested: 0,
          totalReturns: 0,
          performanceRatio: 0
        });
      }
      
      const property = propertiesMap.get(propertyId);
      property.totalInvested += investment.amount;
    }
    
    // Get all ROI transactions for these investments
    const propertyIds = Array.from(propertiesMap.keys()).map(id => mongoose.Types.ObjectId(id));
    
    const roiTransactions = await Transaction.find({
      userId: mongoose.Types.ObjectId(userId),
      type: 'return',
      propertyId: { $in: propertyIds }
    });
    
    // Calculate total returns for each property
    for (const transaction of roiTransactions) {
      const propertyId = transaction.propertyId?.toString();
      if (!propertyId || !propertiesMap.has(propertyId)) continue;
      
      const property = propertiesMap.get(propertyId);
      property.totalReturns += transaction.amount;
    }
    
    // Calculate performance ratio (returns / investment amount)
    for (const property of propertiesMap.values()) {
      if (property.totalInvested > 0) {
        property.performanceRatio = (property.totalReturns / property.totalInvested * 100).toFixed(2);
      }
    }
    
    // Convert to array and sort by performance ratio
    const performanceData = Array.from(propertiesMap.values())
      .sort((a, b) => b.performanceRatio - a.performanceRatio);
    
    res.status(200).json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    console.error('Error fetching investment performance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching investment performance metrics',
      error: error.message
    });
  }
};