import type { Express } from "express";
import { db } from "../db";
import { userConsents } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export function registerConsentRoutes(app: Express) {
  // Check if user has accepted current terms and privacy policy
  app.get("/api/consent/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = req.user!.id;
      const currentTermsVersion = "2.0"; // Should come from config
      const currentPrivacyVersion = "2.0"; // Should come from config

      // Check for current consent versions
      const [termsConsent, privacyConsent] = await Promise.all([
        db
          .select()
          .from(userConsents)
          .where(
            and(
              eq(userConsents.userId, userId),
              eq(userConsents.consentType, 'terms'),
              eq(userConsents.version, currentTermsVersion),
              eq(userConsents.accepted, true)
            )
          )
          .limit(1),
        db
          .select()
          .from(userConsents)
          .where(
            and(
              eq(userConsents.userId, userId),
              eq(userConsents.consentType, 'privacy'),
              eq(userConsents.version, currentPrivacyVersion),
              eq(userConsents.accepted, true)
            )
          )
          .limit(1)
      ]);

      const needsConsent = termsConsent.length === 0 || privacyConsent.length === 0;

      res.json({
        needsConsent,
        termsAccepted: termsConsent.length > 0,
        privacyAccepted: privacyConsent.length > 0,
        currentVersions: {
          terms: currentTermsVersion,
          privacy: currentPrivacyVersion,
        },
      });

    } catch (error) {
      console.error("Error checking consent status:", error);
      res.status(500).json({ error: "Failed to check consent status" });
    }
  });

  // Record user consent
  app.post("/api/consent/accept", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { termsAccepted, privacyAccepted } = req.body;
      const userId = req.user!.id;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'] || '';

      if (!termsAccepted || !privacyAccepted) {
        return res.status(400).json({ 
          error: "Both Terms of Service and Privacy Policy must be accepted" 
        });
      }

      const currentTermsVersion = "2.0";
      const currentPrivacyVersion = "2.0";

      // Record consent for both terms and privacy
      await Promise.all([
        db.insert(userConsents).values({
          userId,
          consentType: 'terms',
          version: currentTermsVersion,
          accepted: true,
          ipAddress,
          userAgent,
        }).onConflictDoUpdate({
          target: [userConsents.userId, userConsents.consentType, userConsents.version],
          set: {
            accepted: true,
            timestamp: new Date(),
            ipAddress,
            userAgent,
          },
        }),
        db.insert(userConsents).values({
          userId,
          consentType: 'privacy',
          version: currentPrivacyVersion,
          accepted: true,
          ipAddress,
          userAgent,
        }).onConflictDoUpdate({
          target: [userConsents.userId, userConsents.consentType, userConsents.version],
          set: {
            accepted: true,
            timestamp: new Date(),
            ipAddress,
            userAgent,
          },
        }),
      ]);

      res.json({ 
        success: true, 
        message: "Consent recorded successfully" 
      });

    } catch (error) {
      console.error("Error recording consent:", error);
      res.status(500).json({ error: "Failed to record consent" });
    }
  });

  // Get current terms of service and privacy policy
  app.get("/api/legal/terms", async (req, res) => {
    try {
      // In a real implementation, this would come from a CMS or database
      const termsOfService = {
        version: "2.0",
        lastUpdated: "2024-01-15",
        content: `
# Terms of Service - iREVA Platform

## 1. Acceptance of Terms
By accessing and using the iREVA platform, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Investment Risks
All investments carry risk. Past performance does not guarantee future results. You may lose some or all of your investment.

## 3. Platform Services
iREVA provides a platform for real estate investment opportunities. We act as an intermediary between investors and property opportunities.

## 4. User Responsibilities
- Provide accurate information
- Maintain account security
- Comply with applicable laws
- Understand investment risks

## 5. Fees and Charges
Management fees and other charges may apply to your investments. All fees will be clearly disclosed before investment.

## 6. Termination
We reserve the right to terminate accounts that violate these terms or applicable laws.

## 7. Governing Law
These terms are governed by the laws of [Jurisdiction].

Last updated: January 15, 2024
        `,
      };

      res.json(termsOfService);
    } catch (error) {
      console.error("Error fetching terms:", error);
      res.status(500).json({ error: "Failed to fetch terms" });
    }
  });

  app.get("/api/legal/privacy", async (req, res) => {
    try {
      const privacyPolicy = {
        version: "2.0",
        lastUpdated: "2024-01-15",
        content: `
# Privacy Policy - iREVA Platform

## 1. Information We Collect
We collect information you provide directly to us, such as when you create an account, make investments, or contact us.

## 2. How We Use Information
- To provide and maintain our services
- To process transactions and investments
- To communicate with you
- To comply with legal obligations

## 3. Information Sharing
We do not sell or rent your personal information. We may share information:
- With service providers who assist in our operations
- When required by law
- To protect our rights and safety

## 4. Data Security
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## 5. Your Rights
You have the right to:
- Access your personal information
- Correct inaccurate information
- Delete your information (subject to legal requirements)
- Opt out of marketing communications

## 6. Cookies and Tracking
We use cookies and similar technologies to enhance your experience and analyze platform usage.

## 7. Contact Us
For privacy questions, contact us at privacy@ireva.com

Last updated: January 15, 2024
        `,
      };

      res.json(privacyPolicy);
    } catch (error) {
      console.error("Error fetching privacy policy:", error);
      res.status(500).json({ error: "Failed to fetch privacy policy" });
    }
  });

  // Admin: Get consent statistics
  app.get("/api/admin/consent/stats", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Get consent statistics
      const stats = await db
        .select({
          consentType: userConsents.consentType,
          version: userConsents.version,
          count: userConsents.id,
        })
        .from(userConsents)
        .where(eq(userConsents.accepted, true))
        .groupBy(userConsents.consentType, userConsents.version);

      res.json(stats);

    } catch (error) {
      console.error("Error fetching consent stats:", error);
      res.status(500).json({ error: "Failed to fetch consent statistics" });
    }
  });
}