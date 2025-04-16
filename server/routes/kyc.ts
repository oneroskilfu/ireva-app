import express from 'express';
import { db } from '../db';
import { kycSubmissions, users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../auth-jwt';

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

    // Create KYC submission
    const [submission] = await db.insert(kycSubmissions)
      .values({
        userId,
        fullName,
        idType,
        idNumber,
        bankName,
        accountNumber,
        address,
        frontImage: "https://example.com/placeholder-id-front.jpg", // Replace with actual upload URL
        selfieImage: "https://example.com/placeholder-selfie.jpg", // Replace with actual upload URL
      })
      .returning();

    // Update user's KYC status
    await db.update(users)
      .set({
        kycStatus: "pending",
        kycSubmittedAt: new Date()
      })
      .where(eq(users.id, userId));

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

    res.status(201).json({
      message: 'KYC submission successful',
      status: 'pending',
      submission
    });
  } catch (error) {
    console.error('KYC submission error:', error);
    res.status(500).json({ message: 'Server error during KYC submission' });
  }
});

/**
 * @route GET /api/kyc
 * @desc Get all KYC submissions (admin only)
 * @access Admin
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const userId = req.jwtPayload?.id;
    const userRole = req.jwtPayload?.role;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({ message: "Forbidden. Admin access required." });
    }

    const submissions = await db.query.kycSubmissions.findMany();

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: 'No KYC submissions found' });
    }

    // Get user details for each submission
    const submissionsWithUserDetails = await Promise.all(
      submissions.map(async (submission) => {
        const [user] = await db
          .select({
            id: users.id,
            username: users.username,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, submission.userId));

        return {
          ...submission,
          user,
        };
      })
    );

    res.json(submissionsWithUserDetails);
  } catch (error) {
    console.error('Get KYC submissions error:', error);
    res.status(500).json({ message: 'Server error getting KYC submissions' });
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

    // Get the latest KYC submission
    const [submission] = await db.select()
      .from(kycSubmissions)
      .where(eq(kycSubmissions.userId, userId))
      .limit(1);

    res.json({
      status: user.kycStatus,
      submittedAt: user.kycSubmittedAt,
      verifiedAt: user.kycVerifiedAt,
      rejectionReason: user.kycRejectionReason,
      submission: submission || null
    });
  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({ message: 'Server error getting KYC status' });
  }
});

/**
 * @route PATCH /api/kyc/:id/verify
 * @desc Admin verifies or rejects a KYC submission
 * @access Admin
 */
router.patch('/:id/verify', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    const userId = req.jwtPayload?.id;
    const userRole = req.jwtPayload?.role;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      return res.status(403).json({ message: "Forbidden. Admin access required." });
    }

    const submissionId = parseInt(req.params.id);
    const { approved, rejectionReason } = req.body;

    // Validate input
    if (approved === undefined) {
      return res.status(400).json({ message: 'Approval decision is required' });
    }

    if (!approved && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required when rejecting KYC' });
    }

    // Get the submission
    const [submission] = await db.select()
      .from(kycSubmissions)
      .where(eq(kycSubmissions.id, submissionId));

    if (!submission) {
      return res.status(404).json({ message: 'KYC submission not found' });
    }

    // Update submission status
    const status = approved ? 'verified' : 'rejected';
    const [updatedSubmission] = await db.update(kycSubmissions)
      .set({
        status,
        rejectionReason: approved ? null : rejectionReason,
        verifiedAt: approved ? new Date() : null,
        verifiedBy: approved ? userId : null
      })
      .where(eq(kycSubmissions.id, submissionId))
      .returning();

    // Update user's KYC status
    await db.update(users)
      .set({
        kycStatus: status,
        kycVerifiedAt: approved ? new Date() : null,
        kycRejectionReason: approved ? null : rejectionReason
      })
      .where(eq(users.id, submission.userId));

    // Create notification for the user
    /*
    await createNotification({
      userId: submission.userId,
      type: "kyc",
      title: approved ? "KYC Verified" : "KYC Rejected",
      message: approved 
        ? "Your KYC verification has been approved. You can now invest in all eligible properties."
        : `Your KYC verification was not approved. Reason: ${rejectionReason}`,
      link: "/dashboard"
    });
    */

    res.json({
      message: approved ? 'KYC verified successfully' : 'KYC rejected',
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('KYC verification error:', error);
    res.status(500).json({ message: 'Server error during KYC verification' });
  }
});

export default router;