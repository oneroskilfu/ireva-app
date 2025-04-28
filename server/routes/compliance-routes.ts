import { Router } from "express";
import { db } from "../db";
import { documentTypeEnum, complianceLogs, insertComplianceLogSchema } from "@shared/schema";
import { eq, desc, and, sql, max } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// POST /api/compliance-accept
// Records when a user accepts a legal document
router.post("/compliance-accept", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Validate the request body
    const schema = z.object({
      userId: z.number(),
      documentType: z.enum([
        "terms_of_service", 
        "privacy_policy", 
        "investor_risk_disclosure", 
        "crypto_risk_disclosure",
        "aml_statement",
        "gdpr_commitment",
        "cookies_policy"
      ]),
      documentVersion: z.string().optional(),
    });

    const validatedData = schema.parse(req.body);

    // Check if user ID matches authenticated user
    if (validatedData.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: Cannot log acceptance for another user" });
    }

    // Get IP and user agent info
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Insert compliance log record
    const [logEntry] = await db.insert(complianceLogs).values({
      userId: validatedData.userId,
      documentType: validatedData.documentType as any,
      documentVersion: validatedData.documentVersion || "1.0.0", // Default version if not provided
      ipAddress: ipAddress as string,
      userAgent: userAgent
    }).returning();

    return res.status(201).json(logEntry);
  } catch (error) {
    console.error("Error logging compliance acceptance:", error);
    return res.status(400).json({ error: "Invalid request" });
  }
});

// GET /api/admin/compliance-logs
// Admin endpoint to get compliance logs with optional filtering
router.get("/admin/compliance-logs", async (req, res) => {
  if (!req.isAuthenticated() || (req.user.role !== "admin" && req.user.role !== "super_admin")) {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  try {
    const documentType = req.query.documentType as string;
    
    let query;
    
    // Apply document type filter if provided
    if (documentType) {
      query = db.select().from(complianceLogs)
        .where(eq(complianceLogs.documentType, documentType as any))
        .orderBy(desc(complianceLogs.acceptedAt));
    } else {
      query = db.select().from(complianceLogs)
        .orderBy(desc(complianceLogs.acceptedAt));
    }
    
    const logs = await query;
    return res.json(logs);
  } catch (error) {
    console.error("Error fetching compliance logs:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/compliance/check-latest
// Checks if a user needs to accept the latest version of any document
router.get("/compliance/check-latest", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user.id;
    
    // Check if userId matches authenticated user
    if (userId !== req.user.id && req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: Cannot check compliance for another user" });
    }

    // Define current latest versions of documents
    const latestVersions = {
      terms_of_service: { version: "1.0.3", lastUpdated: "April 28, 2025", title: "Terms of Service" },
      privacy_policy: { version: "1.0.2", lastUpdated: "April 28, 2025", title: "Privacy Policy" },
      investor_risk_disclosure: { version: "1.0.1", lastUpdated: "April 28, 2025", title: "Investor Risk Disclosure" },
      crypto_risk_disclosure: { version: "1.0.1", lastUpdated: "April 28, 2025", title: "Cryptocurrency Risk Disclosure" }
    };

    // Loop through document types and check if user has accepted latest version
    for (const [docType, details] of Object.entries(latestVersions)) {
      // Get the user's latest acceptance record for this document type
      const [userLatestAcceptance] = await db.select()
        .from(complianceLogs)
        .where(and(
          eq(complianceLogs.userId, userId),
          eq(complianceLogs.documentType, docType as any)
        ))
        .orderBy(desc(complianceLogs.acceptedAt))
        .limit(1);
      
      // If no acceptance record, or version is not latest
      if (!userLatestAcceptance || userLatestAcceptance.documentVersion !== details.version) {
        return res.json({
          needsAcceptance: true,
          document: {
            document_type: docType,
            version: details.version,
            lastUpdated: details.lastUpdated,
            title: details.title,
            pdfUrl: `/pdfs/${docType.replace(/_/g, '-')}.pdf`
          }
        });
      }
    }

    // If we get here, user has accepted all latest versions
    return res.json({ needsAcceptance: false });
  } catch (error) {
    console.error("Error checking compliance:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/compliance/accept-latest
// Records when a user accepts the latest version of a document
router.post("/compliance/accept-latest", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Validate the request body
    const schema = z.object({
      userId: z.number(),
      documentType: z.enum([
        "terms_of_service", 
        "privacy_policy", 
        "investor_risk_disclosure", 
        "crypto_risk_disclosure",
        "aml_statement",
        "gdpr_commitment",
        "cookies_policy"
      ]),
      version: z.string(),
    });

    const validatedData = schema.parse(req.body);

    // Check if userId matches authenticated user
    if (validatedData.userId !== req.user.id && req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: Cannot log acceptance for another user" });
    }

    // Get IP and user agent info
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    // Insert compliance log record
    const [logEntry] = await db.insert(complianceLogs).values({
      userId: validatedData.userId,
      documentType: validatedData.documentType as any,
      documentVersion: validatedData.version,
      ipAddress: ipAddress as string,
      userAgent: userAgent
    }).returning();

    return res.status(201).json(logEntry);
  } catch (error) {
    console.error("Error logging compliance acceptance:", error);
    return res.status(400).json({ error: "Invalid request" });
  }
});

export default router;