import { Router } from "express";
import { db } from "../../db";
import { properties, insertPropertySchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Middleware to ensure admin access
const ensureAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};

// Get all properties (admin view with more details)
router.get("/", ensureAdmin, async (req, res) => {
  try {
    const allProperties = await db.select().from(properties).orderBy(properties.id);
    res.json(allProperties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a specific property
router.get("/:id", ensureAdmin, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    
    res.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new property
router.post("/", ensureAdmin, async (req, res) => {
  try {
    // Validate the request body
    const propertyData = insertPropertySchema.parse(req.body);
    
    // Insert the new property
    const [newProperty] = await db
      .insert(properties)
      .values(propertyData)
      .returning();
    
    res.status(201).json(newProperty);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    
    console.error("Error creating property:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update a property
router.patch("/:id", ensureAdmin, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    // Check if property exists
    const [existingProperty] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!existingProperty) {
      return res.status(404).json({ error: "Property not found" });
    }
    
    // Update property
    const [updatedProperty] = await db
      .update(properties)
      .set(req.body)
      .where(eq(properties.id, propertyId))
      .returning();
    
    res.json(updatedProperty);
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a property
router.delete("/:id", ensureAdmin, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    // Check if property exists
    const [existingProperty] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!existingProperty) {
      return res.status(404).json({ error: "Property not found" });
    }
    
    // Delete property
    await db
      .delete(properties)
      .where(eq(properties.id, propertyId));
    
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;