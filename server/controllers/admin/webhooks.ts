import { Request, Response } from "express";
import { db } from "../../db";
import { webhooks, webhookDeliveries } from "@shared/schema";
import { 
  eq, sql, count, avg, gte, lte, desc, and, max, sum, isNull, not 
} from "drizzle-orm";
import { logger } from "../../utils/logger";
import { triggerEvent } from "../../services/webhook";

/**
 * Get webhook delivery statistics for admin dashboard
 */
export async function getWebhookStats(req: Request, res: Response) {
  try {
    // Get the date range for filtering (default to last 30 days)
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();
    
    // Get total number of webhooks
    const [totalWebhooksResult] = await db
      .select({ count: count() })
      .from(webhooks);
    
    // Get total number of active webhooks
    const [activeWebhooksResult] = await db
      .select({ count: count() })
      .from(webhooks)
      .where(eq(webhooks.isActive, true));
    
    // Get total number of webhook deliveries
    const [totalDeliveriesResult] = await db
      .select({ count: count() })
      .from(webhookDeliveries)
      .where(
        and(
          gte(webhookDeliveries.deliveredAt, startDate),
          lte(webhookDeliveries.deliveredAt, endDate)
        )
      );
    
    // Get successful webhook deliveries
    const [successfulDeliveriesResult] = await db
      .select({ count: count() })
      .from(webhookDeliveries)
      .where(
        and(
          gte(webhookDeliveries.deliveredAt, startDate),
          lte(webhookDeliveries.deliveredAt, endDate),
          eq(webhookDeliveries.success, true)
        )
      );
    
    // Get failed webhook deliveries
    const [failedDeliveriesResult] = await db
      .select({ count: count() })
      .from(webhookDeliveries)
      .where(
        and(
          gte(webhookDeliveries.deliveredAt, startDate),
          lte(webhookDeliveries.deliveredAt, endDate),
          eq(webhookDeliveries.success, false)
        )
      );
    
    // Get average response time
    const [avgResponseTimeResult] = await db
      .select({ avg: avg(webhookDeliveries.duration) })
      .from(webhookDeliveries)
      .where(
        and(
          gte(webhookDeliveries.deliveredAt, startDate),
          lte(webhookDeliveries.deliveredAt, endDate),
          not(isNull(webhookDeliveries.duration))
        )
      );
    
    // Get webhooks with the most failures
    const webhooksWithMostFailures = await db
      .select({
        id: webhooks.id,
        url: webhooks.url,
        description: webhooks.description,
        failureCount: webhooks.failureCount,
        lastError: webhooks.lastError,
        lastTriggeredAt: webhooks.lastTriggeredAt
      })
      .from(webhooks)
      .where(gte(webhooks.failureCount, 1))
      .orderBy(desc(webhooks.failureCount))
      .limit(5);
    
    // Get event type delivery statistics
    const eventTypeStats = await db
      .select({
        eventType: webhookDeliveries.eventType,
        count: count(),
        successCount: count(
          and(
            eq(webhookDeliveries.success, true)
          )
        )
      })
      .from(webhookDeliveries)
      .where(
        and(
          gte(webhookDeliveries.deliveredAt, startDate),
          lte(webhookDeliveries.deliveredAt, endDate)
        )
      )
      .groupBy(webhookDeliveries.eventType)
      .orderBy(desc(sql`count`));
    
    // Calculate delivery success rate
    const successRate = totalDeliveriesResult.count > 0
      ? (successfulDeliveriesResult.count / totalDeliveriesResult.count) * 100
      : 0;
    
    // Prepare the response
    const stats = {
      totalWebhooks: totalWebhooksResult.count,
      activeWebhooks: activeWebhooksResult.count,
      totalDeliveries: totalDeliveriesResult.count,
      successfulDeliveries: successfulDeliveriesResult.count,
      failedDeliveries: failedDeliveriesResult.count,
      successRate: parseFloat(successRate.toFixed(2)),
      avgResponseTime: avgResponseTimeResult.avg 
        ? Math.round(Number(avgResponseTimeResult.avg))
        : 0,
      webhooksWithMostFailures,
      eventTypeStats
    };
    
    res.json(stats);
  } catch (error: any) {
    logger.error(`Error getting webhook stats: ${error?.message}`, {
      context: 'admin-webhooks-controller'
    });
    res.status(500).json({ error: "Failed to get webhook statistics" });
  }
}

/**
 * Retry all failed webhook deliveries for a specific webhook
 */
export async function retryFailedDeliveries(req: Request, res: Response) {
  try {
    const { webhookId } = req.params;
    
    // Get all failed deliveries for this webhook
    const failedDeliveries = await db
      .select()
      .from(webhookDeliveries)
      .where(
        and(
          eq(webhookDeliveries.webhookId, webhookId),
          eq(webhookDeliveries.success, false)
        )
      )
      .orderBy(desc(webhookDeliveries.deliveredAt));
    
    if (failedDeliveries.length === 0) {
      return res.status(404).json({ message: "No failed deliveries found for this webhook" });
    }
    
    // Get the webhook
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, webhookId));
    
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    
    // For each failed delivery, trigger the event again
    const retryPromises = failedDeliveries.map(async (delivery) => {
      return triggerEvent(delivery.eventType, delivery.requestPayload as Record<string, any>);
    });
    
    await Promise.all(retryPromises);
    
    // Update the webhook's failure count to 0 since we've retried all deliveries
    await db
      .update(webhooks)
      .set({
        failureCount: 0,
        lastError: null
      })
      .where(eq(webhooks.id, webhookId));
    
    res.json({ 
      success: true, 
      message: `Retried ${failedDeliveries.length} failed webhook deliveries` 
    });
  } catch (error: any) {
    logger.error(`Error retrying failed deliveries: ${error?.message}`, {
      context: 'admin-webhooks-controller'
    });
    res.status(500).json({ error: "Failed to retry webhook deliveries" });
  }
}

/**
 * Get performance metrics for webhooks
 */
export async function getWebhookPerformance(req: Request, res: Response) {
  try {
    // Get the date range for filtering (default to last 30 days)
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();
    
    // Calculate the number of days in the selected range
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get daily delivery statistics
    let dailyStats;
    
    if (daysDiff <= 60) {
      // If the range is 60 days or less, get daily stats
      dailyStats = await db
        .select({
          date: sql`date_trunc('day', ${webhookDeliveries.deliveredAt})`,
          total: count(),
          success: count(
            and(
              eq(webhookDeliveries.success, true)
            )
          ),
          failed: count(
            and(
              eq(webhookDeliveries.success, false)
            )
          ),
          avgResponseTime: avg(webhookDeliveries.duration)
        })
        .from(webhookDeliveries)
        .where(
          and(
            gte(webhookDeliveries.deliveredAt, startDate),
            lte(webhookDeliveries.deliveredAt, endDate)
          )
        )
        .groupBy(sql`date_trunc('day', ${webhookDeliveries.deliveredAt})`)
        .orderBy(sql`date_trunc('day', ${webhookDeliveries.deliveredAt})`);
    } else {
      // If the range is more than 60 days, aggregate by week
      dailyStats = await db
        .select({
          date: sql`date_trunc('week', ${webhookDeliveries.deliveredAt})`,
          total: count(),
          success: count(
            and(
              eq(webhookDeliveries.success, true)
            )
          ),
          failed: count(
            and(
              eq(webhookDeliveries.success, false)
            )
          ),
          avgResponseTime: avg(webhookDeliveries.duration)
        })
        .from(webhookDeliveries)
        .where(
          and(
            gte(webhookDeliveries.deliveredAt, startDate),
            lte(webhookDeliveries.deliveredAt, endDate)
          )
        )
        .groupBy(sql`date_trunc('week', ${webhookDeliveries.deliveredAt})`)
        .orderBy(sql`date_trunc('week', ${webhookDeliveries.deliveredAt})`);
    }
    
    // Format the daily stats
    const formattedDailyStats = dailyStats.map(stat => ({
      date: stat.date.toISOString().split('T')[0],
      total: Number(stat.total),
      success: Number(stat.success),
      failed: Number(stat.failed),
      avgResponseTime: stat.avgResponseTime ? Math.round(Number(stat.avgResponseTime)) : 0
    }));
    
    // Get performance metrics for each webhook
    const webhookPerformance = await db
      .select({
        id: webhooks.id,
        url: webhooks.url,
        description: webhooks.description,
        total: count(webhookDeliveries.id),
        success: count(
          and(
            eq(webhookDeliveries.success, true)
          )
        ),
        failed: count(
          and(
            eq(webhookDeliveries.success, false)
          )
        ),
        avgResponseTime: avg(webhookDeliveries.duration)
      })
      .from(webhooks)
      .leftJoin(webhookDeliveries, eq(webhooks.id, webhookDeliveries.webhookId))
      .where(
        and(
          gte(webhookDeliveries.deliveredAt, startDate),
          lte(webhookDeliveries.deliveredAt, endDate)
        )
      )
      .groupBy(webhooks.id, webhooks.url, webhooks.description)
      .orderBy(desc(sql`total`));
    
    // Format the webhook performance stats
    const formattedWebhookPerformance = webhookPerformance.map(webhook => ({
      id: webhook.id,
      url: webhook.url,
      description: webhook.description,
      total: Number(webhook.total),
      success: Number(webhook.success),
      failed: Number(webhook.failed),
      successRate: webhook.total > 0 
        ? parseFloat(((webhook.success / webhook.total) * 100).toFixed(2)) 
        : 0,
      avgResponseTime: webhook.avgResponseTime 
        ? Math.round(Number(webhook.avgResponseTime)) 
        : 0
    }));
    
    res.json({
      timeSeriesData: formattedDailyStats,
      webhookPerformance: formattedWebhookPerformance
    });
  } catch (error: any) {
    logger.error(`Error getting webhook performance: ${error?.message}`, {
      context: 'admin-webhooks-controller'
    });
    res.status(500).json({ error: "Failed to get webhook performance metrics" });
  }
}

/**
 * Get detailed audit logs for webhook deliveries
 */
export async function getWebhookAuditLogs(req: Request, res: Response) {
  try {
    const { webhookId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    // Get total count
    const [countResult] = await db
      .select({ count: count() })
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.webhookId, webhookId));
    
    // Get webhook deliveries
    const deliveries = await db
      .select()
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.webhookId, webhookId))
      .orderBy(desc(webhookDeliveries.deliveredAt))
      .limit(limit)
      .offset(offset);
    
    // Format the response data
    const formattedDeliveries = deliveries.map(delivery => ({
      id: delivery.id,
      eventType: delivery.eventType,
      payload: delivery.requestPayload,
      responseStatus: delivery.responseStatus,
      responseBody: delivery.responseBody,
      deliveredAt: delivery.deliveredAt,
      duration: delivery.duration,
      success: delivery.success,
      errorMessage: delivery.errorMessage
    }));
    
    res.json({
      data: formattedDeliveries,
      pagination: {
        total: countResult.count,
        page,
        limit,
        pages: Math.ceil(countResult.count / limit)
      }
    });
  } catch (error: any) {
    logger.error(`Error getting webhook audit logs: ${error?.message}`, {
      context: 'admin-webhooks-controller'
    });
    res.status(500).json({ error: "Failed to get webhook audit logs" });
  }
}

/**
 * Rotate webhook secret
 */
export async function rotateWebhookSecret(req: Request, res: Response) {
  try {
    const { webhookId } = req.params;
    
    // Get the webhook
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, webhookId));
    
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    
    // Generate a new secret
    const newSecret = generateWebhookSecret();
    
    // Update the webhook with the new secret
    const [updatedWebhook] = await db
      .update(webhooks)
      .set({ secret: newSecret })
      .where(eq(webhooks.id, webhookId))
      .returning();
    
    res.json({ 
      success: true, 
      message: "Webhook secret rotated successfully",
      webhook: {
        id: updatedWebhook.id,
        secret: updatedWebhook.secret
      }
    });
  } catch (error: any) {
    logger.error(`Error rotating webhook secret: ${error?.message}`, {
      context: 'admin-webhooks-controller'
    });
    res.status(500).json({ error: "Failed to rotate webhook secret" });
  }
}

/**
 * Generate a secure webhook secret
 */
function generateWebhookSecret() {
  // Generate a 32-character random string for the webhook secret
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
  const length = 32;
  let secret = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    secret += characters.charAt(randomIndex);
  }
  
  return secret;
}