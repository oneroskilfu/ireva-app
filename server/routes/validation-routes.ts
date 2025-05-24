import type { Express } from "express";
import { GoLiveValidator } from "../lib/go-live-validator";

export function registerValidationRoutes(app: Express) {
  // Admin-only go-live validation endpoint
  app.get("/api/admin/validate-platform", async (req, res) => {
    try {
      // Check admin authorization
      if (!req.isAuthenticated() || req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const validator = new GoLiveValidator();
      const { success, results } = await validator.runFullValidation();
      
      res.json({
        success,
        results,
        summary: {
          passed: results.filter(r => r.status === 'pass').length,
          warnings: results.filter(r => r.status === 'warning').length,
          failed: results.filter(r => r.status === 'fail').length,
          total: results.length,
        },
        detailedReport: validator.getDetailedReport(),
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error("Error running platform validation:", error);
      res.status(500).json({ error: "Failed to run platform validation" });
    }
  });

  // Quick health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: "1.0.0",
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Database health check
  app.get("/api/health/db", async (req, res) => {
    try {
      const { db } = await import("../db");
      const { users } = await import("@shared/schema");
      
      await db.select().from(users).limit(1);
      
      res.json({
        status: "healthy",
        component: "database",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        component: "database",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  });
}