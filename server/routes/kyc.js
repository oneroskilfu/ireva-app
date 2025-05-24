const express = require('express');
const { db } = require('../db');
const { users } = require('../../shared/schema');
const { eq } = require('drizzle-orm');
const { verifyToken } = require('../auth-jwt');

const router = express.Router();

/**
 * @route POST /api/kyc
 * @desc Submit KYC information
 * @access Private
 */
router.post('/', verifyToken, async (req, res) => {
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
});

/**
 * @route GET /api/kyc/status
 * @desc Get user's KYC status
 * @access Private
 */
router.get('/status', verifyToken, async (req, res) => {
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
});

/**
 * @route GET /api/kyc
 * @desc Get user's KYC details
 * @access Private
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        kycStatus: true,
        kycDocuments: true,
        kycSubmittedAt: true,
        kycVerifiedAt: true,
        kycRejectionReason: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.kycDocuments) {
      return res.json({
        id: user.id,
        status: user.kycStatus,
        submittedAt: user.kycSubmittedAt,
        verifiedAt: user.kycVerifiedAt,
        rejectionReason: user.kycRejectionReason
      });
    }

    res.json({
      id: user.id,
      status: user.kycStatus,
      submittedAt: user.kycSubmittedAt,
      verifiedAt: user.kycVerifiedAt,
      rejectionReason: user.kycRejectionReason,
      ...user.kycDocuments
    });
  } catch (error) {
    console.error('Get KYC details error:', error);
    res.status(500).json({ message: 'Server error getting KYC details' });
  }
});

module.exports = router;