const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Investment = require('../models/Investment');
const Property = require('../models/Property');

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

// @route   GET /api/investments
// @desc    Get all investments (admin) or user investments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let investments;
    
    // If admin, get all investments
    if (req.user.role === 'admin') {
      investments = await Investment.find()
        .populate('user', 'username')
        .populate('property', 'name location type')
        .sort({ investmentDate: -1 });
    } else {
      // Get only user's investments
      investments = await Investment.find({ user: req.user.id })
        .populate('property', 'name location type images mainImage status investmentDetails')
        .sort({ investmentDate: -1 });
    }
    
    res.json(investments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/investments/:id
// @desc    Get investment by ID
// @access  Private (owner or admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate('user', 'username')
      .populate('property', 'name location type images mainImage status investmentDetails')
      .populate('project', 'name developer timeline status');
    
    if (!investment) {
      return res.status(404).json({ msg: 'Investment not found' });
    }
    
    // Check if user is owner or admin
    if (investment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    res.json(investment);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Investment not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/investments
// @desc    Create a new investment
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      propertyId,
      amount,
      paymentDetails,
      units,
      reinvestment
    } = req.body;
    
    // Validate input
    if (!propertyId || !amount || !paymentDetails || !paymentDetails.method) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }
    
    // Check if property exists
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    // Validate minimum investment
    if (amount < property.investmentDetails.minimumInvestment) {
      return res.status(400).json({ 
        msg: `Minimum investment amount is ₦${property.investmentDetails.minimumInvestment}` 
      });
    }
    
    // Create maturity date based on property investment duration (default 5 years)
    const duration = property.investmentDetails.duration || 5;
    const maturityDate = new Date();
    maturityDate.setFullYear(maturityDate.getFullYear() + duration);
    
    // Create new investment
    const newInvestment = new Investment({
      user: req.user.id,
      property: propertyId,
      project: property.projectId,
      amount,
      units: units || 1,
      paymentDetails: {
        ...paymentDetails,
        date: new Date()
      },
      investmentDate: new Date(),
      maturityDate,
      roi: {
        expectedRate: property.investmentDetails.expectedROI,
        payoutSchedule: property.investmentDetails.payoutFrequency || 'Quarterly'
      },
      status: 'Pending',
      reinvestment: reinvestment || { isAutoReinvest: false, reinvestmentPercentage: 100 }
    });
    
    const investment = await newInvestment.save();
    
    // Update property funding if payment is completed
    if (paymentDetails.status === 'Completed') {
      property.investmentDetails.amountRaised += amount;
      await property.save();
    }
    
    res.json(investment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/investments/:id
// @desc    Update investment status
// @access  Admin only
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    
    const investment = await Investment.findById(req.params.id);
    
    if (!investment) {
      return res.status(404).json({ msg: 'Investment not found' });
    }
    
    // Update investment status if provided
    if (status) {
      investment.status = status;
    }
    
    // Update payment status if provided
    if (paymentStatus) {
      investment.paymentDetails.status = paymentStatus;
      
      // If payment is now completed, update property funding
      if (paymentStatus === 'Completed' && investment.paymentDetails.status !== 'Completed') {
        const property = await Property.findById(investment.property);
        
        if (property) {
          property.investmentDetails.amountRaised += investment.amount;
          await property.save();
        }
      }
    }
    
    await investment.save();
    
    res.json(investment);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Investment not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/investments/:id/payout
// @desc    Record a payout for an investment
// @access  Admin only
router.post('/:id/payout', auth, adminAuth, async (req, res) => {
  try {
    const { amount, reference } = req.body;
    
    if (!amount) {
      return res.status(400).json({ msg: 'Payout amount is required' });
    }
    
    const investment = await Investment.findById(req.params.id);
    
    if (!investment) {
      return res.status(404).json({ msg: 'Investment not found' });
    }
    
    // Create new payout
    const newPayout = {
      amount,
      date: new Date(),
      status: 'Processed',
      reference: reference || `PAY-${Date.now()}`
    };
    
    investment.payouts.push(newPayout);
    
    // Update next payout date
    const payoutFrequency = investment.roi.payoutSchedule;
    const nextPayoutDate = new Date();
    
    switch (payoutFrequency) {
      case 'Monthly':
        nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
        break;
      case 'Quarterly':
        nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 3);
        break;
      case 'Annually':
        nextPayoutDate.setFullYear(nextPayoutDate.getFullYear() + 1);
        break;
      default:
        // Default to quarterly
        nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 3);
    }
    
    investment.roi.nextPayoutDate = nextPayoutDate;
    
    await investment.save();
    
    res.json(investment);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Investment not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/investments/property/:propertyId
// @desc    Get investments by property
// @access  Admin only
router.get('/property/:propertyId', auth, adminAuth, async (req, res) => {
  try {
    const investments = await Investment.find({ property: req.params.propertyId })
      .populate('user', 'username')
      .sort({ investmentDate: -1 });
    
    res.json(investments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/investments/user/:userId
// @desc    Get investments by user
// @access  Admin or owner
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Check if requesting user is admin or owner
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    const investments = await Investment.find({ user: req.params.userId })
      .populate('property', 'name location type images mainImage status investmentDetails')
      .sort({ investmentDate: -1 });
    
    res.json(investments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;