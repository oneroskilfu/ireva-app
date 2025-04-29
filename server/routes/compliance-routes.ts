import { Router } from "express";
import { db } from "../db";
import { documentTypeEnum, complianceLogs, insertComplianceLogSchema } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
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

export default router;