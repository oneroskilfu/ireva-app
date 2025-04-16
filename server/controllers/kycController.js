const { db } = require('../db');
const { users } = require('../../shared/schema');
const { eq } = require('drizzle-orm');

/**
 * @desc    Submit KYC information
 * @route   POST /api/kyc
 * @access  Private
 */
const submitKYC = async (req, res) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { fullName, address, idNumber, idType, bankName, accountNumber } = req.body;

    // Validate input
    if (!fullName || !address || !idNumber || !idType || !bankName || !accountNumber) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (accountNumber.length < 10) {
      return res.status(400).json({ message: 'Account number must be at least 10 digits' });
    }

    // Create KYC document object
    const kycDocument = {
      idType,
      idNumber,
      fullName,
      bankName,
      accountNumber,
      address,
      // These fields would typically come from file uploads in a real system
      frontImage: "https://example.com/placeholder-id-front.jpg", // Replace with actual upload URL
      selfieImage: "https://example.com/placeholder-selfie.jpg", // Replace with actual upload URL
    };

    // Update user with KYC information
    const [updatedUser] = await db.update(users)
      .set({
        kycDocuments: kycDocument,
        kycStatus: "pending",
        kycSubmittedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        kycStatus: users.kycStatus
      });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create notification for admin
    // In a real system, you would have a notifications service/module
    /*
    await createNotification({
      userId: userId,
      type: "kyc",
      title: "New KYC Submission",
      message: `${fullName} has submitted KYC documents for verification.`,
      link: `/admin/kyc/${userId}`
    });
    */

    res.status(200).json({
      message: 'KYC submission successful',
      status: updatedUser.kycStatus
    });
  } catch (error) {
    console.error('KYC submission error:', error);
    res.status(500).json({ message: 'Server error during KYC submission' });
  }
};

/**
 * @desc    Get all KYC submissions (admin only)
 * @route   GET /api/kyc
 * @access  Admin
 */
const getAllKYC = async (req, res) => {
  try {
    const kycSubmissions = await db.query.users.findMany({
      where: (users) => 
        eq(users.kycStatus, "pending")
        .or(eq(users.kycStatus, "verified"))
        .or(eq(users.kycStatus, "rejected")),
      columns: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        kycStatus: true,
        kycDocuments: true,
        kycSubmittedAt: true,
        kycVerifiedAt: true,
        kycRejectionReason: true
      }
    });

    if (!kycSubmissions || kycSubmissions.length === 0) {
      return res.status(404).json({ message: 'No KYC submissions found' });
    }

    res.json(kycSubmissions);
  } catch (error) {
    console.error('Get all KYC error:', error);
    res.status(500).json({ message: 'Server error getting KYC submissions' });
  }
};

/**
 * @desc    Get user's own KYC status
 * @route   GET /api/kyc/status
 * @access  Private
 */
const getKYCStatus = async (req, res) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        kycStatus: true,
        kycSubmittedAt: true,
        kycVerifiedAt: true,
        kycRejectionReason: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      status: user.kycStatus,
      submittedAt: user.kycSubmittedAt,
      verifiedAt: user.kycVerifiedAt,
      rejectionReason: user.kycRejectionReason
    });
  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({ message: 'Server error getting KYC status' });
  }
};

/**
 * @desc    Admin verifies a user's KYC
 * @route   PATCH /api/kyc/:id/verify
 * @access  Admin
 */
const verifyKYC = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, rejectionReason } = req.body;

    if (approved === undefined) {
      return res.status(400).json({ message: 'Approval status is required' });
    }

    if (!approved && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required when rejecting KYC' });
    }

    const updateData = approved 
      ? { 
          kycStatus: "verified", 
          kycVerifiedAt: new Date(),
          kycRejectionReason: null
        }
      : { 
          kycStatus: "rejected", 
          kycRejectionReason: rejectionReason 
        };

    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        kycStatus: users.kycStatus
      });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create notification for user about KYC status
    /*
    await createNotification({
      userId: parseInt(id),
      type: "kyc",
      title: approved ? "KYC Verified" : "KYC Rejected",
      message: approved 
        ? "Your KYC verification has been approved. You can now invest in all eligible properties."
        : `Your KYC verification was not approved. Reason: ${rejectionReason}`,
      link: approved ? "/dashboard" : "/kyc"
    });
    */

    res.status(200).json({
      message: approved ? 'KYC verified successfully' : 'KYC rejected',
      user: updatedUser
    });
  } catch (error) {
    console.error('KYC verification error:', error);
    res.status(500).json({ message: 'Server error during KYC verification' });
  }
};

module.exports = {
  submitKYC,
  getAllKYC,
  getKYCStatus,
  verifyKYC
};