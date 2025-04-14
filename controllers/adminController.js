const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
    
    // In a real app, you'd validate the password here
    // This is simplified for the admin dashboard prototype
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: true,
      token: generateToken(user._id)
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardData = async (req, res) => {
  try {
    // Get count of users
    const userCount = await User.countDocuments();
    
    // Get users with KYC status
    const kycApproved = await User.countDocuments({ isKYCApproved: true });
    
    // Response with dashboard data
    res.json({
      userCount,
      kycApproved,
      kycPending: userCount - kycApproved,
      kycApprovalRate: userCount > 0 ? (kycApproved / userCount) * 100 : 0
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};