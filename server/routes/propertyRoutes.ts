import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const propertyRouter = Router();

// Get all properties with optional filtering
propertyRouter.get('/', async (req: Request, res: Response) => {
  try {
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

    console.log(`API response for GET /properties: Found ${properties ? properties.length : 0} properties`);
    res.json(properties || []);
  } catch (error) {
    console.error("Error in /properties:", error);
    res.status(500).json({ message: "Failed to fetch properties", error: String(error) });
  }
});

// Get a specific property by ID
propertyRouter.get('/:id', async (req: Request, res: Response) => {
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

export default propertyRouter;