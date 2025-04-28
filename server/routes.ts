import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { setupSocketIO } from "./socketio";
import { setupAuth } from "./auth";
import { setupJwtAuth, verifyToken, authMiddleware } from "./auth-jwt";
import { setupVerificationRoutes } from "./auth/verification";
import { storage } from "./storage";
import { insertInvestmentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { adminRouter } from "./admin-routes";
import kycRoutes from './routes/kyc';
import investmentRoutes from './routes/investments';
import walletRoutes from './routes/walletRoutes';
import notificationRoutes from './routes/notificationRoutes';
import settingsRoutes from './routes/settingsRoutes';
import roiRoutes from './routes/roiRoutes';
import faqRoutes from './routes/faq';
import messageRoutes from './routes/messages';
import projectsRoutes from './routes/projects';
import emailCampaignRoutes from './routes/email-campaign';
import feedbackRoutes from './routes/feedback';
import adminLogsRoutes from './routes/adminLogs';
import issuesRoutes from './routes/issues';
import { withdrawalRouter } from './routes/withdrawals';
// Import ROI distribution routes using require instead of import
// Skip transactions import for now while we work on other fixes
// Import the new routes
import adminRoutes from './routes/admin.js';
import investorRoutes from './routes/investor.js';
import debugLoginRouter from './routes/debugLogin';
import investorRoiRoutes from './routes/investorRoiRoutes';
// Import crypto routes
import cryptoWalletRouter from './routes/crypto-wallets';
import cryptoTransactionRouter from './routes/crypto-transactions';
import { cryptoTransactionsRouter } from './routes/crypto-transactions';
import cryptoPaymentRouter from './routes/crypto-payments';
import cryptoInvestmentsRouter from './routes/crypto-investments';
import adminCryptoRouter from './routes/admin-crypto-routes';
// Import blockchain routes
import blockchainRouter from './routes/blockchain-routes';
// Import security and data protection routes
import smartContractRoutes from './routes/smart-contract-routes';
import adminKycSecurityRoutes from './routes/admin-kyc-routes';
import dataProtectionRoutes from './routes/data-protection-routes';
// Import stablecoin routes
import stablecoinRoutes from './routes/stablecoin-routes';
// Import milestone escrow routes
import milestoneEscrowRoutes from './routes/milestone-escrow-routes';
// Import crypto integration routes
import { cryptoIntegrationRouter } from './routes/crypto-integration-routes';
// Import admin crypto validation routes
import { adminCryptoValidateRouter } from './routes/admin-crypto-validate';
// Import crypto webhook routes
import { cryptoWebhookRouter } from './routes/crypto-webhooks';
// Import wallet transactions routes
import { walletTransactionsRouter } from './routes/wallet-transactions';
// Import CoinGate integration routes
import cryptoRoutes from './routes/crypto-routes';
import { webhookRouter } from './coingate/webhookHandler';
// Import Escrow smart contract routes
import escrowRouter from './routes/escrow-routes';
// Import Push notification routes
import { pushNotificationRouter } from './routes/push-notification-routes';
import { sendNotificationRouter } from './routes/send-notification-routes';
import { savePushTokenRouter } from './routes/save-push-token-routes';
import { pushNotificationSendRouter } from './routes/push-notification-send-routes';
// Import compliance routes
import complianceRoutes from './routes/compliance-routes';
import fs from 'fs';
import path from 'path';

// Import our new TypeScript routes
import adminKycRoutes from './api/admin/kyc';
import adminPropertiesRoutes from './api/admin/properties';
import investorKycRoutes from './api/investor/kyc';

// Import transaction and wallet routes
import transactionRouter from './transaction-routes';
import walletRouter from './wallet-routes';
import { notificationRouter } from './routes/notification-routes';
import { adminNotificationRouter } from './routes/admin-notification-routes';
import adminKycRouter from './routes/admin-kyc-routes';
import kycRouter from './routes/kyc';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up JWT authentication routes
  setupJwtAuth(app);
  
  // Set up session-based authentication routes (legacy)
  setupAuth(app);
  
  // Set up verification routes
  setupVerificationRoutes(app);
  
  // Set up admin routes
  app.use('/api/admin', adminRouter);
  
  // Set up new admin routes
  app.use('/api/admin', adminRoutes);
  console.log("Admin routes registered");
  
  // Set up admin KYC routes
  app.use('/api/admin/kyc', adminKycRouter);
  console.log("Admin KYC management routes registered");
  
  // Set up admin notification routes
  app.use('/api/admin/notifications', adminNotificationRouter);
  console.log("Admin notification routes registered");
  
  // Set up admin properties routes
  app.use('/api/admin/properties', adminPropertiesRoutes);
  
  // Set up new investor routes
  app.use('/api/investor', investorRoutes);
  console.log("Investor routes registered");
  
  // Set up investor KYC routes
  app.use('/api/investor/kyc', investorKycRoutes);
  console.log("Investor KYC routes registered");
  
  // Set up KYC routes
  app.use('/api/kyc', kycRouter);
  console.log("KYC routes registered");
  
  // Set up Investment routes
  app.use('/api/investments', investmentRoutes);
  console.log("Investment routes registered");
  
  // Set up Wallet routes (legacy routes)
  app.use('/api/wallet', walletRoutes);
  
  // Set up our new Wallet routes
  app.use('/api/wallet', walletRouter);
  
  // Register wallet transactions routes
  app.use('/api/wallet/transactions', walletTransactionsRouter);
  console.log("Wallet routes registered");
  
  // Set up Notification routes (legacy routes)
  app.use('/api/notifications', notificationRoutes);
  
  // Set up our new Notification routes
  app.use('/api/notifications', notificationRouter);
  console.log("Notification routes registered");
  
  // Set up Transaction routes
  app.use('/api/investor/transactions', transactionRouter);
  console.log("Transaction routes registered");
  
  // Set up Crypto Transaction routes
  app.use('/api/crypto/transactions', cryptoTransactionsRouter);
  console.log("Crypto transaction routes registered");
  
  // Set up Settings routes
  app.use('/api/settings', settingsRoutes);
  console.log("Settings routes registered");
  
  // Set up ROI calculation routes
  app.use('/api/roi', roiRoutes);
  console.log("ROI routes registered");
  
  // Set up Investor ROI routes
  app.use('/api/investor/roi', investorRoiRoutes);
  console.log("Investor ROI routes registered");
  
  // Create a router for ROI distribution
  const roiDistributionRouter = express.Router();
  
  // Setup ROI distribution endpoints
  roiDistributionRouter.post('/distribute', verifyToken, (req, res, next) => {
    // Check if user is admin
    if (req.jwtPayload?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  }, async (req, res) => {
    try {
      // Forward to the MongoDB ROI controller
      const { projectId, roiPercentage } = req.body;
      
      if (!projectId || !roiPercentage) {
        return res.status(400).json({ message: 'Project ID and ROI percentage are required' });
      }
      
      // For now, return a placeholder response
      res.status(200).json({
        message: 'ROI distribution processed',
        projectId,
        roiPercentage,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error in ROI distribution:', error);
      res.status(500).json({ message: 'Failed to distribute ROI' });
    }
  });
  
  // Project ROI history endpoint
  roiDistributionRouter.get('/project/:projectId', verifyToken, async (req, res) => {
    try {
      const { projectId } = req.params;
      
      // For now, return a placeholder response
      res.status(200).json({
        projectId,
        distributions: []
      });
    } catch (error) {
      console.error('Error fetching project ROI:', error);
      res.status(500).json({ message: 'Failed to fetch project ROI' });
    }
  });
  
  // Investor ROI history endpoint
  roiDistributionRouter.get('/investor/:investorId', verifyToken, async (req, res) => {
    try {
      const { investorId } = req.params;
      
      // For now, return a placeholder response
      res.status(200).json({
        investorId,
        distributions: []
      });
    } catch (error) {
      console.error('Error fetching investor ROI:', error);
      res.status(500).json({ message: 'Failed to fetch investor ROI' });
    }
  });
  
  // ROI summary endpoint
  roiDistributionRouter.get('/summary', verifyToken, (req, res, next) => {
    // Check if user is admin
    if (req.jwtPayload?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  }, async (req, res) => {
    try {
      // For now, return a placeholder response
      res.status(200).json({
        totalDistributed: 0,
        projectDistributions: [],
        monthlyDistributions: []
      });
    } catch (error) {
      console.error('Error fetching ROI summary:', error);
      res.status(500).json({ message: 'Failed to fetch ROI summary' });
    }
  });
  
  // ROI logs endpoint for admins
  roiDistributionRouter.get('/logs', verifyToken, (req, res, next) => {
    // Check if user is admin
    if (req.jwtPayload?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  }, async (req, res) => {
    try {
      // Import the controller
      const { getROIDistributionLogs } = require('./controllers/roiController');
      
      // Call the controller function
      await getROIDistributionLogs(req, res);
    } catch (error) {
      console.error('Error fetching ROI logs:', error);
      res.status(500).json({ message: 'Failed to fetch ROI logs', error: String(error) });
    }
  });
  
  // Set up ROI distribution routes
  app.use('/api/roi-distribution', roiDistributionRouter);
  console.log("ROI distribution routes registered");
  
  // Set up FAQ routes
  app.use('/api/faqs', faqRoutes);
  console.log("FAQ routes registered");
  
  // Set up Messaging routes
  app.use('/api/messages', messageRoutes);
  console.log("Message routes registered");
  
  // Set up Projects routes
  app.use('/api/projects', projectsRoutes);
  console.log("Projects routes registered");
  
  // Set up Debug Login routes
  app.use('/api/auth', debugLoginRouter);
  console.log("Debug login routes registered");
  
  // Set up Email Campaign routes
  app.use('/api/email-campaigns', emailCampaignRoutes);
  console.log("Email campaign routes registered");
  
  // Set up Feedback routes
  app.use('/api/feedback', feedbackRoutes);
  console.log("Feedback routes registered");
  
  // Set up Admin Logs routes
  app.use('/api/admin-logs', adminLogsRoutes);
  console.log("Admin logs routes registered");
  
  // Set up Issues routes
  app.use('/api/issues', issuesRoutes);
  console.log("Issues routes registered");
  
  // Set up Withdrawal request routes
  app.use('/api/withdrawals', withdrawalRouter);
  console.log("Withdrawal routes registered");
  
  // Set up Crypto Wallet routes
  app.use('/api/crypto-wallets', cryptoWalletRouter);
  console.log("Crypto wallet routes registered");
  
  // Set up Crypto Transaction routes
  app.use('/api/crypto-transactions', cryptoTransactionRouter);
  console.log("Crypto transaction routes registered");
  
  // Set up Crypto Payment routes
  app.use('/api/crypto-payments', cryptoPaymentRouter);
  console.log("Crypto payment routes registered");
  
  // Set up Crypto Investment routes
  app.use('/api/investments/crypto', cryptoInvestmentsRouter);
  console.log("Crypto investment routes registered");
  
  // Set up Blockchain routes
  app.use('/api/blockchain', blockchainRouter);
  console.log("Blockchain routes registered");
  
  // Set up Smart Contract Security routes
  app.use('/api/contracts', smartContractRoutes);
  console.log("Smart contract security routes registered");
  
  // Set up Enhanced KYC/AML routes for admin
  app.use('/api/admin/kyc-security', adminKycSecurityRoutes);
  console.log("Enhanced KYC security routes registered");
  
  // Set up Data Protection routes
  app.use('/api/privacy', dataProtectionRoutes);
  console.log("Data protection routes registered");
  
  // Set up Stablecoin routes
  app.use('/api/stablecoins', stablecoinRoutes);
  console.log("Stablecoin routes registered");
  
  // Set up Milestone Escrow routes
  app.use('/api/milestone-escrow', milestoneEscrowRoutes);
  console.log("Milestone escrow routes registered");
  
  // Set up Crypto Integration routes
  app.use('/api/admin/crypto-integration', cryptoIntegrationRouter);
  app.use('/api/crypto-integration', cryptoIntegrationRouter); // Also register at non-admin path for client code
  console.log("Crypto integration routes registered");
  
  // Set up Admin Crypto Dashboard routes
  app.use('/api/admin/crypto', adminCryptoRouter);
  console.log("Admin crypto dashboard routes registered");
  
  // Set up Admin Crypto Validation routes
  app.use('/api/admin/crypto-validate', adminCryptoValidateRouter);
  console.log("Crypto validation routes registered");
  
  // Set up Crypto Webhook routes
  app.use('/api/crypto/webhooks', cryptoWebhookRouter);
  app.use('/api/webhook', cryptoWebhookRouter); // Additional webhook path as requested
  console.log("Crypto webhook routes registered");
  
  // Set up CoinGate crypto payment routes
  app.use('/api/crypto', cryptoRoutes);
  console.log("CoinGate payment routes registered");
  
  // Set up CoinGate webhook handler
  app.use('/api/crypto', webhookRouter);
  console.log("CoinGate webhook handler registered");
  
  // Set up Push Notification routes
  app.use('/api/push-notifications', pushNotificationRouter);
  app.use('/api/notifications', sendNotificationRouter);
  app.use('/api', pushNotificationSendRouter);
  app.use('/api', savePushTokenRouter);
  console.log("Push notification routes registered");
  
  // Set up Compliance routes
  app.use('/api', complianceRoutes);
  console.log("Compliance logging routes registered");
  
  // Temporarily disabled MongoDB Transaction routes
  // app.use('/api/transactions', transactionRoutes);
  // console.log("MongoDB Transaction routes registered");
  
  // Test route for JWT auth
  app.get('/api/test-jwt', verifyToken, (req, res) => {
    res.json({
      message: "You are authenticated with JWT!",
      user: req.jwtPayload
    });
  });

  // Get all properties
  app.get("/api/properties", async (req, res) => {
    try {
      console.log("API request received: GET /api/properties with query:", req.query);
      
      const type = req.query.type as string | undefined;
      const location = req.query.location as string | undefined;
      const search = req.query.search as string | undefined;

      let properties;
      if (type && type !== "all") {
        console.log("Fetching properties by type:", type);
        properties = await storage.getPropertiesByType(type);
      } else if (location && location !== "all") {
        console.log("Fetching properties by location:", location);
        properties = await storage.getPropertiesByLocation(location);
      } else if (search) {
        console.log("Searching properties with query:", search);
        properties = await storage.searchProperties(search);
      } else {
        console.log("Fetching all properties");
        properties = await storage.getAllProperties();
      }

      console.log(`API response for GET /api/properties: Found ${properties ? properties.length : 0} properties`);
      if (properties && properties.length > 0) {
        console.log("Sample property:", JSON.stringify(properties[0], null, 2));
      } else {
        console.log("No properties found in database!");
      }
      
      // Send the response even if properties is null or undefined
      // Let's convert to an empty array in that case
      res.json(properties || []);
    } catch (error) {
      console.error("Error in /api/properties:", error);
      res.status(500).json({ message: "Failed to fetch properties", error: String(error) });
    }
  });

  // Get a specific property by ID
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const property = await storage.getProperty(propertyId);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Get user investments (JWT Protected)
  app.get("/api/investments", verifyToken, async (req, res) => {
    try {
      // Get user ID from JWT payload
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const investments = await storage.getUserInvestments(userId);
      
      // Get property details for each investment
      const investmentsWithDetails = await Promise.all(
        investments.map(async (investment) => {
          const property = await storage.getProperty(investment.propertyId);
          return {
            ...investment,
            property,
          };
        })
      );
      
      res.json(investmentsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  // Create a new investment (JWT Protected)
  app.post("/api/investments", verifyToken, async (req, res) => {
    try {
      // Get user ID from JWT payload
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Validate investment data
      const validatedData = insertInvestmentSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if property exists
      const property = await storage.getProperty(validatedData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      // Check if investment amount meets minimum
      if (validatedData.amount < property.minimumInvestment) {
        return res.status(400).json({ 
          message: `Minimum investment is $${property.minimumInvestment}` 
        });
      }
      
      // Create investment
      const investment = await storage.createInvestment(validatedData);
      
      // Create notification for the user
      await storage.createNotification({
        userId,
        type: "investment",
        title: "Investment Successful",
        message: `Your investment of $${validatedData.amount} in ${property.name} was successful.`,
        link: `/property/${property.id}`
      });
      
      // Get updated property
      const updatedProperty = await storage.getProperty(property.id);
      
      res.status(201).json({ 
        investment,
        property: updatedProperty
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid investment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create investment" });
      }
    }
  });
  
  // Get user notifications (JWT Protected)
  app.get("/api/notifications", verifyToken, async (req, res) => {
    try {
      // Get user ID from JWT payload
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const notifications = await storage.getUserNotifications(userId);
      
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  
  // Mark notification as read (JWT Protected)
  app.patch("/api/notifications/:id/read", verifyToken, async (req, res) => {
    try {
      // Get user ID from JWT payload
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const notificationId = parseInt(req.params.id);
      
      // Get notification to check ownership
      const notification = await storage.getUserNotifications(userId)
        .then(notifications => notifications.find(n => n.id === notificationId));
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found or does not belong to user" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification" });
    }
  });
  
  // Get specific investment by ID (JWT Protected)
  app.get("/api/investments/:id", verifyToken, async (req, res) => {
    try {
      // Get user ID from JWT payload
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const investmentId = parseInt(req.params.id);
      const investment = await storage.getInvestment(investmentId);
      
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      // Verify that the investment belongs to the authenticated user
      if (investment.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Get property details
      const property = await storage.getProperty(investment.propertyId);
      
      res.json({
        ...investment,
        property
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investment" });
    }
  });
  
  // Update investment returns (for simulation purposes) (JWT Protected)
  app.patch("/api/investments/:id/returns", verifyToken, async (req, res) => {
    try {
      // Get user ID from JWT payload
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const investmentId = parseInt(req.params.id);
      const { earnings, monthlyReturns } = req.body;
      
      const investment = await storage.getInvestment(investmentId);
      
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      // Verify that the investment belongs to the authenticated user
      if (investment.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Update the investment returns
      const updatedInvestment = await storage.updateInvestmentReturns(
        investmentId, 
        earnings, 
        monthlyReturns
      );
      
      res.json(updatedInvestment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update investment returns" });
    }
  });

  // Set up Smart Contract Escrow routes
  app.use('/api/escrow', escrowRouter);
  console.log("Smart contract escrow routes registered");

  const httpServer = createServer(app);
  
  // Set up Socket.io
  const io = setupSocketIO(httpServer);
  console.log("Socket.io initialized successfully");
  
  // Make socket.io instance available to application
  app.set('io', io);
  
  return httpServer;
}
