const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const Investment = require('../models/Investment');
const ROI = require('../models/ROI');

/**
 * @route GET /api/investments/roi
 * @desc Get ROI data for authenticated user
 * @access Private
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { timeframe = '1y' } = req.query;
    const userId = req.user.user.id;
    
    // Define date range based on timeframe
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setFullYear(now.getFullYear() - 1); // Default to 1 year
    }
    
    // Get ROI records for the user within the timeframe
    const roiRecords = await ROI.find({
      userId,
      date: { $gte: startDate, $lte: now }
    }).sort({ date: 1 });
    
    // If no records found, try to calculate from investments
    if (roiRecords.length === 0) {
      const investments = await Investment.find({ 
        userId,
        createdAt: { $gte: startDate, $lte: now }
      }).sort({ createdAt: 1 });
      
      // If no investments found, return empty array
      if (investments.length === 0) {
        return res.json([]);
      }
      
      // Calculate monthly ROI from investments
      const monthlyData = {};
      
      investments.forEach(investment => {
        const date = new Date(investment.createdAt);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            totalInvestment: 0,
            totalReturns: 0
          };
        }
        
        monthlyData[monthYear].totalInvestment += investment.amount;
        monthlyData[monthYear].totalReturns += investment.expectedReturns || 0;
      });
      
      // Convert monthly data to array format
      const roiData = Object.keys(monthlyData).map(date => {
        const data = monthlyData[date];
        const roi = (data.totalReturns / data.totalInvestment) * 100;
        
        return {
          date,
          roi: parseFloat(roi.toFixed(2)),
          investment: data.totalInvestment,
          returns: data.totalReturns,
          // Add projected ROI (this is just an example)
          projectedRoi: parseFloat((roi * 1.1).toFixed(2))
        };
      });
      
      return res.json(roiData);
    }
    
    // Format ROI records for response
    const formattedData = roiRecords.map(record => {
      const date = new Date(record.date);
      return {
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        roi: parseFloat(record.roi.toFixed(2)),
        projectedRoi: record.projectedRoi ? parseFloat(record.projectedRoi.toFixed(2)) : null,
        investment: record.investment || null,
        returns: record.returns || null
      };
    });
    
    res.json(formattedData);
  } catch (err) {
    console.error('Error fetching ROI data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/investments/roi
 * @desc Add new ROI record (for admin)
 * @access Private - Admin only
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const { userId, date, roi, projectedRoi, investment, returns } = req.body;
    
    // Create new ROI record
    const newROI = new ROI({
      userId,
      date: new Date(date),
      roi,
      projectedRoi,
      investment,
      returns
    });
    
    await newROI.save();
    res.status(201).json(newROI);
  } catch (err) {
    console.error('Error creating ROI record:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/investments/roi/:id
 * @desc Update ROI record (for admin)
 * @access Private - Admin only
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const { date, roi, projectedRoi, investment, returns } = req.body;
    
    const roiRecord = await ROI.findById(req.params.id);
    if (!roiRecord) {
      return res.status(404).json({ message: 'ROI record not found' });
    }
    
    // Update ROI record
    roiRecord.date = date ? new Date(date) : roiRecord.date;
    roiRecord.roi = roi !== undefined ? roi : roiRecord.roi;
    roiRecord.projectedRoi = projectedRoi !== undefined ? projectedRoi : roiRecord.projectedRoi;
    roiRecord.investment = investment !== undefined ? investment : roiRecord.investment;
    roiRecord.returns = returns !== undefined ? returns : roiRecord.returns;
    
    await roiRecord.save();
    res.json(roiRecord);
  } catch (err) {
    console.error('Error updating ROI record:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/investments/roi/:id
 * @desc Delete ROI record (for admin)
 * @access Private - Admin only
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const roiRecord = await ROI.findById(req.params.id);
    if (!roiRecord) {
      return res.status(404).json({ message: 'ROI record not found' });
    }
    
    await roiRecord.remove();
    res.json({ message: 'ROI record deleted' });
  } catch (err) {
    console.error('Error deleting ROI record:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;