import { Request, Response } from 'express';
import { dataProtectionService } from '../services/data-protection-service';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Controller for data protection and privacy operations
 */
export const dataProtectionController = {
  /**
   * Update user consent settings
   */
  updateConsent: async (req: Request, res: Response) => {
    try {
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { marketingConsent, dataProcessingConsent, thirdPartySharing } = req.body;
      
      // Update user consent settings
      const [updatedUser] = await db
        .update(users)
        .set({
          marketingConsent: marketingConsent ?? false,
          dataProcessingConsent: dataProcessingConsent ?? false,
          thirdPartyDataSharing: thirdPartySharing ?? false,
          consentDate: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          marketingConsent: users.marketingConsent,
          dataProcessingConsent: users.dataProcessingConsent,
          thirdPartyDataSharing: users.thirdPartyDataSharing,
          consentDate: users.consentDate,
        });
      
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating consent:', error);
      res.status(500).json({
        message: 'Failed to update consent settings',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Get user consent status
   */
  getConsentStatus: async (req: Request, res: Response) => {
    try {
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Get user consent settings
      const [userData] = await db
        .select({
          id: users.id,
          marketingConsent: users.marketingConsent,
          dataProcessingConsent: users.dataProcessingConsent,
          thirdPartyDataSharing: users.thirdPartyDataSharing,
          consentDate: users.consentDate,
        })
        .from(users)
        .where(eq(users.id, userId));
      
      if (!userData) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(userData);
    } catch (error) {
      console.error('Error getting consent status:', error);
      res.status(500).json({
        message: 'Failed to get consent status',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Export user data (GDPR compliance)
   */
  exportUserData: async (req: Request, res: Response) => {
    try {
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Export user data
      const userData = await dataProtectionService.exportUserData(userId);
      
      // Set appropriate headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="user_data_export_${userId}.json"`);
      
      res.status(200).json(userData);
    } catch (error) {
      console.error('Error exporting user data:', error);
      res.status(500).json({
        message: 'Failed to export user data',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Request account deletion (GDPR compliance)
   */
  requestAccountDeletion: async (req: Request, res: Response) => {
    try {
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Update user status to mark for deletion
      // In a real system, this would trigger a workflow that verifies the request
      // and then anonymizes or deletes the user data after a cooling-off period
      await db
        .update(users)
        .set({
          deletionRequested: true,
          deletionRequestedAt: new Date(),
        })
        .where(eq(users.id, userId));
      
      res.status(200).json({
        message: 'Account deletion request received',
        deletionRequestedAt: new Date(),
        estimatedProcessingTime: '30 days',
      });
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      res.status(500).json({
        message: 'Failed to request account deletion',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Check compliance status for a user (admin only)
   */
  checkUserCompliance: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // Get compliance status
      const complianceStatus = await dataProtectionService.getUserComplianceStatus(parseInt(userId));
      
      res.status(200).json(complianceStatus);
    } catch (error) {
      console.error('Error checking compliance status:', error);
      res.status(500).json({
        message: 'Failed to check compliance status',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Anonymize user data (admin only)
   */
  anonymizeUser: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // Anonymize user data
      await dataProtectionService.anonymizeUser(parseInt(userId));
      
      res.status(200).json({
        message: 'User data anonymized successfully',
        anonymizedAt: new Date(),
      });
    } catch (error) {
      console.error('Error anonymizing user data:', error);
      res.status(500).json({
        message: 'Failed to anonymize user data',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Check for PII in text (admin tool)
   */
  detectPII: async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: 'Text is required' });
      }
      
      // Detect PII in text
      const piiDetection = dataProtectionService.detectPII(text);
      
      res.status(200).json(piiDetection);
    } catch (error) {
      console.error('Error detecting PII:', error);
      res.status(500).json({
        message: 'Failed to detect PII',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
};