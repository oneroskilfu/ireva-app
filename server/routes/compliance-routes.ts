import express from 'express';
import { Request, Response } from 'express';
import { db } from '../db';
import { legalVersions, userLegalAcceptance, complianceLogs } from '@shared/schema';
import { authMiddleware, ensureAdmin } from '../auth-jwt';
import { eq, and, max, sql, desc, like } from 'drizzle-orm';

export const complianceRouter = express.Router();

/**
 * Check if user needs to accept any updated legal documents
 */
complianceRouter.get('/check-latest', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get the latest version of each document type
    const latestVersions = await db
      .select({
        documentType: legalVersions.documentType,
        version: sql<number>`max(${legalVersions.version})`.as('version')
      })
      .from(legalVersions)
      .groupBy(legalVersions.documentType);

    // Get user's currently accepted versions
    const acceptedVersions = await db
      .select({
        documentType: userLegalAcceptance.documentType,
        version: sql<number>`max(${userLegalAcceptance.version})`.as('version')
      })
      .from(userLegalAcceptance)
      .where(eq(userLegalAcceptance.userId, userId))
      .groupBy(userLegalAcceptance.documentType);

    // Find documents needing acceptance
    const needsAcceptance: { documentType: string; version: number }[] = [];

    latestVersions.forEach(latestDoc => {
      const accepted = acceptedVersions.find(
        acceptedDoc => acceptedDoc.documentType === latestDoc.documentType
      );
      
      if (!accepted || accepted.version < latestDoc.version) {
        needsAcceptance.push({
          documentType: latestDoc.documentType,
          version: latestDoc.version
        });
      }
    });

    if (needsAcceptance.length > 0) {
      // Return the first document to accept (client will handle one at a time)
      return res.json({ 
        needsAcceptance: true, 
        document: needsAcceptance[0]
      });
    } else {
      return res.json({ needsAcceptance: false });
    }
  } catch (error) {
    console.error('Error checking legal compliance:', error);
    return res.status(500).json({ error: 'Failed to check legal document compliance' });
  }
});

/**
 * Record user acceptance of a legal document
 */
complianceRouter.post('/accept-latest', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { documentType, version } = req.body;
    const userId = req.jwtPayload?.id;

    if (!userId || !documentType || !version) {
      return res.status(400).json({ error: 'User ID, document type, and version are required' });
    }

    // Insert user acceptance record
    await db.insert(userLegalAcceptance).values({
      userId,
      documentType,
      version,
    });

    // Log compliance action
    await db.insert(complianceLogs).values({
      userId,
      documentType,
      documentVersion: version.toString(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error recording legal document acceptance:', error);
    return res.status(500).json({ error: 'Failed to record document acceptance' });
  }
});

/**
 * Get all accepted legal documents for a user
 */
complianceRouter.get('/user-acceptance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const acceptances = await db
      .select()
      .from(userLegalAcceptance)
      .where(eq(userLegalAcceptance.userId, userId))
      .orderBy(userLegalAcceptance.acceptedAt);

    return res.json(acceptances);
  } catch (error) {
    console.error('Error fetching user acceptance records:', error);
    return res.status(500).json({ error: 'Failed to fetch acceptance records' });
  }
});

/**
 * Admin: Get latest document versions
 */
complianceRouter.get('/document-versions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const versions = await db
      .select()
      .from(legalVersions)
      .orderBy(legalVersions.documentType)
      .orderBy(legalVersions.version);

    return res.json(versions);
  } catch (error) {
    console.error('Error fetching document versions:', error);
    return res.status(500).json({ error: 'Failed to fetch document versions' });
  }
});

/**
 * Admin: Add new document version
 */
complianceRouter.post('/document-versions', authMiddleware, ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { documentType, version } = req.body;

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
    }).returning();

    return res.status(201).json(newVersion[0]);
  } catch (error) {
    console.error('Error adding document version:', error);
    return res.status(500).json({ error: 'Failed to add document version' });
  }
});

/**
 * Admin: Get compliance logs for all users
 */
complianceRouter.get('/admin/compliance-logs', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const documentType = req.query.documentType as string | undefined;
    
    let query = db.select().from(complianceLogs);
    
    // Apply document type filter if provided
    if (documentType) {
      query = query.where(eq(complianceLogs.documentType, documentType));
    }
    
    // Get all logs, ordered by most recent first
    const logs = await query.orderBy(desc(complianceLogs.acceptedAt));
    
    return res.json(logs);
  } catch (error) {
    console.error('Error fetching compliance logs:', error);
    return res.status(500).json({ error: 'Failed to fetch compliance logs' });
  }
});

console.log('Compliance logging routes registered');