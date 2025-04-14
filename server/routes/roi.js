import express from 'express';
import jwt from 'jsonwebtoken';
import { ROI } from '../models/ROI.js';
import { Investment } from '../models/Investment.js';

const router = express.Router();

// Middleware to authenticate JWT token
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
  next();
};

// @route   GET /api/roi
// @desc    Get all ROI records (admin) or user ROI records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let roiRecords;
    
    // If admin, get all ROI records
    if (req.user.role === 'admin') {
      roiRecords = await ROI.find()
        .populate('investment', 'amount units status')
        .populate('user', 'username')
        .populate('property', 'name location type')
        .sort({ createdAt: -1 });
    } else {
      // Get only user's ROI records
      roiRecords = await ROI.find({ user: req.user.id })
        .populate('investment', 'amount units status')
        .populate('property', 'name location type images mainImage')
        .sort({ createdAt: -1 });
    }
    
    res.json(roiRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/roi/:id
// @desc    Get ROI record by ID
// @access  Private (owner or admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const roiRecord = await ROI.findById(req.params.id)
      .populate('investment', 'amount units status payouts')
      .populate('user', 'username')
      .populate('property', 'name location type images mainImage status investmentDetails')
      .populate('project', 'name developer timeline status');
    
    if (!roiRecord) {
      return res.status(404).json({ msg: 'ROI record not found' });
    }
    
    // Check if user is owner or admin
    if (roiRecord.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    res.json(roiRecord);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'ROI record not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/roi/investment/:investmentId
// @desc    Create a new ROI record for an investment
// @access  Admin only
router.post('/investment/:investmentId', auth, adminAuth, async (req, res) => {
  try {
    const {
      actualReturns,
      performanceMetrics
    } = req.body;
    
    // Find the investment
    const investment = await Investment.findById(req.params.investmentId)
      .populate('property', 'investmentDetails');
    
    if (!investment) {
      return res.status(404).json({ msg: 'Investment not found' });
    }
    
    // Check if ROI record already exists
    let roiRecord = await ROI.findOne({ investment: req.params.investmentId });
    
    if (roiRecord) {
      // Update existing ROI record
      if (actualReturns) {
        roiRecord.actualReturns = {
          ...roiRecord.actualReturns,
          ...actualReturns
        };
      }
      
      if (performanceMetrics) {
        roiRecord.performanceMetrics = {
          ...roiRecord.performanceMetrics,
          ...performanceMetrics
        };
      }
      
      roiRecord.lastCalculationDate = new Date();
      roiRecord.updatedAt = new Date();
      
      await roiRecord.save();
    } else {
      // Create new ROI record
      const expectedROIRate = investment.roi.expectedRate;
      
      // Calculate investment duration in years
      const investmentDuration = 
        (new Date(investment.maturityDate) - new Date(investment.investmentDate)) / (1000 * 60 * 60 * 24 * 365);
      
      // Calculate projected returns
      const totalReturn = investment.amount * (expectedROIRate / 100) * investmentDuration;
      const projectedAmount = investment.amount + totalReturn;
      
      roiRecord = new ROI({
        investment: investment._id,
        user: investment.user,
        property: investment.property,
        project: investment.project,
        initialInvestment: investment.amount,
        expectedROIRate,
        investmentDate: investment.investmentDate,
        maturityDate: investment.maturityDate,
        projectedReturns: {
          totalReturn,
          projectedAmount,
          annualizedReturnRate: expectedROIRate
        },
        actualReturns: actualReturns || {
          totalPaidOut: 0,
          currentValue: investment.amount,
          currentROIRate: 0
        },
        performanceMetrics: performanceMetrics || {},
        status: investment.status
      });
      
      await roiRecord.save();
    }
    
    res.json(roiRecord);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/roi/:id
// @desc    Update ROI record
// @access  Admin only
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const {
      actualReturns,
      performanceMetrics,
      status
    } = req.body;
    
    const roiRecord = await ROI.findById(req.params.id);
    
    if (!roiRecord) {
      return res.status(404).json({ msg: 'ROI record not found' });
    }
    
    // Update fields if provided
    if (actualReturns) {
      roiRecord.actualReturns = {
        ...roiRecord.actualReturns,
        ...actualReturns
      };
    }
    
    if (performanceMetrics) {
      roiRecord.performanceMetrics = {
        ...roiRecord.performanceMetrics,
        ...performanceMetrics
      };
    }
    
    if (status) {
      roiRecord.status = status;
    }
    
    roiRecord.lastCalculationDate = new Date();
    roiRecord.updatedAt = new Date();
    
    await roiRecord.save();
    
    res.json(roiRecord);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'ROI record not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/roi/property/:propertyId
// @desc    Get ROI records by property
// @access  Admin only
router.get('/property/:propertyId', auth, adminAuth, async (req, res) => {
  try {
    const roiRecords = await ROI.find({ property: req.params.propertyId })
      .populate('investment', 'amount units status')
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    
    res.json(roiRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/roi/user/:userId
// @desc    Get ROI records by user
// @access  Admin or owner
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Check if requesting user is admin or owner
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const roiRecords = await ROI.find({ user: req.params.userId })
      .populate('investment', 'amount units status')
      .populate('property', 'name location type images mainImage status investmentDetails')
      .sort({ createdAt: -1 });
    
    res.json(roiRecords);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/roi/calculate/:investmentId
// @desc    Calculate current ROI for an investment
// @access  Private (owner or admin)
router.get('/calculate/:investmentId', auth, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.investmentId);
    
    if (!investment) {
      return res.status(404).json({ msg: 'Investment not found' });
    }
    
    // Check if user is owner or admin
    if (investment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    // Calculate time elapsed since investment (in years)
    const now = new Date();
    const investmentDate = new Date(investment.investmentDate);
    const timeElapsed = (now - investmentDate) / (1000 * 60 * 60 * 24 * 365);
    
    // Calculate expected returns based on elapsed time
    const expectedRate = investment.roi.expectedRate;
    const expectedReturn = investment.amount * (expectedRate / 100) * timeElapsed;
    
    // Calculate total paid out
    const totalPaidOut = investment.payouts.reduce((total, payout) => {
      if (payout.status === 'Processed') {
        return total + payout.amount;
      }
      return total;
    }, 0);
    
    // Calculate current value
    const currentValue = investment.amount + expectedReturn - totalPaidOut;
    
    // Calculate current ROI rate
    const currentROIRate = timeElapsed > 0 ? 
      ((currentValue - investment.amount) / investment.amount) * (1 / timeElapsed) * 100 : 
      0;
    
    const roiCalculation = {
      investment: investment._id,
      initialInvestment: investment.amount,
      expectedROIRate: expectedRate,
      timeElapsed,
      expectedReturn,
      totalPaidOut,
      currentValue,
      currentROIRate
    };
    
    res.json(roiCalculation);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Investment not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

export default router;