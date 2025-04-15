import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertInvestmentSchema, 
  insertForumPostSchema, 
  insertQAQuestionSchema, 
  insertQAAnswerSchema,
  insertSupportTicketSchema,
  insertSupportMessageSchema,
  insertSupportFaqSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import paystackController from "./paystack";
import { 
  getPropertyRecommendations,
  analyzeUserBehavior,
  UserPreferences
} from "./services/openai";

// Import route handlers
import authRouter from './routes/auth'; // Updated import for TypeScript
import usersRoutes from './routes/users.js';
import projectsRoutes from './routes/projects.js';
import propertiesRoutes from './routes/properties.js';
import investmentsRoutes from './routes/investments.js';
import roiRoutes from './routes/roi.js';
import messagesRoutes from './routes/messages.js';
import {
  setupMFA,
  initiateMFAVerification,
  verifyMFACode,
  disableMFA,
  requireMFAVerification,
  MFAVerificationStatus,
  getMFAVerificationFromSession
} from "./mfa";

// Market data types
interface MarketDataPoint {
  date: string;
  value: number;
}

interface PropertyMarketData {
  location: string;
  priceIndex: MarketDataPoint[];
  rentIndex: MarketDataPoint[];
  supplyIndex: MarketDataPoint[];
  demandIndex: MarketDataPoint[];
  yoyChange: number;
}

// Generate realistic market data for Nigerian cities
function generateMarketData(): PropertyMarketData[] {
  const locations = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu", "Calabar"];
  const currentDate = new Date();
  const startDate = new Date(currentDate);
  startDate.setFullYear(currentDate.getFullYear() - 5); // 5 years of data
  
  return locations.map(location => {
    // Base values and growth rates vary by city
    let priceBase = 100;
    let rentBase = 100;
    let supplyBase = 100;
    let demandBase = 100;
    
    // Assign different characteristics to different cities
    let priceGrowthRate = 0;
    let rentGrowthRate = 0;
    let supplyGrowthRate = 0;
    let demandGrowthRate = 0;
    
    // City-specific market characteristics
    switch(location) {
      case "Lagos":
        priceGrowthRate = 0.8; // 0.8% monthly growth
        rentGrowthRate = 0.7;
        supplyGrowthRate = 0.3;
        demandGrowthRate = 0.9;
        break;
      case "Abuja":
        priceGrowthRate = 0.7;
        rentGrowthRate = 0.6;
        supplyGrowthRate = 0.4;
        demandGrowthRate = 0.7;
        break;
      case "Port Harcourt":
        priceGrowthRate = 0.5;
        rentGrowthRate = 0.5;
        supplyGrowthRate = 0.2;
        demandGrowthRate = 0.6;
        break;
      case "Ibadan":
        priceGrowthRate = 0.4;
        rentGrowthRate = 0.5;
        supplyGrowthRate = 0.3;
        demandGrowthRate = 0.5;
        break;
      case "Kano":
        priceGrowthRate = 0.3;
        rentGrowthRate = 0.4;
        supplyGrowthRate = 0.2;
        demandGrowthRate = 0.4;
        break;
      case "Enugu":
        priceGrowthRate = 0.4;
        rentGrowthRate = 0.4;
        supplyGrowthRate = 0.2;
        demandGrowthRate = 0.5;
        break;
      case "Calabar":
        priceGrowthRate = 0.4;
        rentGrowthRate = 0.3;
        supplyGrowthRate = 0.2;
        demandGrowthRate = 0.4;
        break;
    }
    
    // Generate monthly data points for the past 5 years
    const priceIndex: MarketDataPoint[] = [];
    const rentIndex: MarketDataPoint[] = [];
    const supplyIndex: MarketDataPoint[] = [];
    const demandIndex: MarketDataPoint[] = [];
    
    // Add some randomness to make the data more realistic
    function addNoise(value: number): number {
      // Add +/- 0.5% random noise
      return value * (1 + (Math.random() * 0.01 - 0.005));
    }
    
    // Generate monthly data for 5 years
    for (let i = 0; i <= 60; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      
      // Apply compounding growth with randomness
      priceBase = addNoise(priceBase * (1 + priceGrowthRate / 100));
      rentBase = addNoise(rentBase * (1 + rentGrowthRate / 100));
      supplyBase = addNoise(supplyBase * (1 + supplyGrowthRate / 100));
      demandBase = addNoise(demandBase * (1 + demandGrowthRate / 100));
      
      // Format date as YYYY-MM
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      priceIndex.push({ date: dateStr, value: Math.round(priceBase * 100) / 100 });
      rentIndex.push({ date: dateStr, value: Math.round(rentBase * 100) / 100 });
      supplyIndex.push({ date: dateStr, value: Math.round(supplyBase * 100) / 100 });
      demandIndex.push({ date: dateStr, value: Math.round(demandBase * 100) / 100 });
    }
    
    // Calculate year-over-year change (comparing current with 12 months ago)
    const latestPrice = priceIndex[priceIndex.length - 1].value;
    const yearAgoPrice = priceIndex[priceIndex.length - 13].value;
    const yoyChange = Math.round(((latestPrice - yearAgoPrice) / yearAgoPrice * 100) * 10) / 10;
    
    return {
      location,
      priceIndex,
      rentIndex,
      supplyIndex,
      demandIndex,
      yoyChange
    };
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Admin middleware to check if the user is an admin
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to access this resource" });
    }
    
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "You don't have permission to access this resource" });
    }
    
    next();
  };

  // Get all properties
  app.get("/api/properties", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const location = req.query.location as string | undefined;
      const search = req.query.search as string | undefined;

      let properties;
      if (type && type !== "all") {
        properties = await storage.getPropertiesByType(type);
      } else if (location && location !== "all") {
        properties = await storage.getPropertiesByLocation(location);
      } else if (search) {
        properties = await storage.searchProperties(search);
      } else {
        properties = await storage.getAllProperties();
      }

      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
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

  // Get user investments
  app.get("/api/investments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = (req.user as Express.User).id;
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

  // Create a new investment
  app.post("/api/investments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = (req.user as Express.User).id;
      
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

  // Payment processing with Paystack
  app.post("/api/payments/initialize", paystackController.initializePayment);
  app.post("/api/payments/verify", paystackController.verifyPayment);
  app.get("/api/payments/transactions", paystackController.getTransactions);
  
  // User wallet management endpoints
  app.get("/api/wallet", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        walletBalance: user.walletBalance,
        kycStatus: user.kycStatus 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet data" });
    }
  });
  
  // Fund wallet endpoint - initializes Paystack payment to add funds to wallet
  app.post("/api/wallet/fund", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Forward request to Paystack with metadata indicating this is a wallet funding
      const modifiedBody = {
        ...req.body,
        metadata: {
          transaction_type: "wallet_funding",
          user_id: req.user.id
        }
      };
      
      req.body = modifiedBody;
      return paystackController.initializePayment(req, res);
    } catch (error) {
      res.status(500).json({ message: "Failed to initiate wallet funding" });
    }
  });
  
  // Withdraw from wallet endpoint
  app.post("/api/wallet/withdraw", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { amount, bankName, accountNumber, accountName } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.walletBalance < amount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      
      // In a real application, you would initiate a withdrawal via Paystack or other payment processor
      // For this demo, we'll just reduce the wallet balance
      const updatedUser = await storage.updateUser(user.id, {
        walletBalance: user.walletBalance - amount,
        bankName: bankName || user.bankName,
        bankAccountNumber: accountNumber || user.bankAccountNumber,
        bankAccountName: accountName || user.bankAccountName
      });
      
      res.json({ 
        success: true,
        message: "Withdrawal initiated successfully",
        newBalance: updatedUser?.walletBalance
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });
  
  // KYC verification endpoints
  app.post("/api/kyc/submit", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { idType, idNumber, phoneNumber } = req.body;
      
      if (!idType || !idNumber || !phoneNumber) {
        return res.status(400).json({ message: "Missing required KYC information" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user KYC information
      const updatedUser = await storage.updateUser(user.id, {
        phoneNumber,
        kycStatus: "pending",
        kycIdType: idType,
        kycIdNumber: idNumber
      });
      
      res.json({
        success: true,
        message: "KYC submission successful and pending verification",
        kycStatus: updatedUser?.kycStatus
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit KYC information" });
    }
  });
  
  // Admin endpoint to approve/reject KYC (admin only)
  app.post("/api/admin/kyc/:userId/:action", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const action = req.params.action;
      
      if (action !== "approve" && action !== "reject") {
        return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const kycStatus = action === "approve" ? "verified" : "rejected";
      const updatedUser = await storage.updateUser(userId, {
        kycStatus,
        kycVerificationDate: new Date()
      });
      
      res.json({
        success: true,
        message: `KYC ${action}d successfully`,
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ message: `Failed to ${req.params.action} KYC` });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/portfolio-performance", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = (req.user as Express.User).id;
      const investments = await storage.getUserInvestments(userId);
      
      // Calculate portfolio metrics
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      const totalReturns = investments.reduce((sum, inv) => sum + (inv.returns || 0), 0);
      const roi = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
      
      // Group investments by property type for asset allocation
      const propertiesPromises = investments.map(inv => storage.getProperty(inv.propertyId));
      const properties = await Promise.all(propertiesPromises);
      
      const assetAllocation = properties.reduce((acc, property, index) => {
        if (!property) return acc;
        
        const type = property.type;
        const amount = investments[index].amount;
        
        acc[type] = (acc[type] || 0) + amount;
        return acc;
      }, {} as Record<string, number>);
      
      // Format asset allocation for charts
      const assetAllocationData = Object.entries(assetAllocation).map(([type, amount]) => ({
        type,
        amount,
        percentage: (amount / totalInvested) * 100
      }));
      
      // Monthly performance (simulated data - in a real application this would come from historical data)
      const monthlyPerformance = Array.from({ length: 12 }).map((_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - 11 + i);
        
        return {
          month: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
          return: (5 + Math.random() * 3).toFixed(2) // Simulated returns
        };
      });
      
      res.json({
        totalInvested,
        totalReturns,
        roi,
        assetAllocation: assetAllocationData,
        monthlyPerformance,
        investmentCount: investments.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio performance data" });
    }
  });
  
  app.get("/api/analytics/investment-projections", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = (req.user as Express.User).id;
      const investments = await storage.getUserInvestments(userId);
      
      // Calculate projections for the next 5 years
      const projections = [];
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      
      for (let year = 1; year <= 5; year++) {
        // Assuming an average annual return rate of 8%
        const annualReturnRate = 0.08;
        const projectedValue = totalInvested * Math.pow(1 + annualReturnRate, year);
        const projectedReturn = projectedValue - totalInvested;
        
        projections.push({
          year,
          projectedValue,
          projectedReturn,
          annualReturnRate: annualReturnRate * 100
        });
      }
      
      res.json(projections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investment projections" });
    }
  });
  
  // ===== MFA (MULTI-FACTOR AUTHENTICATION) ROUTES =====
  
  // Get MFA status for the current user
  app.get("/api/mfa/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const mfaStatus = getMFAVerificationFromSession(req);
      
      res.json({
        enabled: user.mfaEnabled,
        primaryMethod: user.mfaPrimaryMethod,
        secondaryMethod: user.mfaSecondaryMethod,
        verified: mfaStatus.status === MFAVerificationStatus.VERIFIED && mfaStatus.userId === user.id,
        lastVerified: user.mfaLastVerified
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch MFA status" });
    }
  });
  
  // Setup MFA
  app.post("/api/mfa/setup", async (req, res) => {
    try {
      return await setupMFA(req, res);
    } catch (error) {
      res.status(500).json({ message: "Failed to setup MFA" });
    }
  });
  
  // Initiate MFA verification
  app.post("/api/mfa/initiate", async (req, res) => {
    try {
      return await initiateMFAVerification(req, res);
    } catch (error) {
      res.status(500).json({ message: "Failed to initiate MFA verification" });
    }
  });
  
  // Verify MFA code
  app.post("/api/mfa/verify", async (req, res) => {
    try {
      return await verifyMFACode(req, res);
    } catch (error) {
      res.status(500).json({ message: "Failed to verify MFA code" });
    }
  });
  
  // Disable MFA
  app.post("/api/mfa/disable", async (req, res) => {
    try {
      return await disableMFA(req, res);
    } catch (error) {
      res.status(500).json({ message: "Failed to disable MFA" });
    }
  });
  
  // Protected route that requires MFA verification
  app.get("/api/protected", requireMFAVerification, (req, res) => {
    res.json({ 
      message: "You've successfully accessed a protected resource using MFA!",
      user: req.user
    });
  });
  
  // ===== AI RECOMMENDATION ENGINE ROUTES =====
  
  // Get AI-powered property recommendations based on user preferences
  app.get("/api/recommendations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = (req.user as Express.User).id;
      
      // Get user preferences from query parameters or analyze user behavior
      let preferences: UserPreferences;
      
      if (
        req.query.riskTolerance && 
        req.query.investmentGoal && 
        req.query.investmentHorizon
      ) {
        // Use provided preferences
        preferences = {
          riskTolerance: req.query.riskTolerance as "low" | "medium" | "high",
          investmentGoal: req.query.investmentGoal as "income" | "growth" | "balanced",
          investmentHorizon: req.query.investmentHorizon as "short" | "medium" | "long",
          preferredLocations: req.query.locations ? (req.query.locations as string).split(',') : undefined,
          preferredPropertyTypes: req.query.propertyTypes ? (req.query.propertyTypes as string).split(',') : undefined,
          minReturn: req.query.minReturn ? parseFloat(req.query.minReturn as string) : undefined,
          maxInvestment: req.query.maxInvestment ? parseFloat(req.query.maxInvestment as string) : undefined
        };
      } else {
        // Analyze user behavior to infer preferences
        const inferredPreferences = await analyzeUserBehavior(userId);
        
        if (!inferredPreferences) {
          // Not enough data to analyze, use default preferences
          preferences = {
            riskTolerance: "medium",
            investmentGoal: "balanced",
            investmentHorizon: "medium"
          };
        } else {
          preferences = inferredPreferences;
        }
      }
      
      // Get recommendations based on preferences
      const recommendations = await getPropertyRecommendations(userId, preferences);
      
      // Return recommendations with details
      res.json({
        preferences,
        recommendations
      });
    } catch (error) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ message: "Failed to generate property recommendations" });
    }
  });
  
  // Save or update user preferences
  app.post("/api/user/preferences", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = (req.user as Express.User).id;
      const preferences: UserPreferences = req.body;
      
      // Validate required fields
      if (!preferences.riskTolerance || !preferences.investmentGoal || !preferences.investmentHorizon) {
        return res.status(400).json({ message: "Missing required preference fields" });
      }
      
      // In a real application, you would save these preferences to the database
      // For this demo, we'll just return the preferences
      
      // Get recommendations based on new preferences
      const recommendations = await getPropertyRecommendations(userId, preferences);
      
      res.json({
        success: true,
        message: "Preferences updated successfully",
        preferences,
        recommendations
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });
  
  // ===== MARKET DATA ROUTES =====
  
  // Get all market data
  app.get("/api/market-data", async (req, res) => {
    try {
      // Generate market data for Nigeria's property market
      const marketData = generateMarketData();
      res.json(marketData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // Get market data for a specific location
  app.get("/api/market-data/:location", async (req, res) => {
    try {
      const location = req.params.location;
      const marketData = generateMarketData();
      const locationData = marketData.find(data => data.location.toLowerCase() === location.toLowerCase());
      
      if (!locationData) {
        return res.status(404).json({ message: "Location data not found" });
      }
      
      res.json(locationData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market data for location" });
    }
  });
  
  // ===== SOCIAL AUTHENTICATION ROUTES =====
  
  // Social login endpoint
  app.post("/api/social-login", async (req, res) => {
    try {
      const { provider, token, userData } = req.body;
      
      if (!provider || !token || !userData || !userData.email) {
        return res.status(400).json({ message: "Missing social authentication data" });
      }
      
      // Check if user exists with this email
      let user = await storage.getUserByEmail(userData.email);
      
      if (user) {
        // User exists, login
        req.login(user, (err) => {
          if (err) return res.status(500).json({ message: "Authentication failed" });
          return res.json(user);
        });
      } else {
        // New user, create account
        const username = userData.email.split("@")[0] + "-" + Math.random().toString(36).substring(2, 8);
        
        // Generate a random password for the user (they'll use social login, not password)
        const randomPassword = Math.random().toString(36).substring(2, 15) + 
                               Math.random().toString(36).substring(2, 15);
        
        // Create user record
        const newUser = await storage.createUser({
          username,
          email: userData.email,
          password: randomPassword, // This will be hashed in the storage implementation
          firstName: userData.name?.split(" ")[0] || null,
          lastName: userData.name?.split(" ").slice(1).join(" ") || null,
          profileImage: userData.photoURL || null,
          socialProvider: provider,
          socialId: token,
        });
        
        // Log in the new user
        req.login(newUser, (err) => {
          if (err) return res.status(500).json({ message: "Authentication failed" });
          return res.status(201).json(newUser);
        });
      }
    } catch (error) {
      console.error("Social login error:", error);
      res.status(500).json({ message: "Social authentication failed" });
    }
  });

  // ===== ADMIN ROUTES =====
  
  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get a specific user by ID (admin only)
  app.get("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Update a user (admin only)
  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // Don't allow password update through this endpoint
      if (userData.password) {
        delete userData.password;
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Delete a user (admin only)
  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Create a new property (admin only)
  app.post("/api/admin/properties", isAdmin, async (req, res) => {
    try {
      const property = await storage.createProperty(req.body);
      res.status(201).json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to create property" });
    }
  });
  
  // Update a property (admin only)
  app.patch("/api/admin/properties/:id", isAdmin, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const updatedProperty = await storage.updateProperty(propertyId, req.body);
      
      if (!updatedProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(updatedProperty);
    } catch (error) {
      res.status(500).json({ message: "Failed to update property" });
    }
  });
  
  // Delete a property (admin only)
  app.delete("/api/admin/properties/:id", isAdmin, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      const success = await storage.deleteProperty(propertyId);
      
      if (!success) {
        return res.status(404).json({ message: "Property not found or cannot be deleted (has investments)" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });
  
  // Get all investments (admin only)
  app.get("/api/admin/investments", isAdmin, async (req, res) => {
    try {
      const investments = await storage.getAllInvestments();
      
      // Get user and property details for each investment
      const investmentsWithDetails = await Promise.all(
        investments.map(async (investment) => {
          const user = await storage.getUser(investment.userId);
          const property = await storage.getProperty(investment.propertyId);
          return {
            ...investment,
            user,
            property,
          };
        })
      );
      
      res.json(investmentsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });
  
  // Update an investment (admin only)
  app.patch("/api/admin/investments/:id", isAdmin, async (req, res) => {
    try {
      const investmentId = parseInt(req.params.id);
      const updatedInvestment = await storage.updateInvestment(investmentId, req.body);
      
      if (!updatedInvestment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      res.json(updatedInvestment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update investment" });
    }
  });
  
  // Delete an investment (admin only)
  app.delete("/api/admin/investments/:id", isAdmin, async (req, res) => {
    try {
      const investmentId = parseInt(req.params.id);
      const success = await storage.deleteInvestment(investmentId);
      
      if (!success) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete investment" });
    }
  });
  
  // Get admin dashboard stats
  app.get("/api/admin/dashboard", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const properties = await storage.getAllProperties();
      const investments = await storage.getAllInvestments();
      
      // Calculate statistics
      const totalUsers = users.length;
      const totalProperties = properties.length;
      const totalInvestments = investments.length;
      const totalInvestedAmount = investments.reduce((sum, inv) => sum + inv.amount, 0);
      
      // Property stats by type
      const propertiesByType = properties.reduce((acc, property) => {
        acc[property.type] = (acc[property.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Investment stats by status
      const investmentsByStatus = investments.reduce((acc, investment) => {
        const status = investment.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      res.json({
        totalUsers,
        totalProperties,
        totalInvestments,
        totalInvestedAmount,
        propertiesByType,
        investmentsByStatus,
        recentUsers: users.slice(-5).reverse(),
        recentInvestments: await Promise.all(
          investments.slice(-5).reverse().map(async (investment) => {
            const user = await storage.getUser(investment.userId);
            const property = await storage.getProperty(investment.propertyId);
            return {
              ...investment,
              user: user ? { id: user.id, username: user.username } : null,
              property: property ? { id: property.id, name: property.name } : null,
            };
          })
        )
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin dashboard data" });
    }
  });

  app.get("/api/analytics/investment-risk", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = (req.user as Express.User).id;
      const investments = await storage.getUserInvestments(userId);
      
      // Get properties to calculate risk scores
      const propertiesPromises = investments.map(inv => storage.getProperty(inv.propertyId));
      const properties = await Promise.all(propertiesPromises);
      
      // Calculate risk metrics for each investment
      const riskAnalysis = investments.map((investment, index) => {
        const property = properties[index];
        if (!property) return null;
        
        // Calculate a risk score based on property type and location (simplified model)
        let riskScore;
        
        switch (property.type) {
          case "residential":
            riskScore = 3;
            break;
          case "commercial":
            riskScore = 5;
            break;
          case "industrial":
            riskScore = 6;
            break;
          case "mixed-use":
            riskScore = 4;
            break;
          default:
            riskScore = 5;
        }
        
        // Adjust risk based on location (simplified)
        if (property.location.includes("New York") || property.location.includes("San Francisco")) {
          riskScore -= 1; // Lower risk in established markets
        } else if (property.location.includes("Detroit") || property.location.includes("Cleveland")) {
          riskScore += 1; // Higher risk in less established markets
        }
        
        // Ensure risk score is within bounds
        riskScore = Math.max(1, Math.min(10, riskScore));
        
        return {
          propertyId: property.id,
          propertyName: property.name,
          investmentId: investment.id,
          amount: investment.amount,
          riskScore,
          riskLevel: riskScore <= 3 ? 'Low' : riskScore <= 6 ? 'Moderate' : 'High',
          diversificationImpact: investment.amount / investments.reduce((sum, inv) => sum + inv.amount, 0) * 100
        };
      }).filter(Boolean);
      
      // Overall portfolio risk score (weighted average)
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      const overallRiskScore = riskAnalysis.reduce((score, analysis) => {
        if (!analysis) return score;
        return score + (analysis.riskScore * analysis.amount) / totalInvested;
      }, 0);
      
      res.json({
        investments: riskAnalysis,
        overallRiskScore,
        riskLevel: overallRiskScore <= 3 ? 'Low' : overallRiskScore <= 6 ? 'Moderate' : 'High',
        diversificationScore: Math.min(100, riskAnalysis.length * 10) // Simple diversification score
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investment risk data" });
    }
  });

  // Comprehensive Analytics Dashboard Data
  app.get("/api/analytics/dashboard", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = (req.user as Express.User).id;
      const investments = await storage.getUserInvestments(userId);
      
      // Early return if no investments
      if (investments.length === 0) {
        return res.json({
          totalInvested: 0,
          totalProjectedReturns: 0,
          avgReturnRate: 0,
          riskAssessment: { low: 0, medium: 0, high: 0 },
          portfolioAllocation: [],
          monthlyReturns: [],
          performanceByType: [],
          topPerformingInvestments: []
        });
      }
      
      // Get properties data for analytics
      const propertiesPromises = investments.map(inv => storage.getProperty(inv.propertyId));
      const properties = await Promise.all(propertiesPromises);
      
      // Combine investment data with property data
      const investmentsWithProperties = investments.map((investment, index) => {
        return {
          ...investment,
          property: properties[index]
        };
      }).filter(inv => inv.property); // Filter out investments with missing property data
      
      // Calculate basic metrics
      const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
      
      // Calculate projected returns based on property target returns
      const totalProjectedReturns = investmentsWithProperties.reduce((sum, inv) => {
        if (!inv.property) return sum;
        const targetReturn = parseFloat(inv.property.targetReturn);
        return sum + (inv.amount * targetReturn / 100);
      }, 0);
      
      const avgReturnRate = totalInvested > 0 ? 
        (totalProjectedReturns / totalInvested) * 100 : 0;
      
      // Calculate risk assessment
      const riskAssessment = {
        low: 0,    // Low risk (returns < 10%)
        medium: 0, // Medium risk (returns 10-13%)
        high: 0    // High risk (returns > 13%)
      };
      
      investmentsWithProperties.forEach(inv => {
        if (!inv.property) return;
        const returnRate = parseFloat(inv.property.targetReturn);
        
        if (returnRate < 10) {
          riskAssessment.low += inv.amount;
        } else if (returnRate <= 13) {
          riskAssessment.medium += inv.amount;
        } else {
          riskAssessment.high += inv.amount;
        }
      });
      
      // Portfolio allocation by property type
      const allocationByType = investmentsWithProperties.reduce((acc, inv) => {
        if (!inv.property) return acc;
        const type = inv.property.type;
        if (!acc[type]) {
          acc[type] = {
            amount: 0,
            count: 0,
            returns: 0
          };
        }
        
        acc[type].amount += inv.amount;
        acc[type].count += 1;
        acc[type].returns += (inv.amount * parseFloat(inv.property.targetReturn)) / 100;
        
        return acc;
      }, {} as Record<string, { amount: number, count: number, returns: number }>);
      
      // Format for charts
      const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
      
      const portfolioAllocation = Object.entries(allocationByType).map(([type, data], index) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: data.amount,
        type,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }));
      
      // Performance by property type
      const performanceByType = Object.entries(allocationByType).map(([type, data]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        returns: parseFloat((data.returns / data.amount * 100).toFixed(1)),
        invested: data.amount
      }));
      
      // Top performing investments
      const topPerformingInvestments = [...investmentsWithProperties]
        .filter(inv => inv.property !== undefined)
        .sort((a, b) => {
          // Both properties are guaranteed to exist due to the filter above
          return parseFloat(b.property!.targetReturn) - parseFloat(a.property!.targetReturn);
        })
        .slice(0, 3);
      
      // Monthly returns data
      const monthsAgo = [5, 4, 3, 2, 1, 0];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const now = new Date();
      const monthlyReturns = monthsAgo.map(monthsBack => {
        const month = new Date(now);
        month.setMonth(now.getMonth() - monthsBack);
        
        // Use a sensible calculation based on portfolio size
        // In a real app, this would be actual historical returns
        const baseReturn = totalProjectedReturns / 12;
        const variance = baseReturn * 0.2; // 20% variance 
        const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
        
        return {
          month: monthNames[month.getMonth()],
          returns: Math.round(baseReturn * randomFactor)
        };
      });
      
      res.json({
        totalInvested,
        totalProjectedReturns,
        avgReturnRate,
        riskAssessment,
        portfolioAllocation,
        monthlyReturns,
        performanceByType,
        topPerformingInvestments
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics dashboard data" });
    }
  });

  // ===== FORUM DISCUSSION ROUTES =====
  
  // Get all forum posts or recent ones
  app.get("/api/forums", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const posts = await storage.getRecentForumPosts(limit);
      
      // Add author information to each post
      const postsWithAuthors = await Promise.all(
        posts.map(async (post) => {
          const author = await storage.getUser(post.userId);
          return {
            ...post,
            author: author ? {
              id: author.id,
              username: author.username,
              firstName: author.firstName,
              lastName: author.lastName
            } : null
          };
        })
      );
      
      res.json(postsWithAuthors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });
  
  // Get forums for a specific property
  app.get("/api/forums/property/:propertyId", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      const posts = await storage.getForumPostsByProperty(propertyId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property forum posts" });
    }
  });
  
  // Get forums created by a specific user
  app.get("/api/forums/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const posts = await storage.getForumPostsByUser(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user forum posts" });
    }
  });
  
  // Get a specific forum post with its replies
  app.get("/api/forums/:postId", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getForumPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Get post author
      const author = await storage.getUser(post.userId);
      
      // Get replies to this post
      const replies = await storage.getForumThreads(postId);
      
      // Add authors to replies
      const repliesWithAuthors = await Promise.all(
        replies.map(async (reply) => {
          const replyAuthor = await storage.getUser(reply.userId);
          return {
            ...reply,
            author: replyAuthor ? {
              id: replyAuthor.id,
              username: replyAuthor.username,
              firstName: replyAuthor.firstName,
              lastName: replyAuthor.lastName
            } : null
          };
        })
      );
      
      res.json({
        ...post,
        author: author ? {
          id: author.id,
          username: author.username,
          firstName: author.firstName,
          lastName: author.lastName
        } : null,
        replies: repliesWithAuthors
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch forum post" });
    }
  });
  
  // Create a new forum post
  app.post("/api/forums", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to create a post" });
      }
      
      const postData = insertForumPostSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const post = await storage.createForumPost(postData);
      
      // Get the author info
      const author = await storage.getUser(post.userId);
      
      res.status(201).json({
        ...post,
        author: author ? {
          id: author.id,
          username: author.username,
          firstName: author.firstName,
          lastName: author.lastName
        } : null
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid post data", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });
  
  // Update a forum post
  app.put("/api/forums/:postId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update a post" });
      }
      
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getForumPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "You can only edit your own posts" });
      }
      
      const postData = insertForumPostSchema.partial().parse(req.body);
      
      const updatedPost = await storage.updateForumPost(postId, postData);
      res.json(updatedPost);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid post data", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to update forum post" });
    }
  });
  
  // Delete a forum post
  app.delete("/api/forums/:postId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to delete a post" });
      }
      
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getForumPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      if (post.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "You can only delete your own posts" });
      }
      
      const success = await storage.deleteForumPost(postId);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Failed to delete post" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete forum post" });
    }
  });
  
  // ===== Q&A ROUTES =====
  
  // Get all questions or recent ones
  app.get("/api/questions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const questions = await storage.getRecentQuestions(limit);
      
      // Add author information to each question
      const questionsWithDetails = await Promise.all(
        questions.map(async (question) => {
          const author = await storage.getUser(question.userId);
          const property = await storage.getProperty(question.propertyId);
          const answers = await storage.getAnswers(question.id);
          
          return {
            ...question,
            author: author ? {
              id: author.id,
              username: author.username,
              firstName: author.firstName,
              lastName: author.lastName
            } : null,
            property: property ? {
              id: property.id,
              name: property.name,
              type: property.type,
              location: property.location,
              imageUrl: property.imageUrl
            } : null,
            answerCount: answers.length
          };
        })
      );
      
      res.json(questionsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });
  
  // Get questions for a specific property
  app.get("/api/questions/property/:propertyId", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      const questions = await storage.getQuestionsByProperty(propertyId);
      
      // Add author information and answer count to each question
      const questionsWithDetails = await Promise.all(
        questions.map(async (question) => {
          const author = await storage.getUser(question.userId);
          const answers = await storage.getAnswers(question.id);
          
          return {
            ...question,
            author: author ? {
              id: author.id,
              username: author.username,
              firstName: author.firstName,
              lastName: author.lastName
            } : null,
            answerCount: answers.length
          };
        })
      );
      
      res.json(questionsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property questions" });
    }
  });
  
  // Get a specific question with its answers
  app.get("/api/questions/:questionId", async (req, res) => {
    try {
      const questionId = parseInt(req.params.questionId);
      if (isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      const question = await storage.getQuestion(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      // Get question author
      const author = await storage.getUser(question.userId);
      
      // Get property details
      const property = await storage.getProperty(question.propertyId);
      
      // Get answers to this question
      const answers = await storage.getAnswers(questionId);
      
      // Add authors to answers
      const answersWithAuthors = await Promise.all(
        answers.map(async (answer) => {
          const answerAuthor = await storage.getUser(answer.userId);
          return {
            ...answer,
            author: answerAuthor ? {
              id: answerAuthor.id,
              username: answerAuthor.username,
              firstName: answerAuthor.firstName,
              lastName: answerAuthor.lastName
            } : null
          };
        })
      );
      
      // Sort answers - accepted answer first, then by date
      const sortedAnswers = answersWithAuthors.sort((a, b) => {
        if (a.isAccepted && !b.isAccepted) return -1;
        if (!a.isAccepted && b.isAccepted) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      res.json({
        ...question,
        author: author ? {
          id: author.id,
          username: author.username,
          firstName: author.firstName,
          lastName: author.lastName
        } : null,
        property: property ? {
          id: property.id,
          name: property.name,
          type: property.type,
          location: property.location,
          imageUrl: property.imageUrl
        } : null,
        answers: sortedAnswers
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });
  
  // Ask a new question
  app.post("/api/questions", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to ask a question" });
      }
      
      const questionData = insertQAQuestionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Verify the property exists
      const property = await storage.getProperty(questionData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      const question = await storage.createQuestion(questionData);
      
      // Get the author info
      const author = await storage.getUser(question.userId);
      
      res.status(201).json({
        ...question,
        author: author ? {
          id: author.id,
          username: author.username,
          firstName: author.firstName,
          lastName: author.lastName
        } : null,
        property: {
          id: property.id,
          name: property.name,
          type: property.type,
          location: property.location,
          imageUrl: property.imageUrl
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid question data", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to create question" });
    }
  });
  
  // Post an answer to a question
  app.post("/api/questions/:questionId/answers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to answer a question" });
      }
      
      const questionId = parseInt(req.params.questionId);
      if (isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      const question = await storage.getQuestion(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      const answerData = insertQAAnswerSchema.parse({
        ...req.body,
        userId: req.user.id,
        questionId
      });
      
      const answer = await storage.createAnswer(answerData);
      
      // Get the author info
      const author = await storage.getUser(answer.userId);
      
      res.status(201).json({
        ...answer,
        author: author ? {
          id: author.id,
          username: author.username,
          firstName: author.firstName,
          lastName: author.lastName
        } : null
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid answer data", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to create answer" });
    }
  });
  
  // Mark question as answered/unanswered
  app.patch("/api/questions/:questionId/answered", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to update a question" });
      }
      
      const questionId = parseInt(req.params.questionId);
      if (isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
      
      const question = await storage.getQuestion(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      if (question.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "You can only update your own questions" });
      }
      
      const isAnswered = req.body.isAnswered === true;
      const updatedQuestion = await storage.markQuestionAsAnswered(questionId, isAnswered);
      res.json(updatedQuestion);
    } catch (error) {
      res.status(500).json({ message: "Failed to update question" });
    }
  });
  
  // Mark answer as accepted/unaccepted
  app.patch("/api/answers/:answerId/accepted", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to accept an answer" });
      }
      
      const answerId = parseInt(req.params.answerId);
      if (isNaN(answerId)) {
        return res.status(400).json({ message: "Invalid answer ID" });
      }
      
      // Find the answer in all answers (ideally we'd have a getAnswer method for a single answer)
      const answers = await storage.getAnswers(answerId);
      const answer = answers.find(a => a.id === answerId);
      
      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }
      
      const question = await storage.getQuestion(answer.questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      if (question.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "You can only accept answers to your own questions" });
      }
      
      const isAccepted = req.body.isAccepted === true;
      const updatedAnswer = await storage.markAnswerAsAccepted(answerId, isAccepted);
      
      // If accepting an answer, also mark the question as answered
      if (isAccepted) {
        await storage.markQuestionAsAnswered(question.id, true);
      }
      
      res.json(updatedAnswer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update answer" });
    }
  });
  
  // Register API routes
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRoutes);
  app.use('/api/projects', projectsRoutes);
  app.use('/api/properties', propertiesRoutes);
  app.use('/api/investments', investmentsRoutes);
  app.use('/api/roi', roiRoutes);
  app.use('/api/messages', messagesRoutes);

  const httpServer = createServer(app);
  
  // Customer Support System Routes
  
  // Support Tickets
  
  // Get all tickets (admin)
  app.get("/api/support/tickets", isAdmin, async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      
      let tickets;
      if (status) {
        tickets = await storage.getSupportTicketsByStatus(status);
      } else {
        tickets = await storage.getAllSupportTickets();
      }
      
      // Add user information for each ticket
      const ticketsWithUserInfo = await Promise.all(
        tickets.map(async (ticket) => {
          const user = await storage.getUser(ticket.userId);
          return {
            ...ticket,
            user: {
              id: user?.id,
              username: user?.username,
              email: user?.email,
              firstName: user?.firstName,
              lastName: user?.lastName
            }
          };
        })
      );
      
      res.json(ticketsWithUserInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });
  
  // Get user's tickets
  app.get("/api/support/my-tickets", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = (req.user as Express.User).id;
      const tickets = await storage.getUserSupportTickets(userId);
      
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });
  
  // Get a specific ticket
  app.get("/api/support/tickets/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getSupportTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      
      // Check if the user is the ticket owner or an admin
      const userId = (req.user as Express.User).id;
      if (ticket.userId !== userId && !(req.user as Express.User).isAdmin) {
        return res.status(403).json({ message: "You don't have permission to view this ticket" });
      }
      
      // Get ticket messages
      const messages = await storage.getSupportMessages(ticketId);
      
      // Get user information for messages
      const messagesWithUserInfo = await Promise.all(
        messages.map(async (message) => {
          const user = await storage.getUser(message.userId);
          return {
            ...message,
            user: {
              id: user?.id,
              username: user?.username,
              email: user?.email,
              firstName: user?.firstName,
              lastName: user?.lastName,
              isAdmin: user?.isAdmin
            }
          };
        })
      );
      
      // Get property information if ticket is related to a property
      let property = null;
      if (ticket.propertyId) {
        property = await storage.getProperty(ticket.propertyId);
      }
      
      // Get investment information if ticket is related to an investment
      let investment = null;
      if (ticket.investmentId) {
        investment = await storage.getInvestment(ticket.investmentId);
        if (investment && !property && investment.propertyId) {
          property = await storage.getProperty(investment.propertyId);
        }
      }
      
      res.json({
        ticket,
        messages: messagesWithUserInfo,
        property,
        investment
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch support ticket details" });
    }
  });
  
  // Create a new support ticket
  app.post("/api/support/tickets", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = (req.user as Express.User).id;
      
      // Validate ticket data
      const validatedData = insertSupportTicketSchema.parse({
        ...req.body,
        userId
      });
      
      // Create ticket
      const ticket = await storage.createSupportTicket(validatedData);
      
      // If the ticket includes a first message, add it
      if (req.body.message) {
        await storage.createSupportMessage({
          ticketId: ticket.id,
          userId: userId,
          content: req.body.message,
          isFromStaff: false
        });
      }
      
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid ticket data", 
          errors: fromZodError(error).toString() 
        });
      } else {
        res.status(500).json({ message: "Failed to create support ticket" });
      }
    }
  });
  
  // Update a support ticket
  app.patch("/api/support/tickets/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getSupportTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      
      // Check permissions - only ticket owner or admin can update
      const userId = (req.user as Express.User).id;
      const isAdmin = (req.user as Express.User).isAdmin;
      
      if (ticket.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "You don't have permission to update this ticket" });
      }
      
      // Restrict what regular users can update
      let updateData = { ...req.body };
      if (!isAdmin) {
        // Regular users can only close their own tickets
        const allowedFields = ['status'];
        updateData = Object.keys(updateData)
          .filter(key => allowedFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = updateData[key];
            return obj;
          }, {} as Record<string, any>);
          
        // Regular users can only change status to "closed"
        if (updateData.status && updateData.status !== "closed") {
          return res.status(403).json({ 
            message: "You can only close tickets, not change to other statuses" 
          });
        }
      }
      
      // Update ticket
      const updatedTicket = await storage.updateSupportTicket(ticketId, updateData);
      
      res.json(updatedTicket);
    } catch (error) {
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });
  
  // Support Messages
  
  // Add a message to a ticket
  app.post("/api/support/tickets/:id/messages", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const ticketId = parseInt(req.params.id);
      const userId = (req.user as Express.User).id;
      const isAdmin = (req.user as Express.User).isAdmin;
      
      const ticket = await storage.getSupportTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      
      // Check if the user is the ticket owner or an admin
      if (ticket.userId !== userId && !isAdmin) {
        return res.status(403).json({ message: "You don't have permission to reply to this ticket" });
      }
      
      // Validate message data
      const validatedData = insertSupportMessageSchema.parse({
        ticketId,
        userId,
        content: req.body.content,
        isFromStaff: isAdmin,
        attachmentUrl: req.body.attachmentUrl
      });
      
      // Create message
      const message = await storage.createSupportMessage(validatedData);
      
      // If admin is responding, update ticket status to "open" if it's "new"
      if (isAdmin && ticket.status === "new") {
        await storage.updateSupportTicket(ticketId, { status: "open" });
      }
      
      // Get user information
      const user = await storage.getUser(userId);
      
      res.status(201).json({
        ...message,
        user: {
          id: user?.id,
          username: user?.username,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          isAdmin: user?.isAdmin
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid message data", 
          errors: fromZodError(error).toString() 
        });
      } else {
        res.status(500).json({ message: "Failed to add message" });
      }
    }
  });
  
  // Support FAQs
  
  // Get all FAQs
  app.get("/api/support/faqs", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const faqs = await storage.getSupportFaqs(category);
      res.json(faqs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });
  
  // Create a new FAQ (admin only)
  app.post("/api/support/faqs", isAdmin, async (req, res) => {
    try {
      // Validate FAQ data
      const validatedData = insertSupportFaqSchema.parse(req.body);
      
      // Create FAQ
      const faq = await storage.createSupportFaq(validatedData);
      
      res.status(201).json(faq);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: "Invalid FAQ data", 
          errors: fromZodError(error).toString() 
        });
      } else {
        res.status(500).json({ message: "Failed to create FAQ" });
      }
    }
  });
  
  // Update a FAQ (admin only)
  app.patch("/api/support/faqs/:id", isAdmin, async (req, res) => {
    try {
      const faqId = parseInt(req.params.id);
      
      // Check if FAQ exists
      const faq = await storage.getSupportFaq(faqId);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      
      // Update FAQ
      const updatedFaq = await storage.updateSupportFaq(faqId, req.body);
      
      res.json(updatedFaq);
    } catch (error) {
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });
  
  // Delete a FAQ (admin only)
  app.delete("/api/support/faqs/:id", isAdmin, async (req, res) => {
    try {
      const faqId = parseInt(req.params.id);
      
      // Check if FAQ exists
      const faq = await storage.getSupportFaq(faqId);
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      
      // Delete FAQ
      const success = await storage.deleteSupportFaq(faqId);
      
      if (success) {
        res.json({ message: "FAQ deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete FAQ" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send initial market data
    const marketData = generateMarketData();
    ws.send(JSON.stringify({
      type: 'market_data',
      data: marketData
    }));
    
    // Set up interval to send periodic updates
    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        const marketData = generateMarketData();
        ws.send(JSON.stringify({
          type: 'market_data_update',
          data: marketData
        }));
      }
    }, 30000); // Send updates every 30 seconds
    
    // Handle investment tracking data for authenticated users
    ws.on('message', (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        
        if (parsedMessage.type === 'subscribe_investments' && parsedMessage.userId) {
          // In a real app, we would verify the user's authentication token here
          const userId = parsedMessage.userId;
          
          // Send an update for this specific user's investments
          // This would normally be triggered by database changes
          const sendInvestmentUpdates = async () => {
            if (ws.readyState === ws.OPEN) {
              // Get user investments
              const investments = await storage.getUserInvestments(userId);
              
              // Get property details for each investment
              const investmentsWithDetails = await Promise.all(
                investments.map(async (investment) => {
                  const property = await storage.getProperty(investment.propertyId);
                  return {
                    ...investment,
                    property,
                    // Add real-time data like current value, appreciation, etc.
                    currentValue: investment.amount * (1 + (Math.random() * 0.05)),
                    appreciation: (Math.random() * 8).toFixed(2),
                    rentalIncome: (investment.amount * 0.008).toFixed(2),
                    distributions: (investment.amount * 0.006).toFixed(2),
                    lastUpdated: new Date().toISOString()
                  };
                })
              );
              
              ws.send(JSON.stringify({
                type: 'investment_update',
                data: investmentsWithDetails
              }));
            }
          };
          
          // Send initial data
          sendInvestmentUpdates();
          
          // Set up interval for this user's investment updates
          const investmentInterval = setInterval(sendInvestmentUpdates, 20000);
          
          // Store interval ID to clear it when connection closes
          ws.on('close', () => {
            clearInterval(investmentInterval);
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    // Clear interval when connection closes
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clearInterval(interval);
    });
  });
  return httpServer;
}
