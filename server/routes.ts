import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertInvestmentSchema } from "@shared/schema";
import { ZodError } from "zod";
import paystackController from "./paystack";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

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
  app.post("/api/payment/initialize", paystackController.initializePayment);
  app.get("/payment/verify", paystackController.verifyPayment);
  app.get("/api/transactions", paystackController.getTransactions);

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

  const httpServer = createServer(app);
  return httpServer;
}
