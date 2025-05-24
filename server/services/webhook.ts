import { db } from "../db";
import { webhooks, webhookDeliveries, webhookEventEnum } from "@shared/schema";
import crypto from "crypto";
import axios from "axios";
import { eq, sql, or, inArray } from "drizzle-orm";
import { logger } from "../utils/logger";

// Ensure we have crypto available
if (!crypto || !crypto.createHmac || !crypto.timingSafeEqual) {
  console.error("Crypto support is required for webhook functionality");
}

// Define event types for the system
export type SystemEvent = {
  type: typeof webhookEventEnum.enumValues[number];
  payload: Record<string, any>;
  occurredAt: Date;
};

/**
 * Create HMAC signature to secure webhook deliveries
 */
export function createSignature(payload: any, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  const signature = hmac.update(JSON.stringify(payload)).digest("hex");
  return signature;
}

/**
 * Verify signature from webhook deliveries
 */
export function verifySignature(payload: any, signature: string, secret: string): boolean {
  const expectedSignature = createSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Handle dispatching events to registered webhooks
 */
export async function handleEvent(event: SystemEvent) {
  try {
    const relevantHooks = await db
      .select()
      .from(webhooks)
      .where(
        sql`${event.type} = ANY(${webhooks.events}) OR ${webhooks.events} @> ARRAY['all']::text[]`
      );

    const deliveryPromises = relevantHooks.map(async (hook) => {
      const startTime = Date.now();
      let success = false;
      let responseStatus = null;
      let responseBody = null;
      let errorMessage = null;

      try {
        const eventPayload = {
          ...event.payload,
          event_type: event.type,
          occurred_at: event.occurredAt.toISOString(),
        };

        const response = await axios.post(hook.url, eventPayload, {
          headers: {
            "X-iREVA-Signature": createSignature(eventPayload, hook.secret),
            "Content-Type": "application/json",
            "User-Agent": "iREVA-Webhooks/1.0",
          },
          timeout: 5000, // 5 second timeout
        });

        success = response.status >= 200 && response.status < 300;
        responseStatus = response.status;
        responseBody = JSON.stringify(response.data);
      } catch (error: any) {
        errorMessage = error?.message || "Unknown error";
        logger.error(`Webhook delivery error: ${errorMessage}`);
      }

      const duration = Date.now() - startTime;

      // Log the delivery attempt
      const [delivery] = await db
        .insert(webhookDeliveries)
        .values({
          webhookId: hook.id,
          eventType: event.type,
          requestPayload: event.payload,
          responseStatus,
          responseBody,
          duration,
          success,
          errorMessage,
        })
        .returning();

      // Update the webhook with the latest delivery information
      await db
        .update(webhooks)
        .set({
          lastTriggeredAt: new Date(),
          ...(success
            ? { failureCount: 0 }
            : {
                failureCount: hook.failureCount + 1,
                lastError: errorMessage,
              }),
        })
        .where(eq(webhooks.id, hook.id));

      return delivery;
    });

    const deliveryResults = await Promise.allSettled(deliveryPromises);
    
    // Log any errors in the delivery process
    deliveryResults.forEach((result, index) => {
      if (result.status === "rejected") {
        logger.error(`Failed to deliver webhook ${relevantHooks[index].id}: ${result.reason}`);
      }
    });

    return deliveryResults;
  } catch (error) {
    logger.error(`Error handling webhook event: ${error.message}`);
    throw error;
  }
}

/**
 * Trigger a system event that will be dispatched to relevant webhooks
 */
export async function triggerEvent(
  type: typeof webhookEventEnum.enumValues[number],
  payload: Record<string, any>
) {
  const event: SystemEvent = {
    type,
    payload,
    occurredAt: new Date(),
  };

  return handleEvent(event);
}

/**
 * Get all registered webhooks
 */
export async function getWebhooks(userId?: string) {
  if (userId) {
    return db.select().from(webhooks).where(eq(webhooks.userId, userId));
  }
  return db.select().from(webhooks);
}

/**
 * Get webhook deliveries for a specific webhook
 */
export async function getWebhookDeliveries(webhookId: string) {
  return db
    .select()
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.webhookId, webhookId))
    .orderBy(sql`${webhookDeliveries.deliveredAt} DESC`)
    .limit(100);
}

/**
 * Retry a failed webhook delivery
 */
export async function retryWebhookDelivery(deliveryId: string) {
  const [delivery] = await db
    .select()
    .from(webhookDeliveries)
    .where(eq(webhookDeliveries.id, deliveryId));

  if (!delivery) {
    throw new Error("Webhook delivery not found");
  }

  const [webhook] = await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.id, delivery.webhookId));

  if (!webhook) {
    throw new Error("Webhook not found");
  }

  const event: SystemEvent = {
    type: delivery.eventType,
    payload: delivery.requestPayload,
    occurredAt: new Date(),
  };

  return handleEvent(event);
}