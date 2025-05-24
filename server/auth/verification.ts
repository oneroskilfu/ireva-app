import { Express } from "express";
import { storage } from "../storage";
import { PhoneVerification, KycDocument } from "@shared/schema";
import { ZodError } from "zod";

// Mock OTP storage (should be replaced with a real SMS gateway in production)
const otpStore = new Map<string, string>();

export function setupVerificationRoutes(app: Express) {
  // Get user verification status
  app.get("/api/auth/verification-status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        isPhoneVerified: user.isPhoneVerified || false,
        kycStatus: user.kycStatus || "not_started",
        kycSubmittedAt: user.kycSubmittedAt,
        kycVerifiedAt: user.kycVerifiedAt
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch verification status" });
    }
  });

  // Request OTP for phone verification
  app.post("/api/auth/request-otp", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }

      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP (in production, this would send an SMS)
      otpStore.set(phoneNumber, otp);
      
      // For demo purposes, we'll log the OTP
      console.log(`OTP for ${phoneNumber}: ${otp}`);
      
      // Create a notification for the OTP
      await storage.createNotification({
        userId: req.user!.id,
        type: "system",
        title: "Verification Code",
        message: `Your verification code is: ${otp}`,
      });

      res.json({ success: true, message: "OTP has been sent to your phone" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Verify OTP and update phone verification status
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user!.id;
      
      // Validate request body
      const data = req.body as PhoneVerification;
      if (!data.phoneNumber || !data.code) {
        return res.status(400).json({ error: "Phone number and verification code are required" });
      }

      // Verify OTP
      const storedOtp = otpStore.get(data.phoneNumber);
      if (!storedOtp || storedOtp !== data.code) {
        return res.status(400).json({ error: "Invalid verification code" });
      }

      // Clear OTP after successful verification
      otpStore.delete(data.phoneNumber);

      // Update user's phone verification status
      const updatedUser = await storage.updateUserPhone(userId, data.phoneNumber, true);
      
      // Create a notification
      await storage.createNotification({
        userId,
        type: "system",
        title: "Phone Verified",
        message: "Your phone number has been successfully verified.",
      });

      res.json({ 
        success: true, 
        message: "Phone successfully verified",
        user: {
          id: updatedUser.id,
          isPhoneVerified: updatedUser.isPhoneVerified
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify phone" });
    }
  });

  // Submit KYC documents
  app.post("/api/auth/submit-kyc", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userId = req.user!.id;
      
      // Validate KYC documents
      try {
        const kycData = req.body as KycDocument;
        
        // In a real implementation, you would validate and store the documents
        // and potentially integrate with a KYC provider
        
        // Update user's KYC status
        const updatedUser = await storage.updateUserKyc(
          userId,
          "pending",
          kycData,
          new Date()
        );
        
        // Create a notification
        await storage.createNotification({
          userId,
          type: "kyc",
          title: "KYC Documents Submitted",
          message: "Your verification documents have been submitted for review.",
        });

        res.json({ 
          success: true, 
          message: "KYC documents submitted successfully",
          user: {
            id: updatedUser.id,
            kycStatus: updatedUser.kycStatus
          }
        });
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({ error: "Invalid KYC data", details: error.errors });
        }
        throw error;
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to submit KYC documents" });
    }
  });

  // Admin route to update KYC status (in a real app, this would be protected by admin auth)
  app.patch("/api/auth/admin/kyc-status/:userId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // In a real implementation, check if user is an admin
      // For now, we'll allow any authenticated user for demo purposes
      
      const targetUserId = parseInt(req.params.userId);
      const { status, rejectionReason } = req.body;
      
      if (!["pending", "verified", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid KYC status" });
      }
      
      // Update KYC status
      const verifiedAt = status === "verified" ? new Date() : null;
      const updatedUser = await storage.updateUserKycStatus(
        targetUserId,
        status,
        status === "rejected" ? rejectionReason : null,
        verifiedAt
      );
      
      // Create a notification for the user
      let notificationTitle = "";
      let notificationMessage = "";
      
      if (status === "verified") {
        notificationTitle = "KYC Verification Approved";
        notificationMessage = "Your identity has been verified successfully. You now have full access to the platform.";
      } else if (status === "rejected") {
        notificationTitle = "KYC Verification Rejected";
        notificationMessage = rejectionReason 
          ? `Your verification was rejected: ${rejectionReason}`
          : "Your verification was rejected. Please contact support for assistance.";
      }
      
      if (notificationTitle) {
        await storage.createNotification({
          userId: targetUserId,
          type: "kyc",
          title: notificationTitle,
          message: notificationMessage,
        });
      }

      res.json({ 
        success: true, 
        message: `KYC status updated to ${status}`,
        user: {
          id: updatedUser.id,
          kycStatus: updatedUser.kycStatus
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update KYC status" });
    }
  });
}