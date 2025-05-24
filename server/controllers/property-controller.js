/**
 * Property Controller
 * 
 * Handles property management including CRUD operations,
 * property listing, filtering, and investment statistics
 */

const { eq, ilike, and, or, gte, lte, desc, sql } = require('drizzle-orm');
const { db } = require('../db.cjs');
const { properties, investments, users, propertyUpdates } = require('../../shared/schema');

/**
 * Get all properties with filtering options
 */
exports.getAllProperties = async (req, res) => {
  try {
    // Extract filter parameters
    const {
      status,
      propertyType,
      minPrice,
      maxPrice,
      minROI,
      maxROI,
      location,
      sortBy = 'createdAt',
      order = 'desc',
      limit = 10,
      page = 1
    } = req.query;
    
    // Build query conditions
    const conditions = [];
    
    if (status) {
      conditions.push(eq(properties.status, status));
    } else {
      // By default, only show active properties for investors
      if (req.user.role === 'investor') {
        conditions.push(eq(properties.isActive, true));
      }
    }
    
    if (propertyType) {
      conditions.push(eq(properties.propertyType, propertyType));
    }
    
    if (minPrice) {
      conditions.push(gte(properties.price, minPrice));
    }
    
    if (maxPrice) {
      conditions.push(lte(properties.price, maxPrice));
    }
    
    if (minROI) {
      conditions.push(gte(properties.roi, minROI));
    }
    
    if (maxROI) {
      conditions.push(lte(properties.roi, maxROI));
    }
    
    if (location) {
      conditions.push(ilike(properties.location, `%${location}%`));
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Build query
    let query = db.select()
      .from(properties);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    if (sortBy && order) {
      query = query.orderBy(
        order.toLowerCase() === 'desc' 
          ? desc(properties[sortBy]) 
          : properties[sortBy]
      );
    }
    
    // Apply pagination
    query = query.limit(Number(limit)).offset(Number(offset));
    
    // Execute query
    const propertiesList = await query;
    
    // Get total count for pagination
    const [{ count }] = await db.select({
      count: sql`count(*)`
    })
    .from(properties)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    res.status(200).json({
      status: 'success',
      results: propertiesList.length,
      pagination: {
        totalItems: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
        currentPage: Number(page),
        limit: Number(limit)
      },
      data: {
        properties: propertiesList
      }
    });
  } catch (error) {
    console.error('Get all properties error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve properties',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get property by ID with investment statistics
 */
exports.getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get property
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);
    
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }
    
    // Get investment statistics
    const [stats] = await db.select({
      totalInvestors: sql`count(distinct ${investments.userId})`,
      totalInvested: sql`sum(${investments.amount})`,
      averageInvestment: sql`avg(${investments.amount})`
    })
    .from(investments)
    .where(eq(investments.propertyId, id));
    
    // Get recent updates
    const updates = await db.select({
      id: propertyUpdates.id,
      title: propertyUpdates.title,
      content: propertyUpdates.content,
      createdAt: propertyUpdates.createdAt,
      createdBy: propertyUpdates.createdBy,
      images: propertyUpdates.images
    })
    .from(propertyUpdates)
    .where(eq(propertyUpdates.propertyId, id))
    .orderBy(desc(propertyUpdates.createdAt))
    .limit(5);
    
    // For admin users, include detailed investment data
    let investmentsData = [];
    if (req.user.role === 'admin') {
      investmentsData = await db.select({
        id: investments.id,
        userId: investments.userId,
        userName: users.name,
        amount: investments.amount,
        status: investments.status,
        investmentDate: investments.investmentDate
      })
      .from(investments)
      .leftJoin(users, eq(investments.userId, users.id))
      .where(eq(investments.propertyId, id))
      .orderBy(desc(investments.investmentDate));
    }
    
    // Check if the current user has invested in this property
    let userInvestment = null;
    if (req.user.role === 'investor') {
      const [investment] = await db.select()
        .from(investments)
        .where(and(
          eq(investments.propertyId, id),
          eq(investments.userId, req.user.id)
        ))
        .limit(1);
      
      userInvestment = investment || null;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        property,
        stats: {
          totalInvestors: Number(stats.totalInvestors) || 0,
          totalInvested: stats.totalInvested || '0',
          averageInvestment: stats.averageInvestment || '0',
          fundingPercentage: property.fundingGoal > 0 
            ? (Number(property.fundingProgress) / Number(property.fundingGoal) * 100).toFixed(2)
            : '0'
        },
        updates,
        ...(req.user.role === 'admin' ? { investments: investmentsData } : {}),
        ...(userInvestment ? { userInvestment } : {})
      }
    });
  } catch (error) {
    console.error('Get property error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve property details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new property (admin only)
 */
exports.createProperty = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      propertyType,
      price,
      size,
      roi,
      fundingGoal,
      minInvestment,
      maxInvestment,
      duration,
      images,
      features,
      documents,
      startDate,
      endDate,
      latitude,
      longitude
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !location || !propertyType || !price || !size || !roi || !fundingGoal || !minInvestment || !duration) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }
    
    // Create property
    const [newProperty] = await db.insert(properties)
      .values({
        name,
        description,
        location,
        propertyType,
        price,
        size,
        roi,
        fundingGoal,
        fundingProgress: '0',
        minInvestment,
        maxInvestment,
        duration,
        images: images || [],
        features: features || [],
        documents: documents || [],
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        latitude,
        longitude,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // Create initial property update
    await db.insert(propertyUpdates)
      .values({
        propertyId: newProperty.id,
        title: 'Property Listed',
        content: `${newProperty.name} has been listed on the platform and is now available for investment.`,
        createdBy: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    
    res.status(201).json({
      status: 'success',
      data: {
        property: newProperty
      }
    });
  } catch (error) {
    console.error('Create property error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to create property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update property details (admin only)
 */
exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get property
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);
    
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }
    
    // Filter out fields that shouldn't be directly updated
    const filteredBody = { ...req.body };
    delete filteredBody.fundingProgress; // This should be updated via investments
    
    filteredBody.updatedAt = new Date();
    
    // Convert date strings to Date objects
    if (filteredBody.startDate) {
      filteredBody.startDate = new Date(filteredBody.startDate);
    }
    
    if (filteredBody.endDate) {
      filteredBody.endDate = new Date(filteredBody.endDate);
    }
    
    // Update property
    const [updatedProperty] = await db.update(properties)
      .set(filteredBody)
      .where(eq(properties.id, id))
      .returning();
    
    // Create update record if property status changed
    if (req.body.status && req.body.status !== property.status) {
      await db.insert(propertyUpdates)
        .values({
          propertyId: property.id,
          title: `Status Updated to ${req.body.status}`,
          content: `The property status has been changed from ${property.status} to ${req.body.status}.`,
          createdBy: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        property: updatedProperty
      }
    });
  } catch (error) {
    console.error('Update property error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add property update (admin only)
 */
exports.addPropertyUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, images } = req.body;
    
    // Check if property exists
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);
    
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide title and content'
      });
    }
    
    // Create property update
    const [newUpdate] = await db.insert(propertyUpdates)
      .values({
        propertyId: property.id,
        title,
        content,
        images: images || [],
        createdBy: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // Get creator name
    const [creator] = await db.select({
      name: users.name
    })
    .from(users)
    .where(eq(users.id, req.user.id))
    .limit(1);
    
    res.status(201).json({
      status: 'success',
      data: {
        update: {
          ...newUpdate,
          creatorName: creator?.name || 'Admin'
        }
      }
    });
  } catch (error) {
    console.error('Add property update error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to add property update',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all property updates for a specific property
 */
exports.getPropertyUpdates = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    // Check if property exists
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);
    
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get updates with creator info
    const updates = await db.select({
      id: propertyUpdates.id,
      title: propertyUpdates.title,
      content: propertyUpdates.content,
      createdAt: propertyUpdates.createdAt,
      createdBy: propertyUpdates.createdBy,
      images: propertyUpdates.images,
      creatorName: users.name
    })
    .from(propertyUpdates)
    .leftJoin(users, eq(propertyUpdates.createdBy, users.id))
    .where(eq(propertyUpdates.propertyId, id))
    .orderBy(desc(propertyUpdates.createdAt))
    .limit(Number(limit))
    .offset(Number(offset));
    
    // Get total count for pagination
    const [{ count }] = await db.select({
      count: sql`count(*)`
    })
    .from(propertyUpdates)
    .where(eq(propertyUpdates.propertyId, id));
    
    res.status(200).json({
      status: 'success',
      results: updates.length,
      pagination: {
        totalItems: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
        currentPage: Number(page),
        limit: Number(limit)
      },
      data: {
        updates
      }
    });
  } catch (error) {
    console.error('Get property updates error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve property updates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a property (admin only)
 */
exports.deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if property exists
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);
    
    if (!property) {
      return res.status(404).json({
        status: 'error',
        message: 'Property not found'
      });
    }
    
    // Check if property has investments
    const [{ count }] = await db.select({
      count: sql`count(*)`
    })
    .from(investments)
    .where(eq(investments.propertyId, id));
    
    if (Number(count) > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete property with existing investments'
      });
    }
    
    // Delete property updates
    await db.delete(propertyUpdates)
      .where(eq(propertyUpdates.propertyId, id));
    
    // Delete property
    await db.delete(properties)
      .where(eq(properties.id, id));
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Delete property error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get property types and stats (for filters and dashboard)
 */
exports.getPropertyStats = async (req, res) => {
  try {
    // Get distinct property types
    const propertyTypes = await db.select({
      type: properties.propertyType
    })
    .from(properties)
    .groupBy(properties.propertyType);
    
    // Get property counts by status
    const statusCounts = await db.select({
      status: properties.status,
      count: sql`count(*)`
    })
    .from(properties)
    .groupBy(properties.status);
    
    // Get property counts by type
    const typeCounts = await db.select({
      type: properties.propertyType,
      count: sql`count(*)`
    })
    .from(properties)
    .groupBy(properties.propertyType);
    
    // Get total funding stats
    const [fundingStats] = await db.select({
      totalFundingGoal: sql`sum(${properties.fundingGoal})`,
      totalFundingProgress: sql`sum(${properties.fundingProgress})`,
      avgROI: sql`avg(${properties.roi})`
    })
    .from(properties);
    
    res.status(200).json({
      status: 'success',
      data: {
        propertyTypes: propertyTypes.map(item => item.type),
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = Number(item.count);
          return acc;
        }, {}),
        typeCounts: typeCounts.reduce((acc, item) => {
          acc[item.type] = Number(item.count);
          return acc;
        }, {}),
        fundingStats: {
          totalFundingGoal: fundingStats.totalFundingGoal || '0',
          totalFundingProgress: fundingStats.totalFundingProgress || '0',
          avgROI: fundingStats.avgROI || '0',
          fundingPercentage: fundingStats.totalFundingGoal > 0
            ? (Number(fundingStats.totalFundingProgress) / Number(fundingStats.totalFundingGoal) * 100).toFixed(2)
            : '0'
        }
      }
    });
  } catch (error) {
    console.error('Get property stats error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve property statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};