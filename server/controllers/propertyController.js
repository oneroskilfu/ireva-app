const { db } = require('../db');
const { properties, investments } = require('../../shared/schema');
const { eq, and, sql } = require('drizzle-orm');

/**
 * Get all properties
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllProperties = async (req, res) => {
  try {
    console.log('Fetching all properties');
    const propertyList = await db.query.properties.findMany();
    console.log(`getAllProperties: Found ${propertyList.length} properties`);
    
    res.json(propertyList);
    console.log(`API response for GET /api/properties: Found ${propertyList.length} properties`);
    console.log(`Sample property: ${JSON.stringify(propertyList[0], null, 2)}`);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a property by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPropertyById = async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Calculate investment stats
    const [investmentStats] = await db.select({
      totalInvestors: sql`COUNT(DISTINCT ${investments.userId})`,
      currentFunding: sql`COALESCE(SUM(${investments.amount}), 0)`,
    })
    .from(investments)
    .where(eq(investments.propertyId, propertyId));
    
    const enrichedProperty = {
      ...property,
      stats: {
        ...investmentStats,
        fundingPercentage: property.totalFunding > 0 
          ? (investmentStats.currentFunding / property.totalFunding) * 100 
          : 0
      }
    };
    
    res.json(enrichedProperty);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new property
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createProperty = async (req, res) => {
  try {
    const propertyData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'location', 'description', 'type', 'imageUrl', 'targetReturn', 'minimumInvestment', 'term', 'totalFunding'];
    const missingFields = requiredFields.filter(field => !propertyData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    // Set default values if not provided
    const newPropertyData = {
      ...propertyData,
      currentFunding: propertyData.currentFunding || 0,
      numberOfInvestors: propertyData.numberOfInvestors || 0,
      daysLeft: propertyData.daysLeft || 30,
      accreditedOnly: propertyData.accreditedOnly || false,
    };
    
    // Create new property
    const [newProperty] = await db.insert(properties)
      .values(newPropertyData)
      .returning();
    
    res.status(201).json(newProperty);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a property
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProperty = async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    const propertyData = req.body;
    
    // Check if property exists
    const existingProperty = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    });
    
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Update property
    const [updatedProperty] = await db.update(properties)
      .set(propertyData)
      .where(eq(properties.id, propertyId))
      .returning();
    
    res.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a property
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteProperty = async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    // Check if property exists
    const existingProperty = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId)
    });
    
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if property has investments
    const [investmentCount] = await db.select({ count: sql`count(*)` })
      .from(investments)
      .where(eq(investments.propertyId, propertyId));
    
    if (investmentCount.count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete property with active investments' 
      });
    }
    
    // Delete property
    await db.delete(properties)
      .where(eq(properties.id, propertyId));
    
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty
};