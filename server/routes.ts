import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupJwtAuth, verifyToken } from "./auth-jwt";
import { setupVerificationRoutes } from "./auth/verification";
import { storage } from "./storage";
import { insertInvestmentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { adminRouter } from "./admin-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up JWT authentication routes
  setupJwtAuth(app);
  
  // Set up session-based authentication routes (legacy)
  setupAuth(app);
  
  // Set up verification routes
  setupVerificationRoutes(app);
  
  // Set up admin routes
  app.use('/api/admin', adminRouter);

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
  
  // Get user notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = (req.user as Express.User).id;
      const notifications = await storage.getUserNotifications(userId);
      
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  
  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const notificationId = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to update notification" });
    }
  });
  
  // Get specific investment by ID
  app.get("/api/investments/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const investmentId = parseInt(req.params.id);
      const investment = await storage.getInvestment(investmentId);
      
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      // Verify that the investment belongs to the authenticated user
      if (investment.userId !== (req.user as Express.User).id) {
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
  
  // Update investment returns (for simulation purposes)
  app.patch("/api/investments/:id/returns", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const investmentId = parseInt(req.params.id);
      const { earnings, monthlyReturns } = req.body;
      
      const investment = await storage.getInvestment(investmentId);
      
      if (!investment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      // Verify that the investment belongs to the authenticated user
      if (investment.userId !== (req.user as Express.User).id) {
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

  const httpServer = createServer(app);
  return httpServer;
}
