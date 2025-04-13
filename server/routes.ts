import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertInvestmentSchema } from "@shared/schema";
import { ZodError } from "zod";
import paystackController from "./paystack";

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

  const httpServer = createServer(app);
  return httpServer;
}
