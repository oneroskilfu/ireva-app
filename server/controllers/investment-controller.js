/**
 * Investment Controller
 * 
 * Handles all investment-related operations including:
 * - Getting investment portfolio summary
 * - Retrieving performance metrics
 * - Calculating ROI data
 * - Managing individual investments
 */

const { eq, and, desc, asc, sql, gte, lte, between } = require('drizzle-orm');
const { db } = require('../db.cjs');
const { investments, properties, users, transactions, roiPayments } = require('../../shared/schema');
const securityMiddleware = require('../middleware/security-middleware');

/**
 * Get investment portfolio summary
 */
exports.getPortfolioSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's investments with property details
    const userInvestments = await db.select({
      investment: investments,
      property: properties
    })
    .from(investments)
    .innerJoin(properties, eq(investments.propertyId, properties.id))
    .where(and(
      eq(investments.userId, userId),
      eq(investments.status, 'active')
    ))
    .orderBy(desc(investments.createdAt));
    
    // Format investments data
    const formattedInvestments = userInvestments.map(item => ({
      id: item.investment.id,
      propertyId: item.investment.propertyId,
      amount: Number(item.investment.amount),
      status: item.investment.status,
      investmentDate: item.investment.investmentDate,
      // Calculate individual ROI
      roi: calculateIndividualROI(item.investment, item.property),
      property: {
        id: item.property.id,
        name: item.property.name,
        location: item.property.location,
        propertyType: item.property.propertyType,
        images: item.property.images,
        roi: Number(item.property.roi)
      }
    }));
    
    // Get unique properties from investments
    const propertyIds = [...new Set(formattedInvestments.map(inv => inv.propertyId))];
    
    // Get property details
    const propertyDetails = await db.select()
      .from(properties)
      .where(sql`id IN (${propertyIds.join(',')})`);
    
    // Calculate total invested
    const totalInvested = formattedInvestments.reduce((sum, inv) => sum + Number(inv.amount), 0);
    
    // Calculate current value (initial investment + ROI)
    const totalROI = await calculateTotalROI(userId);
    const currentValue = totalInvested + totalROI;
    
    // Calculate ROI percentage
    const roiPercentage = totalInvested > 0 ? (totalROI / totalInvested) * 100 : 0;
    
    // Get recent activity (investments, ROI payments, documents, updates)
    const recentActivity = await getRecentActivity(userId);
    
    res.status(200).json({
      status: 'success',
      data: {
        investments: formattedInvestments,
        properties: propertyDetails,
        totalInvested,
        totalROI,
        currentValue,
        roiPercentage,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error getting portfolio summary:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving portfolio summary'
    });
  }
};

/**
 * Get investment performance data
 */
exports.getPerformanceData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '3m' } = req.query;
    
    // Calculate date range based on period
    const { startDate, endDate } = getDateRangeFromPeriod(period);
    
    // Get investment transactions within the period
    const investmentTransactions = await db.select()
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'investment'),
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      ))
      .orderBy(asc(transactions.createdAt));
    
    // Get ROI payments within the period
    const roiTransactions = await db.select()
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'dividend'),
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      ))
      .orderBy(asc(transactions.createdAt));
    
    // Get total investment before the period start (for initial value)
    const [{ totalInvestedBefore }] = await db.select({
      totalInvestedBefore: sql`COALESCE(SUM(amount), 0)`
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, 'investment'),
      lte(transactions.createdAt, startDate)
    ));
    
    // Get total ROI before the period start (for initial value)
    const [{ totalROIBefore }] = await db.select({
      totalROIBefore: sql`COALESCE(SUM(amount), 0)`
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, 'dividend'),
      lte(transactions.createdAt, startDate)
    ));
    
    // Calculate initial value at the start of the period
    const initialValue = Number(totalInvestedBefore) + Number(totalROIBefore);
    
    // Generate daily performance data points
    const performanceData = generatePerformanceData(
      startDate,
      endDate,
      initialValue,
      investmentTransactions,
      roiTransactions
    );
    
    // Get additional performance metrics
    const averageMonthlyROI = await calculateAverageMonthlyROI(userId);
    const projectedAnnualROI = averageMonthlyROI * 12;
    
    // Get best performing property
    const bestProperty = await getBestPerformingProperty(userId);
    
    res.status(200).json({
      status: 'success',
      data: {
        performance: performanceData,
        initialValue,
        averageMonthlyROI,
        projectedAnnualROI,
        bestProperty,
        period
      }
    });
  } catch (error) {
    console.error('Error getting performance data:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving performance data'
    });
  }
};

/**
 * Get ROI data for all properties
 */
exports.getROIData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's investments with property details
    const userInvestments = await db.select({
      investment: investments,
      property: properties
    })
    .from(investments)
    .innerJoin(properties, eq(investments.propertyId, properties.id))
    .where(and(
      eq(investments.userId, userId),
      eq(investments.status, 'active')
    ));
    
    // Group investments by property
    const propertiesMap = new Map();
    userInvestments.forEach(item => {
      const propertyId = item.property.id;
      
      if (!propertiesMap.has(propertyId)) {
        propertiesMap.set(propertyId, {
          id: propertyId,
          name: item.property.name,
          propertyType: item.property.propertyType,
          roi: Number(item.property.roi),
          investment: Number(item.investment.amount),
          currentValue: 0 // To be calculated
        });
      } else {
        // Add to existing investment amount
        const property = propertiesMap.get(propertyId);
        property.investment += Number(item.investment.amount);
      }
    });
    
    // Calculate current values and actual ROI percentages
    for (const [propertyId, property] of propertiesMap.entries()) {
      // Get ROI payments for this property
      const [{ totalROI }] = await db.select({
        totalROI: sql`COALESCE(SUM(amount), 0)`
      })
      .from(roiPayments)
      .where(and(
        eq(roiPayments.userId, userId),
        eq(roiPayments.propertyId, propertyId)
      ));
      
      // Calculate current value
      property.currentValue = property.investment + Number(totalROI);
      
      // Calculate actual ROI percentage
      property.roi = property.investment > 0 
        ? ((property.currentValue - property.investment) / property.investment) * 100 
        : 0;
    }
    
    // Convert to array and sort by ROI
    const propertiesArray = Array.from(propertiesMap.values())
      .sort((a, b) => b.roi - a.roi);
    
    // Calculate statistics
    const roiValues = propertiesArray.map(p => p.roi);
    const averageROI = roiValues.length 
      ? roiValues.reduce((sum, val) => sum + val, 0) / roiValues.length 
      : 0;
    const highestROI = roiValues.length ? Math.max(...roiValues) : 0;
    const lowestROI = roiValues.length ? Math.min(...roiValues) : 0;
    
    // Count properties above/below average
    const propertiesAboveAverage = roiValues.filter(v => v > averageROI).length;
    const propertiesBelowAverage = roiValues.filter(v => v < averageROI).length;
    
    // Get top performing properties
    const topProperties = propertiesArray.slice(0, 5);
    
    res.status(200).json({
      status: 'success',
      data: {
        properties: propertiesArray,
        averageROI,
        highestROI,
        lowestROI,
        propertiesAboveAverage,
        propertiesBelowAverage,
        topProperties
      }
    });
  } catch (error) {
    console.error('Error getting ROI data:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving ROI data'
    });
  }
};

/**
 * Get a specific investment
 */
exports.getInvestment = async (req, res) => {
  try {
    const userId = req.user.id;
    const investmentId = req.params.id;
    
    // Get investment with property details
    const [investment] = await db.select({
      investment: investments,
      property: properties
    })
    .from(investments)
    .innerJoin(properties, eq(investments.propertyId, properties.id))
    .where(and(
      eq(investments.id, investmentId),
      eq(investments.userId, userId)
    ));
    
    if (!investment) {
      return res.status(404).json({
        status: 'error',
        message: 'Investment not found'
      });
    }
    
    // Get ROI payments for this investment
    const roiPayments = await db.select()
      .from(roiPayments)
      .where(eq(roiPayments.investmentId, investmentId))
      .orderBy(desc(roiPayments.paymentDate));
    
    // Calculate total ROI received
    const totalROI = roiPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    
    // Calculate ROI percentage
    const roiPercentage = Number(investment.investment.amount) > 0
      ? (totalROI / Number(investment.investment.amount)) * 100
      : 0;
    
    // Format response
    const formattedInvestment = {
      id: investment.investment.id,
      propertyId: investment.investment.propertyId,
      amount: Number(investment.investment.amount),
      status: investment.investment.status,
      investmentDate: investment.investment.investmentDate,
      createdAt: investment.investment.createdAt,
      property: {
        id: investment.property.id,
        name: investment.property.name,
        location: investment.property.location,
        propertyType: investment.property.propertyType,
        images: investment.property.images,
        price: Number(investment.property.price),
        roi: Number(investment.property.roi),
        duration: investment.property.duration,
        fundingGoal: Number(investment.property.fundingGoal),
        fundingProgress: Number(investment.property.fundingProgress)
      },
      roiPayments,
      totalROI,
      roiPercentage
    };
    
    res.status(200).json({
      status: 'success',
      data: { investment: formattedInvestment }
    });
  } catch (error) {
    console.error('Error getting investment:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving investment'
    });
  }
};

/**
 * Export investments data as CSV
 */
exports.exportInvestmentsCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's investments with property details
    const userInvestments = await db.select({
      investment: investments,
      property: properties
    })
    .from(investments)
    .innerJoin(properties, eq(investments.propertyId, properties.id))
    .where(eq(investments.userId, userId))
    .orderBy(desc(investments.createdAt));
    
    // Format CSV data
    const csvData = userInvestments.map(item => ({
      'Investment ID': item.investment.id,
      'Property Name': item.property.name,
      'Property Type': item.property.propertyType,
      'Location': item.property.location,
      'Investment Amount': Number(item.investment.amount).toFixed(2),
      'Investment Date': new Date(item.investment.investmentDate).toLocaleDateString(),
      'Status': item.investment.status,
      'Property ROI Rate': Number(item.property.roi).toFixed(2) + '%'
    }));
    
    // Convert to CSV string
    const { parse } = require('json2csv');
    const csv = parse(csvData);
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="investments-${Date.now()}.csv"`);
    
    // Send CSV data
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting investments data:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while exporting investments data'
    });
  }
};

/**
 * Helper: Calculate individual ROI for an investment
 */
function calculateIndividualROI(investment, property) {
  // In a real app, this would use actual ROI payment data
  // For now, use the property's ROI rate and time since investment
  const roi = Number(property.roi);
  const investmentDate = new Date(investment.investmentDate);
  const now = new Date();
  
  // Calculate months since investment
  const monthsSinceInvestment = 
    (now.getFullYear() - investmentDate.getFullYear()) * 12 + 
    (now.getMonth() - investmentDate.getMonth());
  
  // Pro-rate ROI based on months
  return monthsSinceInvestment > 0 ? (roi / 12) * monthsSinceInvestment : 0;
}

/**
 * Helper: Calculate total ROI for a user
 */
async function calculateTotalROI(userId) {
  // Get sum of all ROI payments
  const [{ total }] = await db.select({
    total: sql`COALESCE(SUM(amount), 0)`
  })
  .from(transactions)
  .where(and(
    eq(transactions.userId, userId),
    eq(transactions.type, 'dividend')
  ));
  
  return Number(total);
}

/**
 * Helper: Get recent activity for a user
 */
async function getRecentActivity(userId) {
  // Get recent investments
  const recentInvestments = await db.select({
    id: investments.id,
    propertyId: investments.propertyId,
    amount: investments.amount,
    date: investments.createdAt,
    propertyName: properties.name
  })
  .from(investments)
  .innerJoin(properties, eq(investments.propertyId, properties.id))
  .where(eq(investments.userId, userId))
  .orderBy(desc(investments.createdAt))
  .limit(3);
  
  // Get recent ROI payments
  const recentROI = await db.select({
    id: roiPayments.id,
    propertyId: roiPayments.propertyId,
    amount: roiPayments.amount,
    date: roiPayments.paymentDate,
    propertyName: properties.name
  })
  .from(roiPayments)
  .innerJoin(properties, eq(roiPayments.propertyId, properties.id))
  .where(eq(roiPayments.userId, userId))
  .orderBy(desc(roiPayments.paymentDate))
  .limit(3);
  
  // Format investments as activity
  const investmentActivity = recentInvestments.map(inv => ({
    type: 'investment',
    date: inv.date,
    title: `New Investment in ${inv.propertyName}`,
    description: `You invested ${formatCurrency(inv.amount)} in ${inv.propertyName}`
  }));
  
  // Format ROI payments as activity
  const roiActivity = recentROI.map(roi => ({
    type: 'roi',
    date: roi.date,
    title: `ROI Payment from ${roi.propertyName}`,
    description: `You received ${formatCurrency(roi.amount)} in ROI from ${roi.propertyName}`
  }));
  
  // Combine and sort by date (most recent first)
  return [...investmentActivity, ...roiActivity]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5); // Limit to 5 most recent
}

/**
 * Helper: Get date range from period string
 */
function getDateRangeFromPeriod(period) {
  const endDate = new Date();
  let startDate = new Date();
  
  switch (period) {
    case '1m':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case '3m':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6m':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case 'ytd':
      startDate = new Date(endDate.getFullYear(), 0, 1); // January 1st of current year
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case 'all':
      startDate = new Date(0); // Beginning of time (1970)
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 3); // Default to 3 months
  }
  
  return { startDate, endDate };
}

/**
 * Helper: Generate daily performance data points
 */
function generatePerformanceData(startDate, endDate, initialValue, investments, roiPayments) {
  const data = [];
  let currentDate = new Date(startDate);
  let portfolioValue = initialValue;
  let investedAmount = initialValue;
  
  // Create a map of dates to transactions
  const transactionsByDate = new Map();
  
  // Add investments to transaction map
  investments.forEach(investment => {
    const date = new Date(investment.createdAt).toISOString().split('T')[0];
    if (!transactionsByDate.has(date)) {
      transactionsByDate.set(date, { investments: [], roi: [] });
    }
    transactionsByDate.get(date).investments.push(investment);
  });
  
  // Add ROI payments to transaction map
  roiPayments.forEach(roi => {
    const date = new Date(roi.createdAt).toISOString().split('T')[0];
    if (!transactionsByDate.has(date)) {
      transactionsByDate.set(date, { investments: [], roi: [] });
    }
    transactionsByDate.get(date).roi.push(roi);
  });
  
  // Generate data points for each day in the range
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Apply transactions for this date
    if (transactionsByDate.has(dateStr)) {
      const transactions = transactionsByDate.get(dateStr);
      
      // Add investments
      transactions.investments.forEach(investment => {
        investedAmount += Number(investment.amount);
        portfolioValue += Number(investment.amount);
      });
      
      // Add ROI
      transactions.roi.forEach(roi => {
        portfolioValue += Number(roi.amount);
      });
    }
    
    // Add data point
    data.push({
      date: dateStr,
      value: portfolioValue,
      invested: investedAmount
    });
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
}

/**
 * Helper: Calculate average monthly ROI
 */
async function calculateAverageMonthlyROI(userId) {
  // Get all ROI payments
  const roiPayments = await db.select()
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, 'dividend')
    ))
    .orderBy(asc(transactions.createdAt));
  
  if (roiPayments.length === 0) {
    return 0;
  }
  
  // Calculate total ROI
  const totalROI = roiPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  
  // Calculate months between first and last payment
  const firstPaymentDate = new Date(roiPayments[0].createdAt);
  const lastPaymentDate = new Date(roiPayments[roiPayments.length - 1].createdAt);
  
  const monthsDiff = 
    (lastPaymentDate.getFullYear() - firstPaymentDate.getFullYear()) * 12 + 
    (lastPaymentDate.getMonth() - firstPaymentDate.getMonth());
  
  // If less than a month, return total as monthly average
  const months = Math.max(1, monthsDiff);
  
  return totalROI / months;
}

/**
 * Helper: Get best performing property
 */
async function getBestPerformingProperty(userId) {
  // Get user's investments with property details
  const userInvestments = await db.select({
    investment: investments,
    property: properties
  })
  .from(investments)
  .innerJoin(properties, eq(investments.propertyId, properties.id))
  .where(and(
    eq(investments.userId, userId),
    eq(investments.status, 'active')
  ));
  
  if (userInvestments.length === 0) {
    return null;
  }
  
  // Group by property
  const propertiesMap = new Map();
  userInvestments.forEach(item => {
    const propertyId = item.property.id;
    
    if (!propertiesMap.has(propertyId)) {
      propertiesMap.set(propertyId, {
        id: propertyId,
        name: item.property.name,
        roi: Number(item.property.roi)
      });
    }
  });
  
  // Find property with highest ROI
  let bestProperty = null;
  let highestROI = -Infinity;
  
  for (const property of propertiesMap.values()) {
    if (property.roi > highestROI) {
      highestROI = property.roi;
      bestProperty = property;
    }
  }
  
  return bestProperty;
}

/**
 * Helper: Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(Number(amount));
}