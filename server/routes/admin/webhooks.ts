import express from "express";
import { ensureAdmin } from "../../auth-jwt";
import {
  getWebhookStats,
  retryFailedDeliveries,
  getWebhookPerformance,
  getWebhookAuditLogs,
  rotateWebhookSecret
} from "../../controllers/admin/webhooks";

const router = express.Router();

// Ensure all routes require admin access
router.use(ensureAdmin);

// Get webhook delivery statistics
router.get("/stats", getWebhookStats);

// Get webhook performance metrics
router.get("/performance", getWebhookPerformance);

// Get webhook audit logs
router.get("/:webhookId/audit", getWebhookAuditLogs);

// Retry all failed webhook deliveries for a specific webhook
router.post("/:webhookId/retry", retryFailedDeliveries);

// Rotate webhook secret
router.post("/:webhookId/rotate-secret", rotateWebhookSecret);

export default router;