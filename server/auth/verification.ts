import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { randomBytes } from "crypto";
import { z } from "zod";
import { phoneVerificationSchema, kycDocumentSchema } from "@shared/schema";

// In-memory OTP storage for demo purposes
// In production, these would be stored in Redis or a similar database with expiration
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export function setupVerificationRoutes(app: Express) {
  // Get verification status
  app.get("/api/auth/verification-status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({
        isPhoneVerified: user.isPhoneVerified || false,
        kycStatus: user.kycStatus || "not_started",
        kycSubmittedAt: user.kycSubmittedAt,
        kycVerifiedAt: user.kycVerifiedAt,
      });
    } catch (error) {
      console.error("Error fetching verification status:", error);
      return res.status(500).json({ error: "Failed to fetch verification status" });
    }
  });

  // Request OTP for phone verification
  app.post("/api/auth/request-otp", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: "Phone number is required" });
      }
      
      // Generate a random 6-digit OTP
      const otp = randomBytes(3).toString("hex").substring(0, 6);
      
      // Store the OTP with 10-minute expiration
      otpStore.set(phoneNumber, {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      });
      
      // In production, you would send this via SMS
      console.log(`OTP for ${phoneNumber}: ${otp}`);
      
      // Update the user's phone number (but not verified status yet)
      await storage.updateUserPhone(req.user.id, phoneNumber, false);
      
      return res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error requesting OTP:", error);
      return res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const validationResult = phoneVerificationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationResult.error.format()
        });
      }
      
      const { phoneNumber, code } = validationResult.data;
      
      // Check if OTP exists and hasn't expired
      const otpData = otpStore.get(phoneNumber);
      
      if (!otpData) {
        return res.status(400).json({ error: "No verification code was requested for this number" });
      }
      
      if (Date.now() > otpData.expiresAt) {
        otpStore.delete(phoneNumber);
        return res.status(400).json({ error: "Verification code has expired" });
      }
      
      if (otpData.otp !== code) {
        return res.status(400).json({ error: "Invalid verification code" });
      }
      
      // OTP is valid, update the user's verified status
      await storage.updateUserPhone(req.user.id, phoneNumber, true);
      
      // Clean up the OTP
      otpStore.delete(phoneNumber);
      
      return res.json({ success: true, message: "Phone verified successfully" });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  // Submit KYC documents
  app.post("/api/auth/submit-kyc", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.isPhoneVerified) {
        return res.status(400).json({ error: "Phone verification is required before KYC submission" });
      }

      const validationResult = kycDocumentSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid KYC document data", 
          details: validationResult.error.format()
        });
      }

      const kycData = validationResult.data;
      
      // Update the user's KYC status
      await storage.updateUserKyc(
        req.user.id,
        "pending",
        kycData,
        new Date()
      );
      
      return res.json({ 
        success: true, 
        message: "KYC documents submitted successfully and are pending review"
      });
    } catch (error) {
      console.error("Error submitting KYC:", error);
      return res.status(500).json({ error: "Failed to submit KYC documents" });
    }
  });

  // Admin route to approve or reject KYC (would require admin authentication in production)
  app.post("/api/admin/review-kyc", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // In production, this would check for admin role
    // if (!req.user.isAdmin) {
    //   return res.status(403).json({ error: "Admin permission required" });
    // }

    try {
      const { userId, status, rejectionReason } = req.body;
      
      if (!userId || !status) {
        return res.status(400).json({ error: "User ID and status are required" });
      }
      
      if (!["verified", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'verified' or 'rejected'" });
      }
      
      if (status === "rejected" && !rejectionReason) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }
      
      // Update the user's KYC status
      await storage.updateUserKycStatus(
        userId,
        status,
        status === "rejected" ? rejectionReason : undefined,
        status === "verified" ? new Date() : undefined
      );
      
      return res.json({ 
        success: true, 
        message: `KYC ${status === "verified" ? "approved" : "rejected"} successfully`
      });
    } catch (error) {
      console.error("Error reviewing KYC:", error);
      return res.status(500).json({ error: "Failed to review KYC documents" });
    }
  });
}