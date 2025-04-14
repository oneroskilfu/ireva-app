const Investment = require('../models/Investment');
const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Get all investments
// @route   GET /api/investments
// @access  Private/Admin
exports.getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate('user', 'name email')
      .populate({
        path: 'project',
        select: 'name targetReturn',
        populate: {
          path: 'property',
          select: 'name location type'
        }
      });
    
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get investment by ID
// @route   GET /api/investments/:id
// @access  Private/Admin
exports.getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'project',
        populate: {
          path: 'property',
          select: 'name location type'
        }
      });
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new investment
// @route   POST /api/investments
// @access  Private/Admin
exports.createInvestment = async (req, res) => {
  try {
    const { userId, projectId, amount } = req.body;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    
    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(400).json({ message: 'Project not found' });
    }
    
    // Check if amount is less than minimum investment
    if (amount < project.minInvestment) {
      return res.status(400).json({
        message: `Investment amount must be at least ₦${project.minInvestment.toLocaleString()}`
      });
    }
    
    // Calculate maturity date (5 years from now)
    const maturityDate = new Date();
    maturityDate.setFullYear(maturityDate.getFullYear() + 5);
    
    const investment = new Investment({
      user: userId,
      project: projectId,
      amount,
      maturityDate,
      status: 'active'
    });
    
    const newInvestment = await investment.save();
    
    // Update project's current funding
    project.currentFunding += amount;
    await project.save();
    
    res.status(201).json(newInvestment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update investment status
// @route   PUT /api/investments/:id
// @access  Private/Admin
exports.updateInvestmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const investment = await Investment.findById(req.params.id);
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    investment.status = status;
    
    // If completing the investment, update current value using project target return
    if (status === 'completed') {
      const project = await Project.findById(investment.project);
      
      if (project) {
        const annualReturn = project.targetReturn / 100;
        const investmentStartDate = new Date(investment.investmentDate);
        const completionDate = new Date();
        
        // Calculate years between investment date and now
        const yearsActive = (completionDate - investmentStartDate) / (1000 * 60 * 60 * 24 * 365);
        
        // Calculate final value based on compound interest
        const finalValue = investment.amount * Math.pow(1 + annualReturn, yearsActive);
        
        investment.currentValue = finalValue;
        investment.earnings = finalValue - investment.amount;
      }
    }
    
    const updatedInvestment = await investment.save();
    
    res.json(updatedInvestment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};