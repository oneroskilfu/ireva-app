import type { Express } from "express";
import Stripe from "stripe";
import { db } from "../db";
import { stripePayments, transactions, wallets, investments } from "@shared/schema";
import { eq } from "drizzle-orm";

// Initialize Stripe - will need STRIPE_SECRET_KEY from user
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10",
  });
}

export function registerStripeRoutes(app: Express) {
  // Create payment intent for deposits
  app.post("/api/payments/create-deposit", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ 
          error: "Stripe not configured. Please provide STRIPE_SECRET_KEY." 
        });
      }

      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { amount, currency = 'USD' } = req.body;
      const userId = req.user!.id;

      if (!amount || amount < 1) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          userId: userId.toString(),
          type: 'deposit',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Store in database
      await db.insert(stripePayments).values({
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: amount.toString(),
        currency,
        status: 'pending',
        paymentType: 'deposit',
        metadata: {
          clientSecret: paymentIntent.client_secret,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });

    } catch (error) {
      console.error("Error creating deposit payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Create payment intent for investments
  app.post("/api/payments/create-investment", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ 
          error: "Stripe not configured. Please provide STRIPE_SECRET_KEY." 
        });
      }

      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { amount, propertyId, currency = 'USD' } = req.body;
      const userId = req.user!.id;

      if (!amount || amount < 1 || !propertyId) {
        return res.status(400).json({ error: "Invalid amount or property ID" });
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        metadata: {
          userId: userId.toString(),
          propertyId: propertyId.toString(),
          type: 'investment',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Store in database
      await db.insert(stripePayments).values({
        userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: amount.toString(),
        currency,
        status: 'pending',
        paymentType: 'investment',
        metadata: {
          propertyId,
          clientSecret: paymentIntent.client_secret,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });

    } catch (error) {
      console.error("Error creating investment payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Stripe webhook handler
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret) {
        console.error("Stripe webhook secret not configured");
        return res.status(500).json({ error: "Webhook secret not configured" });
      }

      // Verify webhook signature
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return res.status(400).json({ error: "Invalid signature" });
      }

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.canceled':
          await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });

    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Handle successful payments
  async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const userId = parseInt(paymentIntent.metadata.userId);
    const paymentType = paymentIntent.metadata.type;

    // Update payment record
    await db
      .update(stripePayments)
      .set({ status: 'succeeded' })
      .where(eq(stripePayments.stripePaymentIntentId, paymentIntent.id));

    if (paymentType === 'deposit') {
      // Add funds to user wallet
      const amount = paymentIntent.amount / 100; // Convert from cents
      
      // Get or create wallet
      let [userWallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, userId));

      if (!userWallet) {
        [userWallet] = await db
          .insert(wallets)
          .values({
            userId,
            balance: amount.toString(),
          })
          .returning();
      } else {
        await db
          .update(wallets)
          .set({
            balance: (parseFloat(userWallet.balance) + amount).toString(),
            lastUpdated: new Date(),
          })
          .where(eq(wallets.id, userWallet.id));
      }

      // Create transaction record
      await db.insert(transactions).values({
        userId,
        type: 'deposit',
        amount: amount.toString(),
        status: 'completed',
        description: 'Deposit via Stripe',
        reference: paymentIntent.id,
      });

      console.log(`✅ Deposit successful: $${amount} for user ${userId}`);

    } else if (paymentType === 'investment') {
      // Process investment
      const propertyId = parseInt(paymentIntent.metadata.propertyId);
      const amount = paymentIntent.amount / 100;

      // Create investment record
      const [investment] = await db
        .insert(investments)
        .values({
          userId,
          propertyId,
          amount: amount.toString(),
          status: 'confirmed',
          paymentId: paymentIntent.id,
        })
        .returning();

      // Create transaction record
      await db.insert(transactions).values({
        userId,
        investmentId: investment.id,
        type: 'investment',
        amount: amount.toString(),
        status: 'completed',
        description: `Investment in property ${propertyId}`,
        reference: paymentIntent.id,
      });

      // Update payment record with investment ID
      await db
        .update(stripePayments)
        .set({ investmentId: investment.id })
        .where(eq(stripePayments.stripePaymentIntentId, paymentIntent.id));

      console.log(`✅ Investment successful: $${amount} for property ${propertyId} by user ${userId}`);
    }
  }

  // Handle failed payments
  async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    await db
      .update(stripePayments)
      .set({ status: 'failed' })
      .where(eq(stripePayments.stripePaymentIntentId, paymentIntent.id));

    console.log(`❌ Payment failed: ${paymentIntent.id}`);
  }

  // Handle canceled payments
  async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
    await db
      .update(stripePayments)
      .set({ status: 'canceled' })
      .where(eq(stripePayments.stripePaymentIntentId, paymentIntent.id));

    console.log(`🚫 Payment canceled: ${paymentIntent.id}`);
  }

  // Get payment history for user
  app.get("/api/payments/history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userId = req.user!.id;
      const { page = 1, limit = 20 } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const payments = await db
        .select()
        .from(stripePayments)
        .where(eq(stripePayments.userId, userId))
        .orderBy(stripePayments.createdAt)
        .limit(limitNum)
        .offset(offset);

      res.json(payments);

    } catch (error) {
      console.error("Error fetching payment history:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });
}