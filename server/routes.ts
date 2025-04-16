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

  const httpServer = createServer(app);
  return httpServer;
}
