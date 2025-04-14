const User = require('../models/User');

// @desc    Get all KYC requests
// @route   GET /api/admin/kyc
// @access  Private/Admin
exports.getKYCRequests = async (req, res) => {
  try {
    const kycPendingUsers = await User.find({ isKYCApproved: false })
      .select('name email phone createdAt');
    
    res.json(kycPendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a KYC request
// @route   PUT /api/admin/kyc/:id/approve
// @access  Private/Admin
exports.approveKYC = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isKYCApproved = true;
    await user.save();
    
    res.json({ 
      message: 'KYC approved successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isKYCApproved: user.isKYCApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a KYC request
// @route   PUT /api/admin/kyc/:id/reject
// @access  Private/Admin
exports.rejectKYC = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // In a real application, you might want to update a status field 
    // to 'rejected' and store the rejection reason
    // For this example, we'll just return a success message
    
    res.json({ 
      message: 'KYC rejected successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rejectionReason
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};