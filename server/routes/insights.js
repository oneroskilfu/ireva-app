const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { createObjectCsvStringifier } = require('csv-writer');
const NotificationService = require('../services/notifications/NotificationService');

// Get ROI history data
router.get('/insights/roi-history', verifyToken, async (req, res) => {
  try {
    const { timeframe = 'last_6_months' } = req.query;
    const userId = req.user.id;
    
    // Calculate date range based on timeframe
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'last_month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'last_3_months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'last_6_months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'last_year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all_time':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6);
    }
    
    // Get ROI data from database
    // In a real implementation, this would query the actual ROI data
    // For now, generate sample data
    
    const months = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Generate ROI data for each month
    const roiHistory = months.map((date, index) => {
      // Create somewhat realistic ROI that increases over time with small variations
      const baseRoi = 6 + (index * 0.2); // Gradually increasing base ROI
      const randomVariation = (Math.random() * 1.5) - 0.75; // Random variation between -0.75 and 0.75
      const roi = baseRoi + randomVariation;
      
      // Calculate investment amount (also gradually increasing)
      const baseInvestment = 10000 + (index * 1000);
      const investmentVariation = (Math.random() * 2000) - 1000;
      const investmentAmount = baseInvestment + investmentVariation;
      
      // Calculate return amount based on ROI
      const returnAmount = investmentAmount * (1 + (roi / 100));
      
      return {
        date: date.toISOString().split('T')[0],
        roi: parseFloat(roi.toFixed(2)),
        investmentAmount: parseFloat(investmentAmount.toFixed(2)),
        returnAmount: parseFloat(returnAmount.toFixed(2))
      };
    });
    
    // Generate future ROI predictions
    const predictions = [];
    const predictionDate = new Date(endDate);
    
    for (let i = 1; i <= 3; i++) {
      predictionDate.setMonth(predictionDate.getMonth() + 1);
      
      // Create somewhat realistic predictions based on past trend
      const lastRoi = roiHistory[roiHistory.length - 1].roi;
      const predictionBase = lastRoi + (i * 0.15); // Slight upward trend
      const randomVariation = (Math.random() * 1) - 0.5; // Random variation between -0.5 and 0.5
      const predictedRoi = predictionBase + randomVariation;
      
      predictions.push({
        date: predictionDate.toISOString().split('T')[0],
        predictedRoi: parseFloat(predictedRoi.toFixed(2))
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        roiHistory,
        predictions
      }
    });
  } catch (error) {
    console.error('Error fetching ROI history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ROI history',
      error: error.message
    });
  }
});

// Get wallet activity data
router.get('/insights/wallet-activity', verifyToken, async (req, res) => {
  try {
    const { timeframe = 'last_6_months' } = req.query;
    const userId = req.user.id;
    
    // Calculate date range based on timeframe
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'last_month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'last_3_months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'last_6_months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'last_year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all_time':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6);
    }
    
    // In a real implementation, query actual wallet transaction data
    // For now, generate sample data
    
    const months = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Generate wallet activity data for each month
    const activities = months.map((date, index) => {
      // Create realistic wallet activity data with increasing trend
      const baseDeposit = 2000 + (index * 300);
      const depositVariation = (Math.random() * 1000) - 500;
      const deposits = Math.max(0, baseDeposit + depositVariation);
      
      const baseWithdrawal = 1000 + (index * 100);
      const withdrawalVariation = (Math.random() * 500) - 250;
      const withdrawals = Math.max(0, baseWithdrawal + withdrawalVariation);
      
      const baseInvestment = 3000 + (index * 400);
      const investmentVariation = (Math.random() * 1500) - 750;
      const investments = Math.max(0, baseInvestment + investmentVariation);
      
      const transactionCount = Math.floor(3 + (Math.random() * 7));
      
      return {
        date: date.toISOString().split('T')[0],
        deposits: parseFloat(deposits.toFixed(2)),
        withdrawals: parseFloat(withdrawals.toFixed(2)),
        investments: parseFloat(investments.toFixed(2)),
        transactionCount
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        activities
      }
    });
  } catch (error) {
    console.error('Error fetching wallet activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet activity',
      error: error.message
    });
  }
});

// Get project participation data
router.get('/insights/project-participation', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In a real implementation, query actual investment data grouped by property
    // For now, generate sample data
    
    const sampleInvestments = [
      { name: 'Oakwood Residences', value: 15000, roi: 7.2, status: 'Active' },
      { name: 'Marina Heights', value: 25000, roi: 8.5, status: 'Active' },
      { name: 'Parkview Condos', value: 10000, roi: 6.8, status: 'Funded' },
      { name: 'City Center Plaza', value: 20000, roi: 7.8, status: 'Active' },
      { name: 'Riverside Development', value: 30000, roi: 9.1, status: 'Funded' }
    ];
    
    res.status(200).json({
      success: true,
      data: {
        investments: sampleInvestments
      }
    });
  } catch (error) {
    console.error('Error fetching project participation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project participation data',
      error: error.message
    });
  }
});

// Export investment data as CSV
router.get('/insights/export-csv', verifyToken, async (req, res) => {
  try {
    const { timeframe = 'last_6_months' } = req.query;
    const userId = req.user.id;
    
    // Calculate date range based on timeframe
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'last_month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'last_3_months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'last_6_months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'last_year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'all_time':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 6);
    }
    
    // In a real implementation, query actual investment data
    // For now, generate sample data similar to ROI history
    
    const months = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Generate investment data for each month
    const investmentData = months.map((date, index) => {
      const month = date.toISOString().split('T')[0].substring(0, 7);
      
      // Create somewhat realistic data
      const baseRoi = 6 + (index * 0.2);
      const randomVariation = (Math.random() * 1.5) - 0.75;
      const roi = baseRoi + randomVariation;
      
      const baseInvestment = 10000 + (index * 1000);
      const investmentVariation = (Math.random() * 2000) - 1000;
      const investmentAmount = baseInvestment + investmentVariation;
      
      const returnAmount = investmentAmount * (1 + (roi / 100));
      
      return {
        Date: date.toISOString().split('T')[0],
        Month: month,
        'Investment Amount': parseFloat(investmentAmount.toFixed(2)),
        'ROI (%)': parseFloat(roi.toFixed(2)),
        'Return Amount': parseFloat(returnAmount.toFixed(2)),
        'Net Profit': parseFloat((returnAmount - investmentAmount).toFixed(2))
      };
    });
    
    // Create CSV
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'Date', title: 'Date' },
        { id: 'Month', title: 'Month' },
        { id: 'Investment Amount', title: 'Investment Amount ($)' },
        { id: 'ROI (%)', title: 'ROI (%)' },
        { id: 'Return Amount', title: 'Return Amount ($)' },
        { id: 'Net Profit', title: 'Net Profit ($)' }
      ]
    });
    
    const csvHeader = csvStringifier.getHeaderString();
    const csvRows = csvStringifier.stringifyRecords(investmentData);
    const csvContent = csvHeader + csvRows;
    
    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="iREVA_Investment_Data_${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export CSV data',
      error: error.message
    });
  }
});

// Email investment report
router.post('/insights/email-report', verifyToken, async (req, res) => {
  try {
    const { email, format = 'pdf', timeframe = 'last_6_months' } = req.body;
    const userId = req.user.id;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }
    
    // In a real implementation, generate PDF or CSV and email it
    // For now, simulate sending an email
    
    // Log the report request
    console.log(`Investment report requested by user ${userId}:`, {
      email,
      format,
      timeframe
    });
    
    // Create a notification for the report request
    await NotificationService.createAndSend({
      userId,
      title: 'Investment Report Sent',
      message: `Your investment report has been sent to ${email} in ${format.toUpperCase()} format.`,
      type: 'system',
      data: {
        email,
        format,
        timeframe,
        date: new Date().toISOString()
      },
      channels: ['in-app'],
      priority: 'normal'
    });
    
    // In a real implementation with SendGrid or Nodemailer
    // For now, simulate successful email sending
    
    res.status(200).json({
      success: true,
      message: 'Investment report has been emailed successfully',
      data: {
        email,
        format,
        timeframe,
        sentAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error emailing report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to email investment report',
      error: error.message
    });
  }
});

// Schedule recurring reports
router.post('/insights/schedule-report', verifyToken, async (req, res) => {
  try {
    const { email, frequency = 'monthly', format = 'pdf', timeframe = 'last_month' } = req.body;
    const userId = req.user.id;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }
    
    if (!['weekly', 'monthly', 'quarterly'].includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid frequency. Must be weekly, monthly, or quarterly'
      });
    }
    
    // In a real implementation, save the report schedule to the database
    // For now, simulate scheduling a report
    
    // Calculate next report date based on frequency
    const nextReportDate = new Date();
    switch (frequency) {
      case 'weekly':
        nextReportDate.setDate(nextReportDate.getDate() + 7);
        break;
      case 'monthly':
        nextReportDate.setMonth(nextReportDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextReportDate.setMonth(nextReportDate.getMonth() + 3);
        break;
    }
    
    // Log the schedule request
    console.log(`Investment report scheduled by user ${userId}:`, {
      email,
      frequency,
      format,
      timeframe,
      nextReportDate
    });
    
    // Create a notification for the schedule creation
    await NotificationService.createAndSend({
      userId,
      title: 'Investment Report Scheduled',
      message: `Your ${frequency} investment reports have been scheduled and will be sent to ${email}.`,
      type: 'system',
      data: {
        email,
        frequency,
        format,
        timeframe,
        nextReportDate: nextReportDate.toISOString(),
        date: new Date().toISOString()
      },
      channels: ['in-app'],
      priority: 'normal'
    });
    
    res.status(200).json({
      success: true,
      message: 'Investment report has been scheduled successfully',
      data: {
        email,
        frequency,
        format,
        timeframe,
        nextReportDate: nextReportDate.toISOString(),
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error scheduling report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule investment report',
      error: error.message
    });
  }
});

// Get investment performance metrics 
router.get('/insights/performance-metrics', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // In a real implementation, calculate actual performance metrics
    // For now, generate sample metrics
    
    const metrics = {
      totalInvested: 100000,
      totalReturn: 118500,
      averageRoi: 7.8,
      annualizedReturn: 8.5,
      portfolioGrowth: 18.5,
      projectedAnnualReturn: 9.2,
      activeInvestments: 5,
      completedInvestments: 2,
      highestPerformingProperty: {
        name: 'Marina Heights',
        roi: 8.5
      },
      lowestPerformingProperty: {
        name: 'Parkview Condos',
        roi: 6.8
      }
    };
    
    res.status(200).json({
      success: true,
      data: {
        metrics
      }
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics',
      error: error.message
    });
  }
});

module.exports = router;