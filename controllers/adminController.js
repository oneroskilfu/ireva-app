const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { comparePassword } = require('../utils/passwordUtils');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Auth admin user & get token
// @route   POST /api/admin/login
// @access  Public
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists and is admin
    if (!user || !user.isAdmin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isPasswordMatch = await comparePassword(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id)
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardData = async (req, res) => {
  try {
    const { getPlatformStatistics } = require('../utils/statisticsUtils');
    const statistics = await getPlatformStatistics();
    
    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user growth data
// @route   GET /api/admin/user-growth
// @access  Private/Admin
exports.getUserGrowth = async (req, res) => {
  try {
    const { getUserGrowthData } = require('../utils/statisticsUtils');
    const months = req.query.months ? parseInt(req.query.months) : 12;
    const userData = await getUserGrowthData(months);
    
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get investment trend data
// @route   GET /api/admin/investment-trends
// @access  Private/Admin
exports.getInvestmentTrends = async (req, res) => {
  try {
    const { getInvestmentTrendData } = require('../utils/statisticsUtils');
    const months = req.query.months ? parseInt(req.query.months) : 12;
    const investmentData = await getInvestmentTrendData(months);
    
    res.json(investmentData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};