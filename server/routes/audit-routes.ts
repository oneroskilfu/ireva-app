import type { Express } from "express";
import { db } from "../db";
import { auditLogs, users } from "@shared/schema";
import { eq, and, gte, lte, ilike, desc } from "drizzle-orm";

export function registerAuditRoutes(app: Express) {
  // Admin-only audit log viewer with server-side pagination and filtering
  app.get("/api/admin/audit-logs", async (req, res) => {
    try {
      // Check admin authorization
      if (!req.isAuthenticated() || req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const {
        page = 1,
        limit = 25,
        userId,
        action,
        dateFrom,
        dateTo,
        resource,
        method
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions
      const conditions = [];
      
      if (userId) {
        conditions.push(eq(auditLogs.userId, parseInt(userId as string)));
      }
      
      if (action) {
        conditions.push(ilike(auditLogs.action, `%${action}%`));
      }
      
      if (resource) {
        conditions.push(ilike(auditLogs.resource, `%${resource}%`));
      }
      
      if (method) {
        conditions.push(eq(auditLogs.method, method as string));
      }
      
      if (dateFrom) {
        conditions.push(gte(auditLogs.timestamp, new Date(dateFrom as string)));
      }
      
      if (dateTo) {
        conditions.push(lte(auditLogs.timestamp, new Date(dateTo as string)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count for pagination
      const totalResult = await db
        .select({ count: auditLogs.id })
        .from(auditLogs)
        .where(whereClause);
      
      const total = totalResult.length;

      // Get paginated audit logs with user information
      const logs = await db
        .select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          action: auditLogs.action,
          resource: auditLogs.resource,
          method: auditLogs.method,
          statusCode: auditLogs.statusCode,
          requestBody: auditLogs.requestBody,
          responseTime: auditLogs.responseTime,
          ipAddress: auditLogs.ipAddress,
          userAgent: auditLogs.userAgent,
          timestamp: auditLogs.timestamp,
          additionalInfo: auditLogs.additionalInfo,
          user: {
            username: users.username,
            name: users.name,
          }
        })
        .from(auditLogs)
        .leftJoin(users, eq(users.id, auditLogs.userId))
        .where(whereClause)
        .orderBy(desc(auditLogs.timestamp))
        .limit(limitNum)
        .offset(offset);

      const totalPages = Math.ceil(total / limitNum);

      res.json({
        logs,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      });

    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Get list of users for filtering dropdown
  app.get("/api/admin/users/list", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const usersList = await db
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
        })
        .from(users)
        .orderBy(users.username);

      res.json(usersList);
    } catch (error) {
      console.error("Error fetching users list:", error);
      res.status(500).json({ error: "Failed to fetch users list" });
    }
  });

  // Get audit log statistics for dashboard
  app.get("/api/admin/audit-stats", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const today = new Date();
      const last24Hours = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get activity counts
      const [
        totalLogs,
        last24HoursLogs,
        last7DaysLogs,
        failedRequests,
      ] = await Promise.all([
        db.select({ count: auditLogs.id }).from(auditLogs),
        db.select({ count: auditLogs.id }).from(auditLogs).where(gte(auditLogs.timestamp, last24Hours)),
        db.select({ count: auditLogs.id }).from(auditLogs).where(gte(auditLogs.timestamp, last7Days)),
        db.select({ count: auditLogs.id }).from(auditLogs).where(gte(auditLogs.statusCode, 400)),
      ]);

      // Get top actions
      const topActions = await db
        .select({
          action: auditLogs.action,
          count: auditLogs.id,
        })
        .from(auditLogs)
        .where(gte(auditLogs.timestamp, last7Days))
        .groupBy(auditLogs.action)
        .orderBy(desc(auditLogs.id))
        .limit(10);

      // Get top users by activity
      const topUsers = await db
        .select({
          userId: auditLogs.userId,
          username: users.username,
          name: users.name,
          count: auditLogs.id,
        })
        .from(auditLogs)
        .leftJoin(users, eq(users.id, auditLogs.userId))
        .where(gte(auditLogs.timestamp, last7Days))
        .groupBy(auditLogs.userId, users.username, users.name)
        .orderBy(desc(auditLogs.id))
        .limit(10);

      res.json({
        totalLogs: totalLogs.length,
        last24Hours: last24HoursLogs.length,
        last7Days: last7DaysLogs.length,
        failedRequests: failedRequests.length,
        topActions,
        topUsers,
      });

    } catch (error) {
      console.error("Error fetching audit statistics:", error);
      res.status(500).json({ error: "Failed to fetch audit statistics" });
    }
  });
}