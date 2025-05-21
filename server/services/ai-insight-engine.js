/**
 * AI-Powered Insight Engine
 * 
 * This service uses machine learning and AI to provide predictive analytics:
 * - ROI trends forecasting
 * - Market dynamics analysis
 * - Investor churn risk prediction
 * - Anomaly detection in investment patterns
 */

const OpenAI = require('openai');
const SimpleLinearRegression = require('ml-regression').SLR;
const MLR = require('ml-regression').MLR;
const Matrix = require('ml-matrix').Matrix;
const SVD = require('ml-matrix').SVD;
const PCA = require('ml-pca').PCA;
const KMeans = require('ml-kmeans').default;
const euclidean = require('ml-distance-euclidean').distance;
const stat = require('ml-stat').array;

const { db } = require('../db.cjs');
const { eq, and, or, desc, gte, lte, sql } = require('drizzle-orm');
const { 
  investments, 
  properties, 
  users, 
  transactions, 
  ledgerTransactions, 
  journalEntries 
} = require('../../shared/schema');

// Initialize OpenAI with API key from environment
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Predict ROI trends for properties
 * 
 * Uses historical ROI data to forecast future returns using simple linear regression
 * and analyze seasonal patterns
 * 
 * @param {number} propertyId - Optional property ID to filter predictions
 * @param {number} months - Number of months to forecast (default: 6)
 * @returns {Promise<object>} ROI predictions for properties
 */
exports.predictROITrends = async (propertyId = null, months = 6) => {
  try {
    // Fetch historical ROI data
    let roiQuery = db.select({
      propertyId: properties.id,
      propertyName: properties.name,
      monthYear: sql`DATE_TRUNC('month', ${investments.createdAt})`,
      totalInvestment: sql`SUM(${investments.amount})`,
      totalReturns: sql`SUM(${investments.expectedReturns})`,
      roi: sql`(SUM(${investments.expectedReturns}) / NULLIF(SUM(${investments.amount}), 0)) * 100`
    })
    .from(investments)
    .innerJoin(properties, eq(investments.propertyId, properties.id))
    .groupBy(properties.id, sql`DATE_TRUNC('month', ${investments.createdAt})`)
    .orderBy(properties.id, sql`DATE_TRUNC('month', ${investments.createdAt})`);
    
    if (propertyId) {
      roiQuery = roiQuery.where(eq(properties.id, propertyId));
    }
    
    const roiData = await roiQuery;
    
    // Group by property
    const propertiesData = {};
    for (const record of roiData) {
      if (!propertiesData[record.propertyId]) {
        propertiesData[record.propertyId] = {
          propertyId: record.propertyId,
          propertyName: record.propertyName,
          data: []
        };
      }
      
      propertiesData[record.propertyId].data.push({
        monthYear: record.monthYear,
        totalInvestment: parseFloat(record.totalInvestment),
        totalReturns: parseFloat(record.totalReturns),
        roi: parseFloat(record.roi) || 0
      });
    }
    
    // Predict future ROI for each property
    const predictions = {};
    for (const [propertyId, property] of Object.entries(propertiesData)) {
      // Need at least 3 data points for meaningful prediction
      if (property.data.length < 3) {
        predictions[propertyId] = {
          propertyId: property.propertyId,
          propertyName: property.propertyName,
          forecast: [],
          trend: 'insufficient_data',
          confidence: 0,
          note: 'Insufficient historical data for prediction'
        };
        continue;
      }
      
      // Prepare data for regression
      const xValues = [];
      const yValues = [];
      
      for (let i = 0; i < property.data.length; i++) {
        xValues.push(i);
        yValues.push(property.data[i].roi);
      }
      
      // Train simple linear regression model
      const regression = new SimpleLinearRegression(xValues, yValues);
      
      // Make predictions for future months
      const forecast = [];
      for (let i = 1; i <= months; i++) {
        const forecastMonth = property.data.length + i - 1;
        const predictedROI = regression.predict(forecastMonth);
        
        // Calculate date for the prediction
        const lastDataDate = new Date(property.data[property.data.length - 1].monthYear);
        const predictionDate = new Date(lastDataDate);
        predictionDate.setMonth(lastDataDate.getMonth() + i);
        
        forecast.push({
          month: i,
          date: predictionDate,
          predictedROI: predictedROI
        });
      }
      
      // Calculate model quality metrics
      const slope = regression.slope;
      const intercept = regression.intercept;
      const rSquared = regression.score(xValues, yValues);
      
      // Determine trend
      let trend = 'stable';
      if (slope > 0.5) trend = 'increasing';
      else if (slope < -0.5) trend = 'decreasing';
      
      // Calculate confidence based on R-squared
      const confidence = Math.min(Math.max(rSquared, 0), 1);
      
      predictions[propertyId] = {
        propertyId: property.propertyId,
        propertyName: property.propertyName,
        historicalData: property.data,
        forecast,
        trend,
        confidence,
        metrics: {
          slope,
          intercept,
          rSquared
        }
      };
    }
    
    return {
      success: true,
      predictions: Object.values(predictions),
      meta: {
        generatedAt: new Date(),
        forecastMonths: months
      }
    };
  } catch (error) {
    console.error('Error predicting ROI trends:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Analyze market dynamics using investment patterns
 * 
 * Identifies trends in investor behavior, popular property types,
 * and market sentiment shifts
 * 
 * @param {object} options - Analysis options
 * @returns {Promise<object>} Market dynamics analysis
 */
exports.analyzeMarketDynamics = async (options = {}) => {
  try {
    const { 
      timeframe = 'last_6_months', 
      propertyType = null, 
      minInvestors = 5 
    } = options;
    
    // Determine date range from timeframe
    let startDate = new Date();
    const endDate = new Date();
    
    switch (timeframe) {
      case 'last_month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'last_3_months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'last_6_months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case 'last_year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 6);
    }
    
    // Fetch investment data for analysis
    let investmentQuery = db.select({
      investmentId: investments.id,
      propertyId: properties.id,
      propertyName: properties.name,
      propertyType: properties.propertyType,
      investmentAmount: investments.amount,
      investmentDate: investments.createdAt,
      userId: investments.userId,
      expectedROI: properties.expectedROI,
      location: properties.location
    })
    .from(investments)
    .innerJoin(properties, eq(investments.propertyId, properties.id))
    .where(and(
      gte(investments.createdAt, startDate),
      lte(investments.createdAt, endDate)
    ))
    .orderBy(investments.createdAt);
    
    if (propertyType) {
      investmentQuery = investmentQuery.where(eq(properties.propertyType, propertyType));
    }
    
    const investmentData = await investmentQuery;
    
    // Get property counts by type
    const propertyTypeData = {};
    investmentData.forEach(investment => {
      if (!propertyTypeData[investment.propertyType]) {
        propertyTypeData[investment.propertyType] = {
          count: 0,
          totalInvestment: 0,
          investors: new Set()
        };
      }
      
      propertyTypeData[investment.propertyType].count++;
      propertyTypeData[investment.propertyType].totalInvestment += parseFloat(investment.investmentAmount);
      propertyTypeData[investment.propertyType].investors.add(investment.userId);
    });
    
    // Format property type data
    const propertyTypeAnalysis = Object.entries(propertyTypeData).map(([type, data]) => ({
      propertyType: type,
      investmentCount: data.count,
      totalInvestment: data.totalInvestment,
      uniqueInvestors: data.investors.size,
      averageInvestment: data.totalInvestment / data.count
    })).sort((a, b) => b.totalInvestment - a.totalInvestment);
    
    // Group investments by month for trend analysis
    const monthlyTrends = {};
    investmentData.forEach(investment => {
      const month = new Date(investment.investmentDate).toISOString().slice(0, 7);
      
      if (!monthlyTrends[month]) {
        monthlyTrends[month] = {
          month,
          count: 0,
          totalInvestment: 0,
          uniqueInvestors: new Set(),
          propertyTypes: {}
        };
      }
      
      monthlyTrends[month].count++;
      monthlyTrends[month].totalInvestment += parseFloat(investment.investmentAmount);
      monthlyTrends[month].uniqueInvestors.add(investment.userId);
      
      if (!monthlyTrends[month].propertyTypes[investment.propertyType]) {
        monthlyTrends[month].propertyTypes[investment.propertyType] = 0;
      }
      monthlyTrends[month].propertyTypes[investment.propertyType]++;
    });
    
    // Format monthly trends
    const formattedMonthlyTrends = Object.values(monthlyTrends).map(trend => ({
      month: trend.month,
      investmentCount: trend.count,
      totalInvestment: trend.totalInvestment,
      uniqueInvestors: trend.uniqueInvestors.size,
      averageInvestment: trend.totalInvestment / trend.count,
      propertyTypeDistribution: Object.entries(trend.propertyTypes).map(([type, count]) => ({
        type,
        count,
        percentage: (count / trend.count) * 100
      }))
    })).sort((a, b) => a.month.localeCompare(b.month));
    
    // Get popular locations
    const locationAnalysis = {};
    investmentData.forEach(investment => {
      if (!locationAnalysis[investment.location]) {
        locationAnalysis[investment.location] = {
          location: investment.location,
          count: 0,
          totalInvestment: 0,
          uniqueInvestors: new Set()
        };
      }
      
      locationAnalysis[investment.location].count++;
      locationAnalysis[investment.location].totalInvestment += parseFloat(investment.investmentAmount);
      locationAnalysis[investment.location].uniqueInvestors.add(investment.userId);
    });
    
    // Format location analysis
    const formattedLocationAnalysis = Object.values(locationAnalysis).map(loc => ({
      location: loc.location,
      investmentCount: loc.count,
      totalInvestment: loc.totalInvestment,
      uniqueInvestors: loc.uniqueInvestors.size,
      averageInvestment: loc.totalInvestment / loc.count
    })).sort((a, b) => b.totalInvestment - a.totalInvestment);
    
    // Calculate overall market trend using linear regression
    const monthsData = formattedMonthlyTrends.map((month, i) => ({
      x: i,
      y: month.totalInvestment
    }));
    
    let marketTrend = 'stable';
    let trendConfidence = 0;
    
    if (monthsData.length >= 3) {
      const xValues = monthsData.map(d => d.x);
      const yValues = monthsData.map(d => d.y);
      
      const regression = new SimpleLinearRegression(xValues, yValues);
      const slope = regression.slope;
      const rSquared = regression.score(xValues, yValues);
      
      if (slope > 0.05 * stat.mean(yValues)) {
        marketTrend = 'growing';
      } else if (slope < -0.05 * stat.mean(yValues)) {
        marketTrend = 'declining';
      }
      
      trendConfidence = Math.min(Math.max(rSquared, 0), 1);
    }
    
    // Get properties that meet minimum investor threshold
    const popularProperties = {};
    investmentData.forEach(investment => {
      if (!popularProperties[investment.propertyId]) {
        popularProperties[investment.propertyId] = {
          propertyId: investment.propertyId,
          propertyName: investment.propertyName,
          propertyType: investment.propertyType,
          location: investment.location,
          expectedROI: investment.expectedROI,
          totalInvestment: 0,
          investors: new Set()
        };
      }
      
      popularProperties[investment.propertyId].totalInvestment += parseFloat(investment.investmentAmount);
      popularProperties[investment.propertyId].investors.add(investment.userId);
    });
    
    // Filter and format popular properties
    const formattedPopularProperties = Object.values(popularProperties)
      .filter(prop => prop.investors.size >= minInvestors)
      .map(prop => ({
        propertyId: prop.propertyId,
        propertyName: prop.propertyName,
        propertyType: prop.propertyType,
        location: prop.location,
        expectedROI: prop.expectedROI,
        totalInvestment: prop.totalInvestment,
        investorCount: prop.investors.size
      }))
      .sort((a, b) => b.investorCount - a.investorCount);
    
    return {
      success: true,
      marketDynamics: {
        summary: {
          timeframe,
          totalInvestments: investmentData.length,
          totalAmount: investmentData.reduce((sum, inv) => sum + parseFloat(inv.investmentAmount), 0),
          uniqueInvestors: new Set(investmentData.map(inv => inv.userId)).size,
          uniqueProperties: new Set(investmentData.map(inv => inv.propertyId)).size,
          marketTrend,
          trendConfidence
        },
        propertyTypeAnalysis,
        monthlyTrends: formattedMonthlyTrends,
        locationAnalysis: formattedLocationAnalysis,
        popularProperties: formattedPopularProperties
      },
      meta: {
        generatedAt: new Date(),
        dataPoints: investmentData.length
      }
    };
  } catch (error) {
    console.error('Error analyzing market dynamics:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Predict investor churn risk
 * 
 * Identifies investors at risk of churning based on engagement patterns,
 * investment history, and platform activity
 * 
 * @param {object} options - Analysis options
 * @returns {Promise<object>} Investor churn risk predictions
 */
exports.predictInvestorChurn = async (options = {}) => {
  try {
    const { 
      thresholdDays = 90, 
      minInvestments = 1,
      limit = 100 
    } = options;
    
    // Get all active investors with their last activity date
    const investorsQuery = await db.select({
      userId: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
      // Count investments
      investmentCount: sql`(SELECT COUNT(*) FROM investments WHERE investments.user_id = users.id)`,
      // Sum of investment amounts
      totalInvested: sql`(SELECT COALESCE(SUM(amount), 0) FROM investments WHERE investments.user_id = users.id)`,
      // Last investment date
      lastInvestmentDate: sql`(SELECT MAX(created_at) FROM investments WHERE investments.user_id = users.id)`,
      // Count transactions in last 90 days
      recentTransactions: sql`(
        SELECT COUNT(*) FROM ledger_transactions 
        WHERE ledger_transactions.initiated_by = users.id 
        AND ledger_transactions.created_at > NOW() - INTERVAL '90 days'
      )`,
    })
    .from(users)
    .where(eq(users.role, 'investor'))
    .limit(limit);
    
    // Calculate churn risk features
    const investorsData = investorsQuery.map(investor => {
      // Calculate days since last activity (login or investment)
      const lastLoginDate = investor.lastLoginAt ? new Date(investor.lastLoginAt) : new Date(0);
      const lastInvestmentDate = investor.lastInvestmentDate ? new Date(investor.lastInvestmentDate) : new Date(0);
      const lastActivityDate = new Date(Math.max(lastLoginDate.getTime(), lastInvestmentDate.getTime()));
      
      const now = new Date();
      const daysSinceLastActivity = Math.floor((now - lastActivityDate) / (1000 * 60 * 60 * 24));
      
      // Calculate tenure in days
      const createdAtDate = new Date(investor.createdAt);
      const tenureDays = Math.floor((now - createdAtDate) / (1000 * 60 * 60 * 24));
      
      // Calculate average investment amount
      const avgInvestmentAmount = investor.investmentCount > 0 
        ? parseFloat(investor.totalInvested) / investor.investmentCount 
        : 0;
      
      // Calculate churn risk score (higher is more likely to churn)
      let churnRiskScore = 0;
      
      // Factor 1: Days since last activity (weighted heavily)
      churnRiskScore += Math.min(daysSinceLastActivity / thresholdDays, 1) * 50;
      
      // Factor 2: Lack of investments
      if (investor.investmentCount < minInvestments) {
        churnRiskScore += 20;
      }
      
      // Factor 3: Lack of recent transactions
      if (investor.recentTransactions === 0) {
        churnRiskScore += 20;
      }
      
      // Factor 4: Tenure bonus (longer tenure reduces risk)
      const tenureBonus = Math.min(tenureDays / 365, 1) * 10;
      churnRiskScore -= tenureBonus;
      
      // Cap the score between 0-100
      churnRiskScore = Math.max(0, Math.min(100, churnRiskScore));
      
      // Determine risk category
      let riskCategory;
      if (churnRiskScore >= 75) riskCategory = 'high';
      else if (churnRiskScore >= 50) riskCategory = 'medium';
      else if (churnRiskScore >= 25) riskCategory = 'low';
      else riskCategory = 'very_low';
      
      // Return investor with risk assessment
      return {
        userId: investor.userId,
        name: investor.name,
        email: investor.email,
        features: {
          daysSinceLastActivity,
          tenureDays,
          investmentCount: investor.investmentCount,
          totalInvested: parseFloat(investor.totalInvested),
          avgInvestmentAmount,
          recentTransactions: investor.recentTransactions
        },
        riskAssessment: {
          churnRiskScore,
          riskCategory,
          primaryFactors: []
        }
      };
    });
    
    // Add primary factors for risk
    investorsData.forEach(investor => {
      const factors = [];
      
      if (investor.features.daysSinceLastActivity > thresholdDays) {
        factors.push({
          factor: 'inactivity',
          description: `No activity for ${investor.features.daysSinceLastActivity} days`
        });
      }
      
      if (investor.features.investmentCount < minInvestments) {
        factors.push({
          factor: 'low_investment_count',
          description: `Only ${investor.features.investmentCount} investments made`
        });
      }
      
      if (investor.features.recentTransactions === 0) {
        factors.push({
          factor: 'no_recent_transactions',
          description: 'No transactions in the last 90 days'
        });
      }
      
      investor.riskAssessment.primaryFactors = factors;
    });
    
    // Sort by churn risk (highest first)
    investorsData.sort((a, b) => b.riskAssessment.churnRiskScore - a.riskAssessment.churnRiskScore);
    
    // Calculate summary statistics
    const highRiskCount = investorsData.filter(i => i.riskAssessment.riskCategory === 'high').length;
    const mediumRiskCount = investorsData.filter(i => i.riskAssessment.riskCategory === 'medium').length;
    const lowRiskCount = investorsData.filter(i => i.riskAssessment.riskCategory === 'low').length;
    const veryLowRiskCount = investorsData.filter(i => i.riskAssessment.riskCategory === 'very_low').length;
    
    return {
      success: true,
      churnAnalysis: {
        summary: {
          totalInvestors: investorsData.length,
          highRiskCount,
          highRiskPercentage: (highRiskCount / investorsData.length) * 100,
          mediumRiskCount,
          mediumRiskPercentage: (mediumRiskCount / investorsData.length) * 100,
          lowRiskCount,
          lowRiskPercentage: (lowRiskCount / investorsData.length) * 100,
          veryLowRiskCount,
          veryLowRiskPercentage: (veryLowRiskCount / investorsData.length) * 100
        },
        investorRiskProfiles: investorsData,
        riskThresholds: {
          highRisk: 75,
          mediumRisk: 50,
          lowRisk: 25
        }
      },
      meta: {
        generatedAt: new Date(),
        parameters: {
          thresholdDays,
          minInvestments
        }
      }
    };
  } catch (error) {
    console.error('Error predicting investor churn:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Detect anomalies in investment patterns
 * 
 * Uses statistical methods and clustering to identify unusual investment behavior
 * and potential fraud/error conditions
 * 
 * @param {object} options - Analysis options
 * @returns {Promise<object>} Anomaly detection results
 */
exports.detectAnomalies = async (options = {}) => {
  try {
    const { 
      lookbackDays = 90, 
      confidenceThreshold = 0.9,
      significanceLevel = 3 // Number of std deviations for outlier detection
    } = options;
    
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);
    
    // Get recent investments for analysis
    const investmentsQuery = await db.select({
      id: investments.id,
      userId: investments.userId,
      propertyId: investments.propertyId,
      amount: investments.amount,
      createdAt: investments.createdAt,
      propertyName: properties.name,
      propertyType: properties.propertyType,
      expectedROI: properties.expectedROI,
      userName: users.name
    })
    .from(investments)
    .innerJoin(properties, eq(investments.propertyId, properties.id))
    .innerJoin(users, eq(investments.userId, users.id))
    .where(gte(investments.createdAt, cutoffDate))
    .orderBy(investments.createdAt);
    
    // Return early if not enough data
    if (investmentsQuery.length < 10) {
      return {
        success: true,
        anomalyDetection: {
          summary: {
            foundAnomalies: false,
            anomalyCount: 0,
            totalInvestments: investmentsQuery.length
          },
          anomalies: [],
          note: 'Insufficient data for reliable anomaly detection (minimum 10 data points required)'
        },
        meta: {
          generatedAt: new Date(),
          parameters: {
            lookbackDays,
            confidenceThreshold,
            significanceLevel
          }
        }
      };
    }
    
    // Extract investment amounts and calculate basic statistics
    const amounts = investmentsQuery.map(i => parseFloat(i.amount));
    const mean = stat.mean(amounts);
    const stdDev = stat.standardDeviation(amounts, true);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    
    // Z-score anomaly detection for investment amounts
    const amountAnomalies = investmentsQuery
      .map((investment, index) => {
        const amount = parseFloat(investment.amount);
        const zScore = Math.abs((amount - mean) / stdDev);
        
        return {
          investment,
          zScore,
          isAnomaly: zScore > significanceLevel
        };
      })
      .filter(item => item.isAnomaly)
      .map(item => ({
        id: item.investment.id,
        userId: item.investment.userId,
        userName: item.investment.userName,
        propertyId: item.investment.propertyId,
        propertyName: item.investment.propertyName,
        amount: parseFloat(item.investment.amount),
        createdAt: item.investment.createdAt,
        anomalyType: 'amount',
        zScore: item.zScore,
        description: `Unusual investment amount (${item.zScore.toFixed(2)} standard deviations from mean)`,
        confidence: Math.min(1, item.zScore / (significanceLevel + 2))
      }));
    
    // Detect unusual investment frequency by user
    const userInvestmentCounts = {};
    investmentsQuery.forEach(investment => {
      if (!userInvestmentCounts[investment.userId]) {
        userInvestmentCounts[investment.userId] = {
          userId: investment.userId,
          userName: investment.userName,
          count: 0,
          totalAmount: 0
        };
      }
      
      userInvestmentCounts[investment.userId].count++;
      userInvestmentCounts[investment.userId].totalAmount += parseFloat(investment.amount);
    });
    
    // Calculate frequency statistics
    const frequencyCounts = Object.values(userInvestmentCounts).map(u => u.count);
    const freqMean = stat.mean(frequencyCounts);
    const freqStdDev = stat.standardDeviation(frequencyCounts, true);
    
    // Find frequency anomalies
    const frequencyAnomalies = Object.values(userInvestmentCounts)
      .map(user => {
        const zScore = (user.count - freqMean) / freqStdDev;
        return {
          user,
          zScore,
          isAnomaly: zScore > significanceLevel
        };
      })
      .filter(item => item.isAnomaly)
      .map(item => {
        // Get all investments for this user
        const userInvestments = investmentsQuery.filter(i => i.userId === item.user.userId);
        
        return {
          userId: item.user.userId,
          userName: item.user.userName,
          count: item.user.count,
          totalAmount: item.user.totalAmount,
          anomalyType: 'frequency',
          zScore: item.zScore,
          description: `Unusual investment frequency (${item.user.count} investments in ${lookbackDays} days)`,
          confidence: Math.min(1, item.zScore / (significanceLevel + 2)),
          investments: userInvestments.map(i => i.id)
        };
      });
    
    // Combine all anomalies
    const allAnomalies = [
      ...amountAnomalies,
      ...frequencyAnomalies
    ].filter(anomaly => anomaly.confidence >= confidenceThreshold)
     .sort((a, b) => b.confidence - a.confidence);
    
    return {
      success: true,
      anomalyDetection: {
        summary: {
          foundAnomalies: allAnomalies.length > 0,
          anomalyCount: allAnomalies.length,
          totalInvestments: investmentsQuery.length,
          amountStatistics: {
            mean,
            stdDev,
            min,
            max
          },
          frequencyStatistics: {
            mean: freqMean,
            stdDev: freqStdDev,
            min: Math.min(...frequencyCounts),
            max: Math.max(...frequencyCounts)
          }
        },
        anomalies: allAnomalies
      },
      meta: {
        generatedAt: new Date(),
        parameters: {
          lookbackDays,
          confidenceThreshold,
          significanceLevel
        }
      }
    };
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Generate AI-powered investment insights
 * 
 * Uses OpenAI to analyze platform data and provide strategic insights
 * and recommendations
 * 
 * @param {object} data - Platform data to analyze
 * @returns {Promise<object>} AI-generated insights
 */
exports.generateAIInsights = async (data) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required for AI insights');
    }
    
    // Get recent platform statistics
    const platformStats = await getPlatformStatistics();
    
    // Get ROI trend predictions
    const roiTrends = await exports.predictROITrends(null, 6);
    
    // Get market dynamics analysis
    const marketDynamics = await exports.analyzeMarketDynamics({
      timeframe: 'last_6_months'
    });
    
    // Prepare data for OpenAI
    const analysisData = {
      platformStats,
      roiTrends: roiTrends.success ? roiTrends.predictions : null,
      marketDynamics: marketDynamics.success ? marketDynamics.marketDynamics : null,
      specificQuestion: data?.question || null
    };
    
    // Use OpenAI to generate insights
    const prompt = `
      As an AI investment analyst for the iREVA real estate investment platform, please analyze the following platform data and generate strategic insights and recommendations. 
      
      Focus on identifying key trends, opportunities, and potential risks. If there's a specific question, please address it directly.
      
      Platform Statistics:
      ${JSON.stringify(platformStats, null, 2)}
      
      ROI Trends:
      ${JSON.stringify(roiTrends.success ? { 
        summary: `Analyzed ${roiTrends.predictions.length} properties`, 
        trends: roiTrends.predictions.map(p => ({ 
          property: p.propertyName, 
          trend: p.trend, 
          confidence: p.confidence 
        }))
      } : { error: 'Data unavailable' }, null, 2)}
      
      Market Dynamics:
      ${JSON.stringify(marketDynamics.success ? { 
        summary: marketDynamics.marketDynamics.summary,
        propertyTypes: marketDynamics.marketDynamics.propertyTypeAnalysis.slice(0, 3)
      } : { error: 'Data unavailable' }, null, 2)}
      
      ${data?.question ? `Specific Question: ${data.question}` : ''}
      
      Please provide your analysis in the following JSON format:
      {
        "summary": "Brief summary of overall platform health and key insights",
        "trends": [
          {
            "trend": "Name of identified trend",
            "description": "Description of the trend",
            "impact": "Potential impact on the platform",
            "recommendation": "Strategic recommendation"
          }
        ],
        "opportunities": [
          {
            "title": "Title of opportunity",
            "description": "Description of the opportunity",
            "potentialBenefit": "Potential benefit to the platform",
            "implementationSteps": ["Step 1", "Step 2", "Step 3"]
          }
        ],
        "risks": [
          {
            "title": "Title of risk",
            "description": "Description of the risk",
            "severity": "high/medium/low",
            "mitigationStrategy": "Suggested mitigation strategy"
          }
        ],
        "specificAnswers": {
          "answer": "Specific answer to the question posed (if any)",
          "additionalContext": "Any additional context for the answer"
        }
      }
    `;
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: "You are an expert AI investment analyst specializing in real estate investments. You provide clear, data-driven insights and strategic recommendations." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    let insights;
    try {
      insights = JSON.parse(response.choices[0].message.content);
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      insights = { 
        error: 'Could not parse AI insights',
        rawResponse: response.choices[0].message.content
      };
    }
    
    return {
      success: true,
      insights,
      meta: {
        generatedAt: new Date(),
        modelUsed: "gpt-4o",
        analysisDataPoints: Object.keys(analysisData).length
      }
    };
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Generate investment recommendations for users
 * 
 * Uses collaborative filtering and user preference analysis to suggest
 * suitable properties for investment
 * 
 * @param {number} userId - User ID
 * @param {object} options - Recommendation options
 * @returns {Promise<object>} Recommended investments
 */
exports.generateRecommendations = async (userId, options = {}) => {
  try {
    const { limit = 5, includeReasons = true } = options;
    
    // Get user's investment history
    const userInvestmentsQuery = await db.select({
      id: investments.id,
      propertyId: investments.propertyId,
      amount: investments.amount,
      createdAt: investments.createdAt,
      propertyType: properties.propertyType,
      location: properties.location,
      expectedROI: properties.expectedROI,
    })
    .from(investments)
    .innerJoin(properties, eq(investments.propertyId, properties.id))
    .where(eq(investments.userId, userId));
    
    // Get user preferences from investment history
    const userPreferences = {
      investedProperties: new Set(),
      propertyTypes: {},
      locations: {},
      avgInvestmentAmount: 0,
      minROI: Infinity,
      maxROI: 0
    };
    
    // Track totals for average calculation
    let totalInvestmentAmount = 0;
    
    userInvestmentsQuery.forEach(investment => {
      const amount = parseFloat(investment.amount);
      
      // Track invested properties
      userPreferences.investedProperties.add(investment.propertyId);
      
      // Track property type preference
      if (!userPreferences.propertyTypes[investment.propertyType]) {
        userPreferences.propertyTypes[investment.propertyType] = {
          count: 0,
          totalAmount: 0
        };
      }
      userPreferences.propertyTypes[investment.propertyType].count++;
      userPreferences.propertyTypes[investment.propertyType].totalAmount += amount;
      
      // Track location preference
      if (!userPreferences.locations[investment.location]) {
        userPreferences.locations[investment.location] = {
          count: 0,
          totalAmount: 0
        };
      }
      userPreferences.locations[investment.location].count++;
      userPreferences.locations[investment.location].totalAmount += amount;
      
      // Track amount
      totalInvestmentAmount += amount;
      
      // Track ROI range
      const roi = parseFloat(investment.expectedROI);
      userPreferences.minROI = Math.min(userPreferences.minROI, roi);
      userPreferences.maxROI = Math.max(userPreferences.maxROI, roi);
    });
    
    // Calculate avg investment amount
    userPreferences.avgInvestmentAmount = userInvestmentsQuery.length > 0 
      ? totalInvestmentAmount / userInvestmentsQuery.length 
      : 0;
    
    // Get available properties (that user hasn't invested in yet)
    const availablePropertiesQuery = await db.select({
      id: properties.id,
      name: properties.name,
      description: properties.description,
      propertyType: properties.propertyType,
      location: properties.location,
      expectedROI: properties.expectedROI,
      minInvestment: properties.minInvestment,
      maxInvestment: properties.maxInvestment,
      fundingGoal: properties.fundingGoal,
      currentFunding: properties.currentFunding,
      status: properties.status,
      imageUrl: properties.imageUrl
    })
    .from(properties)
    .where(
      and(
        eq(properties.status, 'active'),
        sql`${properties.id} NOT IN (
          SELECT property_id FROM investments 
          WHERE user_id = ${userId}
        )`
      )
    );
    
    // Calculate preference similarity scores for available properties
    const scoredProperties = availablePropertiesQuery.map(property => {
      let score = 0;
      const reasons = [];
      
      // Score based on property type preference
      if (userPreferences.propertyTypes[property.propertyType]) {
        const typeCount = userPreferences.propertyTypes[property.propertyType].count;
        const typeScore = Math.min(typeCount / 2, 1) * 30; // Max 30 points for property type
        score += typeScore;
        
        if (typeScore > 15) {
          reasons.push(`Matches your preferred property type (${property.propertyType})`);
        }
      }
      
      // Score based on location preference
      if (userPreferences.locations[property.location]) {
        const locationCount = userPreferences.locations[property.location].count;
        const locationScore = Math.min(locationCount / 2, 1) * 25; // Max 25 points for location
        score += locationScore;
        
        if (locationScore > 12) {
          reasons.push(`Located in an area you've invested in before (${property.location})`);
        }
      }
      
      // Score based on ROI preference
      const roi = parseFloat(property.expectedROI);
      if (userPreferences.minROI !== Infinity && userPreferences.maxROI !== 0) {
        const preferredRoiMidpoint = (userPreferences.minROI + userPreferences.maxROI) / 2;
        const roiDifference = Math.abs(roi - preferredRoiMidpoint);
        const roiRange = userPreferences.maxROI - userPreferences.minROI;
        
        // Higher score for ROI closer to user's preferred range
        const roiScore = roiRange > 0 
          ? Math.max(0, 1 - (roiDifference / (roiRange * 2))) * 25 
          : (roi >= preferredRoiMidpoint ? 25 : 0);
        
        score += roiScore;
        
        if (roi > preferredRoiMidpoint) {
          reasons.push(`Offers higher ROI (${roi.toFixed(2)}%) than your average investments`);
        } else if (Math.abs(roi - preferredRoiMidpoint) < 1) {
          reasons.push(`ROI (${roi.toFixed(2)}%) aligns with your past investment preferences`);
        }
      } else {
        // If no ROI history, favor higher ROI
        score += Math.min(roi / 10, 1) * 25;
        reasons.push(`Attractive ROI of ${roi.toFixed(2)}%`);
      }
      
      // Score based on investment amount compatibility
      const minInvestment = parseFloat(property.minInvestment);
      if (userPreferences.avgInvestmentAmount > 0) {
        const amountCompatibility = Math.max(0, 1 - Math.abs(minInvestment - userPreferences.avgInvestmentAmount) / userPreferences.avgInvestmentAmount);
        const amountScore = amountCompatibility * 20; // Max 20 points for amount
        score += amountScore;
        
        if (amountScore > 10) {
          reasons.push(`Minimum investment (${minInvestment.toFixed(2)}) is similar to your typical investment`);
        }
      }
      
      // Get funding progress percentage
      const fundingProgress = property.fundingGoal > 0 
        ? (parseFloat(property.currentFunding) / parseFloat(property.fundingGoal)) * 100 
        : 0;
      
      // Bonus points for properties with momentum (30-70% funded)
      if (fundingProgress >= 30 && fundingProgress <= 70) {
        score += 15;
        reasons.push(`Good momentum with ${fundingProgress.toFixed(0)}% funding progress`);
      }
      
      // Cap the score at 100
      score = Math.min(100, score);
      
      // Only keep the top 3 reasons
      const topReasons = reasons.slice(0, 3);
      
      return {
        property,
        fundingProgress,
        similarityScore: score,
        reasons: topReasons
      };
    });
    
    // Sort by similarity score (highest first)
    scoredProperties.sort((a, b) => b.similarityScore - a.similarityScore);
    
    // Take top N recommendations
    const recommendations = scoredProperties.slice(0, limit).map(item => ({
      propertyId: item.property.id,
      propertyName: item.property.name,
      description: item.property.description,
      propertyType: item.property.propertyType,
      location: item.property.location,
      expectedROI: parseFloat(item.property.expectedROI),
      minInvestment: parseFloat(item.property.minInvestment),
      maxInvestment: parseFloat(item.property.maxInvestment),
      fundingProgress: item.fundingProgress,
      matchScore: item.similarityScore,
      imageUrl: item.property.imageUrl,
      ...(includeReasons ? { reasons: item.reasons } : {})
    }));
    
    return {
      success: true,
      recommendations,
      userPreferences: {
        favoritePropertyTypes: Object.entries(userPreferences.propertyTypes)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([type, data]) => ({
            type,
            count: data.count,
            percentage: userInvestmentsQuery.length > 0 
              ? (data.count / userInvestmentsQuery.length) * 100 
              : 0
          })),
        favoriteLocations: Object.entries(userPreferences.locations)
          .sort((a, b) => b[1].count - a[1].count)
          .map(([location, data]) => ({
            location,
            count: data.count,
            percentage: userInvestmentsQuery.length > 0 
              ? (data.count / userInvestmentsQuery.length) * 100 
              : 0
          })),
        avgInvestmentAmount: userPreferences.avgInvestmentAmount,
        investmentCount: userInvestmentsQuery.length
      },
      meta: {
        generatedAt: new Date(),
        userId,
        propertiesAnalyzed: availablePropertiesQuery.length
      }
    };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Helper function to get overall platform statistics
 * 
 * @returns {Promise<object>} Platform statistics
 */
async function getPlatformStatistics() {
  try {
    // Get user statistics
    const [userStats] = await db.select({
      totalUsers: sql`COUNT(*)`,
      newUsersLast30Days: sql`SUM(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END)`,
      activeUsersLast30Days: sql`SUM(CASE WHEN last_login_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END)`
    })
    .from(users);
    
    // Get investment statistics
    const [investmentStats] = await db.select({
      totalInvestments: sql`COUNT(*)`,
      totalAmount: sql`SUM(amount)`,
      avgInvestmentSize: sql`AVG(amount)`,
      investmentsLast30Days: sql`SUM(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END)`,
      amountLast30Days: sql`SUM(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN amount ELSE 0 END)`
    })
    .from(investments);
    
    // Get property statistics
    const [propertyStats] = await db.select({
      totalProperties: sql`COUNT(*)`,
      activeProperties: sql`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
      completedProperties: sql`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
      totalFundingGoal: sql`SUM(funding_goal)`,
      totalCurrentFunding: sql`SUM(current_funding)`,
      avgExpectedROI: sql`AVG(expected_roi)`
    })
    .from(properties);
    
    // Get transaction statistics
    const [transactionStats] = await db.select({
      totalTransactions: sql`COUNT(*)`,
      transactionsLast30Days: sql`SUM(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END)`,
      depositCount: sql`SUM(CASE WHEN transaction_type = 'deposit' THEN 1 ELSE 0 END)`,
      withdrawalCount: sql`SUM(CASE WHEN transaction_type = 'withdrawal' THEN 1 ELSE 0 END)`,
      investmentCount: sql`SUM(CASE WHEN transaction_type = 'investment' THEN 1 ELSE 0 END)`,
      roiDistributionCount: sql`SUM(CASE WHEN transaction_type = 'roi_distribution' THEN 1 ELSE 0 END)`
    })
    .from(ledgerTransactions);
    
    return {
      userStats: {
        totalUsers: parseInt(userStats.totalUsers) || 0,
        newUsersLast30Days: parseInt(userStats.newUsersLast30Days) || 0,
        activeUsersLast30Days: parseInt(userStats.activeUsersLast30Days) || 0,
        userGrowthRate: userStats.totalUsers > 0 
          ? (userStats.newUsersLast30Days / userStats.totalUsers) * 100 
          : 0,
        activeUserPercentage: userStats.totalUsers > 0 
          ? (userStats.activeUsersLast30Days / userStats.totalUsers) * 100 
          : 0
      },
      investmentStats: {
        totalInvestments: parseInt(investmentStats.totalInvestments) || 0,
        totalAmount: parseFloat(investmentStats.totalAmount) || 0,
        avgInvestmentSize: parseFloat(investmentStats.avgInvestmentSize) || 0,
        investmentsLast30Days: parseInt(investmentStats.investmentsLast30Days) || 0,
        amountLast30Days: parseFloat(investmentStats.amountLast30Days) || 0,
        investmentGrowthRate: investmentStats.totalInvestments > 0 
          ? (investmentStats.investmentsLast30Days / investmentStats.totalInvestments) * 100 
          : 0
      },
      propertyStats: {
        totalProperties: parseInt(propertyStats.totalProperties) || 0,
        activeProperties: parseInt(propertyStats.activeProperties) || 0,
        completedProperties: parseInt(propertyStats.completedProperties) || 0,
        totalFundingGoal: parseFloat(propertyStats.totalFundingGoal) || 0,
        totalCurrentFunding: parseFloat(propertyStats.totalCurrentFunding) || 0,
        fundingPercentage: propertyStats.totalFundingGoal > 0 
          ? (propertyStats.totalCurrentFunding / propertyStats.totalFundingGoal) * 100 
          : 0,
        avgExpectedROI: parseFloat(propertyStats.avgExpectedROI) || 0
      },
      transactionStats: {
        totalTransactions: parseInt(transactionStats.totalTransactions) || 0,
        transactionsLast30Days: parseInt(transactionStats.transactionsLast30Days) || 0,
        depositCount: parseInt(transactionStats.depositCount) || 0,
        withdrawalCount: parseInt(transactionStats.withdrawalCount) || 0,
        investmentCount: parseInt(transactionStats.investmentCount) || 0,
        roiDistributionCount: parseInt(transactionStats.roiDistributionCount) || 0,
        transactionGrowthRate: transactionStats.totalTransactions > 0 
          ? (transactionStats.transactionsLast30Days / transactionStats.totalTransactions) * 100 
          : 0
      }
    };
  } catch (error) {
    console.error('Error getting platform statistics:', error);
    return { error: error.message };
  }
}