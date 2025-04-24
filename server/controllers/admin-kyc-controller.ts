import { Request, Response } from 'express';
import { db } from '../db';
import { kycSubmissions, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { kycAmlService } from '../services/kyc-aml-service';

/**
 * Controller for KYC administration
 */
export const adminKycController = {
  /**
   * Get all KYC submissions with enhanced details
   */
  getAllSubmissions: async (req: Request, res: Response) => {
    try {
      // Get all KYC submissions
      const submissions = await db
        .select()
        .from(kycSubmissions)
        .orderBy(kycSubmissions.submittedAt);

      // Enhance submissions with risk scores
      const enhancedSubmissions = await Promise.all(
        submissions.map(async (submission) => {
          try {
            const riskScore = await kycAmlService.calculateRiskScore(submission.userId);
            return {
              ...submission,
              riskScore: riskScore.score,
              riskLevel: riskScore.riskLevel,
              riskFactors: riskScore.factors,
            };
          } catch (error) {
            console.error(`Error calculating risk score for user ${submission.userId}:`, error);
            return {
              ...submission,
              riskScore: 0,
              riskLevel: 'unknown' as any,
              riskFactors: ['Error calculating risk score'],
            };
          }
        })
      );

      res.status(200).json(enhancedSubmissions);
    } catch (error) {
      console.error('Error getting KYC submissions:', error);
      res.status(500).json({
        message: 'Failed to get KYC submissions',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  /**
   * Get a single KYC submission with enhanced verification details
   */
  getSubmission: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Get the KYC submission
      const [submission] = await db
        .select()
        .from(kycSubmissions)
        .where(eq(kycSubmissions.id, parseInt(id)));

      if (!submission) {
        return res.status(404).json({ message: 'KYC submission not found' });
      }

      // Get enhanced verification details
      const riskScore = await kycAmlService.calculateRiskScore(submission.userId);
      const amlScreening = await kycAmlService.performAmlScreening(submission.userId);
      const documentVerification = await kycAmlService.verifyDocuments(submission.userId);

      // Combine all verification details
      const enhancedSubmission = {
        ...submission,
        verification: {
          riskScore: riskScore.score,
          riskLevel: riskScore.riskLevel,
          riskFactors: riskScore.factors,
          amlStatus: amlScreening.status,
          amlMatches: amlScreening.matches,
          documentsVerified: documentVerification.verified,
          documentStatus: documentVerification.status,
          documentIssues: documentVerification.issues,
        },
      };

      res.status(200).json(enhancedSubmission);
    } catch (error) {
      console.error('Error getting KYC submission:', error);
      res.status(500).json({
        message: 'Failed to get KYC submission',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  /**
   * Verify a KYC submission with full verification process
   */
  verifySubmission: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      // Get the KYC submission
      const [submission] = await db
        .select()
        .from(kycSubmissions)
        .where(eq(kycSubmissions.id, parseInt(id)));

      if (!submission) {
        return res.status(404).json({ message: 'KYC submission not found' });
      }

      // Perform full verification check
      const verificationResult = await kycAmlService.performFullVerification(submission.userId);
      
      // Admin can override the automated verification
      const finalStatus = status || verificationResult.status;
      const finalNotes = notes ? 
        [...verificationResult.notes, `Admin notes: ${notes}`] : 
        verificationResult.notes;
      
      const approved = finalStatus === 'approved';
      
      // Update the KYC submission
      const [updatedSubmission] = await db
        .update(kycSubmissions)
        .set({
          status: finalStatus,
          verifiedAt: approved ? new Date() : null,
          rejectionReason: approved ? null : finalNotes.join('; '),
          notes: finalNotes.join('; '),
          riskLevel: verificationResult.riskLevel,
        })
        .where(eq(kycSubmissions.id, parseInt(id)))
        .returning();

      // Update the user's KYC status
      await db
        .update(users)
        .set({
          kycStatus: finalStatus === 'approved' ? 
            'verified' : 
            (finalStatus === 'rejected' ? 'rejected' : 'pending'),
          kycVerifiedAt: finalStatus === 'approved' ? new Date() : null,
          kycRejectionReason: finalStatus === 'approved' ? 
            null : 
            finalNotes.join('; '),
        })
        .where(eq(users.id, submission.userId));

      res.status(200).json(updatedSubmission);
    } catch (error) {
      console.error('Error verifying KYC submission:', error);
      res.status(500).json({
        message: 'Failed to verify KYC submission',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Get KYC verification statistics
   */
  getKycStats: async (req: Request, res: Response) => {
    try {
      // Get counts of submissions by status
      const pendingCount = await db
        .select({ count: db.fn.count() })
        .from(kycSubmissions)
        .where(eq(kycSubmissions.status, 'pending'));
        
      const approvedCount = await db
        .select({ count: db.fn.count() })
        .from(kycSubmissions)
        .where(eq(kycSubmissions.status, 'approved'));
        
      const rejectedCount = await db
        .select({ count: db.fn.count() })
        .from(kycSubmissions)
        .where(eq(kycSubmissions.status, 'rejected'));
        
      const reviewCount = await db
        .select({ count: db.fn.count() })
        .from(kycSubmissions)
        .where(eq(kycSubmissions.status, 'review_required'));
      
      // Get counts by risk level
      const highRiskCount = await db
        .select({ count: db.fn.count() })
        .from(kycSubmissions)
        .where(eq(kycSubmissions.riskLevel, 'high'));
        
      const mediumRiskCount = await db
        .select({ count: db.fn.count() })
        .from(kycSubmissions)
        .where(eq(kycSubmissions.riskLevel, 'medium'));
        
      const lowRiskCount = await db
        .select({ count: db.fn.count() })
        .from(kycSubmissions)
        .where(eq(kycSubmissions.riskLevel, 'low'));
      
      res.status(200).json({
        status: {
          pending: pendingCount[0]?.count || 0,
          approved: approvedCount[0]?.count || 0,
          rejected: rejectedCount[0]?.count || 0,
          review: reviewCount[0]?.count || 0,
        },
        riskLevel: {
          high: highRiskCount[0]?.count || 0,
          medium: mediumRiskCount[0]?.count || 0,
          low: lowRiskCount[0]?.count || 0,
        },
      });
    } catch (error) {
      console.error('Error getting KYC stats:', error);
      res.status(500).json({
        message: 'Failed to get KYC stats',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
};