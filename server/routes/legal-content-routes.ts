import express from 'express';
import { Request, Response } from 'express';
import { db } from '../db';
import { legalVersions, notifications, users } from '@shared/schema';
import { authMiddleware, ensureAdmin } from '../auth-jwt';
import { eq, and, desc } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';

export const legalContentRouter = express.Router();

/**
 * Get a legal document in PDF format
 */
legalContentRouter.get('/:documentType/:version', async (req: Request, res: Response) => {
  try {
    const documentType = req.params.documentType;
    const version = parseInt(req.params.version);

    if (!documentType || isNaN(version)) {
      return res.status(400).json({ error: 'Document type and version are required' });
    }

    // Check if this version exists
    const docVersions = await db
      .select()
      .from(legalVersions)
      .where(
        and(
          eq(legalVersions.documentType, documentType as any),
          eq(legalVersions.version, version)
        )
      )
      .limit(1);

    if (docVersions.length === 0) {
      return res.status(404).json({ error: 'Document version not found' });
    }
    
    // In a production environment, these would be stored in a cloud storage service
    // or database blob storage. For this prototype, we'll serve from local filesystem
    const filePath = path.join(
      __dirname, 
      '../../legal-documents', 
      `${documentType}_v${version}.pdf`
    );

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // If not, serve a placeholder text
      return res.status(404).json({ 
        error: 'Document file not found',
        message: `${documentType} version ${version} file is not available.`
      });
    }

    // Serve the PDF file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving legal document:', error);
    return res.status(500).json({ error: 'Failed to serve legal document' });
  }
});

/**
 * Get a legal document in text/HTML format
 */
legalContentRouter.get('/:documentType/:version/text', async (req: Request, res: Response) => {
  try {
    const documentType = req.params.documentType;
    const version = parseInt(req.params.version);

    if (!documentType || isNaN(version)) {
      return res.status(400).json({ error: 'Document type and version are required' });
    }

    // Check if this version exists
    const docVersions = await db
      .select()
      .from(legalVersions)
      .where(
        and(
          eq(legalVersions.documentType, documentType as any),
          eq(legalVersions.version, version)
        )
      )
      .limit(1);

    if (docVersions.length === 0) {
      return res.status(404).json({ error: 'Document version not found' });
    }
    
    // In a production environment, these would be stored in a CMS or database
    // For this prototype, we'll serve placeholder content
    let content = '';

    // Generate some placeholder content based on document type and version
    if (documentType === 'terms_of_service') {
      content = `
        <h2>iREVA Terms of Service - Version ${version}</h2>
        <p>Last Updated: ${new Date().toLocaleDateString()}</p>
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing or using the iREVA investment platform, you agree to be bound by these Terms of Service.</p>
        <h3>2. Description of Service</h3>
        <p>iREVA provides a real estate investment platform that allows users to invest in African real estate projects.</p>
        <h3>3. User Registration</h3>
        <p>You must complete the registration process to use our services. You agree to provide accurate information.</p>
        <h3>4. Investor Qualifications</h3>
        <p>Different investment opportunities may require different investor accreditation levels.</p>
      `;
    } else if (documentType === 'privacy_policy') {
      content = `
        <h2>iREVA Privacy Policy - Version ${version}</h2>
        <p>Last Updated: ${new Date().toLocaleDateString()}</p>
        <h3>1. Information We Collect</h3>
        <p>We collect information you provide directly to us, including personal information during registration.</p>
        <h3>2. How We Use Information</h3>
        <p>We use the information we collect to operate and improve our services, and communicate with you.</p>
        <h3>3. Information Sharing</h3>
        <p>We may share information with third-party service providers who perform services on our behalf.</p>
      `;
    } else if (documentType === 'crypto_risk_disclosure') {
      content = `
        <h2>iREVA Cryptocurrency Risk Disclosure - Version ${version}</h2>
        <p>Last Updated: ${new Date().toLocaleDateString()}</p>
        <h3>1. Market Volatility</h3>
        <p>Cryptocurrency prices can be volatile and may fluctuate significantly over short periods of time.</p>
        <h3>2. Regulatory Risks</h3>
        <p>Cryptocurrency regulations vary by jurisdiction and are subject to change, which may impact your investments.</p>
        <h3>3. Technical Risks</h3>
        <p>There are various technical risks associated with cryptocurrency transactions, including wallet security.</p>
      `;
    } else {
      content = `
        <h2>iREVA ${documentType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} - Version ${version}</h2>
        <p>Last Updated: ${new Date().toLocaleDateString()}</p>
        <p>This is a placeholder for the ${documentType} document, version ${version}.</p>
      `;
    }

    return res.json({ content });
  } catch (error) {
    console.error('Error serving legal document content:', error);
    return res.status(500).json({ error: 'Failed to serve legal document content' });
  }
});

/**
 * Admin: Upload a new legal document version
 */
legalContentRouter.post('/upload', authMiddleware, ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { documentType, version, content, notify_users } = req.body;

    if (!documentType || !version) {
      return res.status(400).json({ error: 'Document type and version are required' });
    }

    // Check if this version already exists
    const existing = await db
      .select()
      .from(legalVersions)
      .where(
        and(
          eq(legalVersions.documentType, documentType),
          eq(legalVersions.version, version)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: 'This version already exists' });
    }

    // Insert new version
    const newVersion = await db.insert(legalVersions).values({
      documentType,
      version,
      notify_users: !!notify_users // Ensure it's a boolean
    }).returning();

    // If notify_users is true, send notifications to all active users
    if (notify_users) {
      // Get all active users
      const activeUsers = await db
        .select()
        .from(users)
        .where(eq(users.isActive, true));
      
      // Create a notification for each user
      const documentDisplayName = documentType
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      for (const user of activeUsers) {
        await db.insert(notifications).values({
          userId: user.id,
          title: `${documentDisplayName} Updated`,
          message: `Please review and accept the latest version of ${documentDisplayName} to continue using iREVA.`,
          type: 'compliance',
          isRead: false
        });
      }
    }

    // In a production environment, you would store the document content in a
    // database or file storage system here

    return res.status(201).json(newVersion[0]);
  } catch (error) {
    console.error('Error uploading legal document:', error);
    return res.status(500).json({ error: 'Failed to upload legal document' });
  }
});

console.log('Legal content routes registered');