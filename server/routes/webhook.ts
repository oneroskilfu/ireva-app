import express from "express";
import { z } from "zod";
import { db } from "../db";
import { insertWebhookSchema, webhooks, webhookDeliveries } from "@shared/schema";
import { eq } from "drizzle-orm";
import { validateRequest } from "../middleware/validate";
import { isAdmin, isAuthenticated } from "../middleware/auth";
import {
  getWebhookDeliveries,
  getWebhooks,
  retryWebhookDelivery,
  verifySignature,
} from "../services/webhook";
import { logger } from "../utils/logger";

type User = {
  id: string;
  role?: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: User;
      jwtPayload?: {
        id: string;
        role: string;
      };
    }
  }
}

const router = express.Router();

// Get all webhooks (admin only)
router.get("/webhooks", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const allWebhooks = await getWebhooks();
    res.json(allWebhooks);
  } catch (error) {
    logger.error(`Error fetching webhooks: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch webhooks" });
  }
});

// Get a user's webhooks
router.get("/user/webhooks", isAuthenticated, async (req, res) => {
  try {
    const userWebhooks = await getWebhooks(req.user.id);
    res.json(userWebhooks);
  } catch (error) {
    logger.error(`Error fetching user webhooks: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch webhooks" });
  }
});

// Create a new webhook
router.post(
  "/webhooks",
  isAuthenticated,
  validateRequest({
    body: insertWebhookSchema.extend({
      // Add any additional validations
      url: z.string().url("Must be a valid URL"),
      events: z.array(z.string()).min(1, "At least one event must be specified"),
      secret: z.string().min(10, "Secret must be at least 10 characters long"),
    }),
  }),
  async (req, res) => {
    try {
      const [webhook] = await db
        .insert(webhooks)
        .values({
          ...req.body,
          userId: req.user.id,
        })
        .returning();

      res.status(201).json(webhook);
    } catch (error) {
      logger.error(`Error creating webhook: ${error.message}`);
      res.status(500).json({ error: "Failed to create webhook" });
    }
  }
);

// Get webhook by ID
router.get("/webhooks/:id", isAuthenticated, async (req, res) => {
  try {
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, req.params.id));

    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }

    // Check if the user owns this webhook or is an admin
    if (webhook.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(webhook);
  } catch (error) {
    logger.error(`Error fetching webhook: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch webhook" });
  }
});

// Update webhook
router.patch(
  "/webhooks/:id",
  isAuthenticated,
  validateRequest({
    body: z.object({
      url: z.string().url().optional(),
      events: z.array(z.string()).min(1).optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
      secret: z.string().min(10).optional(),
    }),
  }),
  async (req, res) => {
    try {
      const [webhook] = await db
        .select()
        .from(webhooks)
        .where(eq(webhooks.id, req.params.id));

      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }

      // Check if the user owns this webhook or is an admin
      if (webhook.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const [updatedWebhook] = await db
        .update(webhooks)
        .set(req.body)
        .where(eq(webhooks.id, req.params.id))
        .returning();

      res.json(updatedWebhook);
    } catch (error) {
      logger.error(`Error updating webhook: ${error.message}`);
      res.status(500).json({ error: "Failed to update webhook" });
    }
  }
);

// Delete webhook
router.delete("/webhooks/:id", isAuthenticated, async (req, res) => {
  try {
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, req.params.id));

    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }

    // Check if the user owns this webhook or is an admin
    if (webhook.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await db.delete(webhooks).where(eq(webhooks.id, req.params.id));

    res.status(204).end();
  } catch (error) {
    logger.error(`Error deleting webhook: ${error.message}`);
    res.status(500).json({ error: "Failed to delete webhook" });
  }
});

// Get webhook deliveries
router.get("/webhooks/:id/deliveries", isAuthenticated, async (req, res) => {
  try {
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, req.params.id));

    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }

    // Check if the user owns this webhook or is an admin
    if (webhook.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const deliveries = await getWebhookDeliveries(req.params.id);
    res.json(deliveries);
  } catch (error) {
    logger.error(`Error fetching webhook deliveries: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch webhook deliveries" });
  }
});

// Retry a webhook delivery
router.post(
  "/webhook-deliveries/:id/retry",
  isAuthenticated,
  async (req, res) => {
    try {
      // Need to first check if the user owns the webhook associated with this delivery
      const [delivery] = await db
        .select({
          delivery: webhookDeliveries,
          webhook: webhooks,
        })
        .from(webhookDeliveries)
        .leftJoin(webhooks, eq(webhookDeliveries.webhookId, webhooks.id))
        .where(eq(webhookDeliveries.id, req.params.id));

      if (!delivery) {
        return res.status(404).json({ error: "Webhook delivery not found" });
      }

      // Check if the user owns this webhook or is an admin
      if (
        delivery.webhook.userId !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const result = await retryWebhookDelivery(req.params.id);
      res.json({ success: true, result });
    } catch (error) {
      logger.error(`Error retrying webhook delivery: ${error.message}`);
      res.status(500).json({ error: "Failed to retry webhook delivery" });
    }
  }
);

// Verify webhook signature
router.post(
  "/webhooks/:id/verify",
  isAuthenticated,
  validateRequest({
    body: z.object({
      payload: z.any(),
      signature: z.string(),
    }),
  }),
  async (req, res) => {
    try {
      const [webhook] = await db
        .select()
        .from(webhooks)
        .where(eq(webhooks.id, req.params.id));

      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }

      // Check if the user owns this webhook or is an admin
      if (webhook.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const { payload, signature } = req.body;
      const isValid = verifySignature(payload, signature, webhook.secret);

      res.json({ valid: isValid });
    } catch (error) {
      logger.error(`Error verifying webhook signature: ${error.message}`);
      res.status(500).json({ error: "Failed to verify webhook signature" });
    }
  }
);

export default router;