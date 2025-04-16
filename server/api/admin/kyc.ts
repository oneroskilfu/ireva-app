import { Router } from "express";
import { db } from "../../db";
import { kycSubmissions, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

// Middleware to ensure admin access
const ensureAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

// Get KYC submissions by status
router.get("/:status", ensureAdmin, async (req, res) => {
  try {
    const status = req.params.status;
    const validStatuses = ['pending', 'verified', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status parameter" });
    }
    
    // Get KYC submissions with user details
    const submissions = await db.select({
      id: kycSubmissions.id,
      userId: kycSubmissions.userId,
      fullName: kycSubmissions.fullName,
      idType: kycSubmissions.idType,
      idNumber: kycSubmissions.idNumber,
      bankName: kycSubmissions.bankName,
      accountNumber: kycSubmissions.accountNumber,
      address: kycSubmissions.address,
      frontImage: kycSubmissions.frontImage,
      backImage: kycSubmissions.backImage,
      selfieImage: kycSubmissions.selfieImage,
      addressProofImage: kycSubmissions.addressProofImage,
      addressProofType: kycSubmissions.addressProofType,
      status: kycSubmissions.status,
      rejectionReason: kycSubmissions.rejectionReason,
      submittedAt: kycSubmissions.submittedAt,
      verifiedAt: kycSubmissions.verifiedAt,
      verifiedBy: kycSubmissions.verifiedBy,
      user: {
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImage: users.profileImage
      }
    })
    .from(kycSubmissions)
    .leftJoin(users, eq(kycSubmissions.userId, users.id))
    .where(eq(kycSubmissions.status, status))
    .orderBy(desc(kycSubmissions.submittedAt));
    
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching KYC submissions:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify or reject KYC submission
router.patch("/:id/verify", ensureAdmin, async (req, res) => {
  try {
    const kycId = parseInt(req.params.id);
    const { status, rejectionReason } = req.body;
    
    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }
    
    // First update the KYC submission
    const [updatedSubmission] = await db.update(kycSubmissions)
      .set({
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        verifiedAt: new Date(),
        verifiedBy: req.user.id
      })
      .where(eq(kycSubmissions.id, kycId))
      .returning();
    
    if (!updatedSubmission) {
      return res.status(404).json({ error: "KYC submission not found" });
    }
    
    // Then update the user's KYC status
    await db.update(users)
      .set({
        kycStatus: status,
        kycVerifiedAt: new Date(),
        kycRejectionReason: status === 'rejected' ? rejectionReason : null
      })
      .where(eq(users.id, updatedSubmission.userId));
    
    res.json(updatedSubmission);
  } catch (error) {
    console.error("Error updating KYC submission:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;