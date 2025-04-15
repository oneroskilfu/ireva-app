import express from 'express';
import { isAdmin } from '../middleware/isAdmin';
import { storage } from '../storage';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Set up file storage for property media files
const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create upload directories if they don't exist
    let uploadDir = './uploads/images'; // Default for images
    
    // Determine directory based on file type
    if (file.fieldname === 'mainImage' || file.fieldname === 'additionalImages') {
      uploadDir = './uploads/images';
    } else if (file.fieldname === 'brochure') {
      uploadDir = './uploads/documents';
    } else if (file.fieldname === 'video') {
      uploadDir = './uploads/videos';
    }
    
    // Create necessary directories if they don't exist
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads');
    }
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type based on fieldname
  if (file.fieldname === 'mainImage' || file.fieldname === 'additionalImages') {
    // For all image fields
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for property images'));
    }
  } else if (file.fieldname === 'brochure') {
    // For property brochures - only PDF
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for property brochures'));
    }
  } else if (file.fieldname === 'video') {
    // For property videos
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for property videos'));
    }
  } else {
    // For any other document types
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
};

const upload = multer({ 
  storage: storage_config,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  }
});

// Protect all admin routes
router.use(isAdmin);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!id || !role) {
      return res.status(400).json({ message: 'User ID and role are required' });
    }
    
    // Validate role
    if (!['admin', 'investor', 'developer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin, investor, or developer' });
    }
    
    const userId = parseInt(id);
    
    // Update isAdmin flag based on role
    const isAdmin = role === 'admin';
    
    const updatedUser = await storage.updateUser(userId, { 
      role,
      isAdmin 
    });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: `User role updated to ${role}`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
});

// Update user status (active/inactive)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    
    if (!id || active === undefined) {
      return res.status(400).json({ message: 'User ID and active status are required' });
    }
    
    const userId = parseInt(id);
    const updatedUser = await storage.updateUser(userId, { active });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: `User ${active ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
});

// ========== Property Management ==========

// Get all properties with filtering options
router.get('/properties', async (req, res) => {
  try {
    const { status, type, location, developerId } = req.query;
    
    let properties;
    
    if (status) {
      properties = await storage.getPropertiesByStatus(status as string);
    } else if (type) {
      properties = await storage.getPropertiesByType(type as string);
    } else if (location) {
      properties = await storage.getPropertiesByLocation(location as string);
    } else if (developerId) {
      properties = await storage.getPropertiesByDeveloper(parseInt(developerId as string));
    } else {
      properties = await storage.getAllProperties();
    }
    
    // If any developers exist, fetch their details 
    if (properties && properties.length > 0) {
      const propertiesWithDeveloperInfo = await Promise.all(
        properties.map(async (property) => {
          if (property.developerId) {
            const developer = await storage.getUser(property.developerId);
            return {
              ...property,
              developer: developer ? {
                id: developer.id,
                name: `${developer.firstName || ''} ${developer.lastName || ''}`.trim() || developer.username,
                email: developer.email
              } : null
            };
          }
          return property;
        })
      );
      
      res.json(propertiesWithDeveloperInfo);
    } else {
      res.json(properties);
    }
  } catch (error) {
    console.error('Error getting properties:', error);
    res.status(500).json({ message: 'Server error retrieving properties' });
  }
});

// Get property by ID
router.get('/properties/:id', async (req, res) => {
  try {
    const propertyId = parseInt(req.params.id);
    const property = await storage.getProperty(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Fetch developer info if a developer is assigned
    if (property.developerId) {
      const developer = await storage.getUser(property.developerId);
      res.json({
        ...property,
        developer: developer ? {
          id: developer.id,
          name: `${developer.firstName || ''} ${developer.lastName || ''}`.trim() || developer.username,
          email: developer.email
        } : null
      });
    } else {
      res.json(property);
    }
  } catch (error) {
    console.error('Error getting property:', error);
    res.status(500).json({ message: 'Server error retrieving property' });
  }
});

// Create property with image, video, and brochure uploads
router.post('/properties', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'brochure', maxCount: 1 }
]), async (req, res) => {
  try {
    const propertyData = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Validate required fields
    const requiredFields = ['name', 'location', 'description', 'type', 'price', 'minimumInvestment', 'targetReturn'];
    for (const field of requiredFields) {
      if (!propertyData[field]) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }
    
    // Process uploaded files
    if (files) {
      // Handle main image
      if (files.mainImage && files.mainImage.length > 0) {
        const mainImageFile = files.mainImage[0];
        propertyData.imageUrl = `/uploads/images/${mainImageFile.filename}`;
      }
      
      // Handle additional images
      if (files.additionalImages && files.additionalImages.length > 0) {
        const additionalImagePaths = files.additionalImages.map(file => 
          `/uploads/images/${file.filename}`
        );
        propertyData.additionalImages = JSON.stringify(additionalImagePaths);
      }
      
      // Handle video
      if (files.video && files.video.length > 0) {
        const videoFile = files.video[0];
        propertyData.videoUrl = `/uploads/videos/${videoFile.filename}`;
      }
      
      // Handle brochure/PDF
      if (files.brochure && files.brochure.length > 0) {
        const brochureFile = files.brochure[0];
        
        const documentInfo = {
          name: brochureFile.originalname,
          path: `/uploads/documents/${brochureFile.filename}`,
          type: brochureFile.mimetype,
          isMainBrochure: true
        };
        
        propertyData.brochureUrl = `/uploads/documents/${brochureFile.filename}`;
        propertyData.documentUrls = JSON.stringify([documentInfo]);
      }
    }
    
    // Numeric fields conversion
    propertyData.minimumInvestment = parseInt(propertyData.minimumInvestment);
    propertyData.price = parseInt(propertyData.price);
    propertyData.targetReturn = parseFloat(propertyData.targetReturn);
    
    if (propertyData.developerId) {
      propertyData.developerId = parseInt(propertyData.developerId);
    }
    
    // Add current total funding and default status if not provided
    propertyData.currentFunding = 0;
    propertyData.totalFunding = propertyData.price;
    
    if (!propertyData.status) {
      propertyData.status = 'Active';
    }
    
    const newProperty = await storage.createProperty(propertyData);
    res.status(201).json(newProperty);
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Server error creating property' });
  }
});

// Update property
router.put('/properties/:id', upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'brochure', maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const propertyData = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!id) {
      return res.status(400).json({ message: 'Property ID is required' });
    }
    
    const propertyId = parseInt(id);
    
    // Get existing property to compare changes
    const existingProperty = await storage.getProperty(propertyId);
    
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Process uploaded files
    if (files) {
      // Handle main image
      if (files.mainImage && files.mainImage.length > 0) {
        const mainImageFile = files.mainImage[0];
        propertyData.imageUrl = `/uploads/images/${mainImageFile.filename}`;
      }
      
      // Handle additional images
      if (files.additionalImages && files.additionalImages.length > 0) {
        const newImagePaths = files.additionalImages.map(file => 
          `/uploads/images/${file.filename}`
        );
        
        // If there are existing additional images, merge them with new ones
        if (existingProperty.additionalImages) {
          try {
            const existingImages = JSON.parse(existingProperty.additionalImages);
            propertyData.additionalImages = JSON.stringify([...existingImages, ...newImagePaths]);
          } catch (e) {
            propertyData.additionalImages = JSON.stringify(newImagePaths);
          }
        } else {
          propertyData.additionalImages = JSON.stringify(newImagePaths);
        }
      }
      
      // Handle video
      if (files.video && files.video.length > 0) {
        const videoFile = files.video[0];
        propertyData.videoUrl = `/uploads/videos/${videoFile.filename}`;
      }
      
      // Handle brochure/PDF
      if (files.brochure && files.brochure.length > 0) {
        const brochureFile = files.brochure[0];
        
        const documentInfo = {
          name: brochureFile.originalname,
          path: `/uploads/documents/${brochureFile.filename}`,
          type: brochureFile.mimetype,
          isMainBrochure: true
        };
        
        propertyData.brochureUrl = `/uploads/documents/${brochureFile.filename}`;
        
        // If there are existing documents, merge them with new ones
        if (existingProperty.documentUrls) {
          try {
            // Parse existing documents
            const existingDocuments = JSON.parse(existingProperty.documentUrls);
            
            // Remove any document marked as main brochure
            const filteredDocs = existingDocuments.filter((doc: any) => !doc.isMainBrochure);
            
            // Add the new brochure document
            propertyData.documentUrls = JSON.stringify([...filteredDocs, documentInfo]);
          } catch (e) {
            propertyData.documentUrls = JSON.stringify([documentInfo]);
          }
        } else {
          propertyData.documentUrls = JSON.stringify([documentInfo]);
        }
      }
    }
    
    // Convert numeric fields
    if (propertyData.minimumInvestment) {
      propertyData.minimumInvestment = parseInt(propertyData.minimumInvestment);
    }
    
    if (propertyData.price) {
      propertyData.price = parseInt(propertyData.price);
      // Update total funding if price changes
      propertyData.totalFunding = propertyData.price;
    }
    
    if (propertyData.targetReturn) {
      propertyData.targetReturn = parseFloat(propertyData.targetReturn);
    }
    
    if (propertyData.developerId) {
      propertyData.developerId = parseInt(propertyData.developerId);
    }
    
    const updatedProperty = await storage.updateProperty(propertyId, propertyData);
    
    if (!updatedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Server error updating property' });
  }
});

// Delete property
router.delete('/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Property ID is required' });
    }
    
    const propertyId = parseInt(id);
    
    // Check if property exists
    const property = await storage.getProperty(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if property has any investments
    const investments = await storage.getPropertyInvestments(propertyId);
    
    if (investments && investments.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete property with active investments',
        suggestion: 'Consider changing the status to "Archived" instead'
      });
    }
    
    // Delete property
    await storage.deleteProperty(propertyId);
    
    res.json({ 
      success: true,
      message: 'Property deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Server error deleting property' });
  }
});

// Get available developers (users with developer role)
router.get('/developers', async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    const developers = users.filter(user => user.role === 'developer' && user.active !== false);
    
    const developerList = developers.map(dev => ({
      id: dev.id,
      name: `${dev.firstName || ''} ${dev.lastName || ''}`.trim() || dev.username,
      email: dev.email
    }));
    
    res.json(developerList);
  } catch (error) {
    console.error('Error getting developers:', error);
    res.status(500).json({ message: 'Server error retrieving developers' });
  }
});

// ========== ROI Tracking ==========

// Get all investments with optional filtering
router.get('/investments', async (req, res) => {
  try {
    const { userId, propertyId, status, startDate, endDate } = req.query;
    
    // Fetch all investments
    let investments = await storage.getAllInvestments();
    
    // Apply filters
    if (userId) {
      investments = investments.filter(inv => inv.userId === parseInt(userId as string));
    }
    
    if (propertyId) {
      investments = investments.filter(inv => inv.propertyId === parseInt(propertyId as string));
    }
    
    if (status) {
      investments = investments.filter(inv => inv.status === status);
    }
    
    if (startDate) {
      const start = new Date(startDate as string);
      investments = investments.filter(inv => new Date(inv.date) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate as string);
      investments = investments.filter(inv => new Date(inv.date) <= end);
    }
    
    // Enrich investments with user and property data
    const enrichedInvestments = await Promise.all(
      investments.map(async (investment) => {
        const user = await storage.getUser(investment.userId);
        const property = await storage.getProperty(investment.propertyId);
        
        // Get related ROI distributions for this investment
        const roiTransactions = await storage.getROITransactionsByInvestmentId(investment.id);
        
        return {
          ...investment,
          user: user ? {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
            email: user.email
          } : null,
          property: property ? {
            id: property.id,
            name: property.name,
            type: property.type,
            location: property.location
          } : null,
          roiTransactions: roiTransactions || []
        };
      })
    );
    
    res.json(enrichedInvestments);
  } catch (error) {
    console.error('Error getting investments:', error);
    res.status(500).json({ message: 'Server error retrieving investments' });
  }
});

// Get ROI summary with aggregated data
router.get('/roi-summary', async (req, res) => {
  try {
    // Get all ROI distributions
    const distributions = await storage.getAllROIDistributions();
    
    // Get all transactions
    const transactions = await storage.getAllROITransactions();
    
    // Get all properties and investments for reference
    const properties = await storage.getAllProperties();
    const investments = await storage.getAllInvestments();
    
    // Calculate summary statistics
    const totalDistributed = distributions.reduce((sum, dist) => sum + dist.amount, 0);
    const totalTransactions = transactions.length;
    const completedDistributions = distributions.filter(dist => dist.status === 'Completed').length;
    const pendingDistributions = distributions.filter(dist => dist.status === 'Pending').length;
    
    // Group distributions by property
    const distributionsByProperty = distributions.reduce((acc, dist) => {
      if (!acc[dist.propertyId]) {
        acc[dist.propertyId] = [];
      }
      acc[dist.propertyId].push(dist);
      return acc;
    }, {} as Record<number, typeof distributions>);
    
    // Calculate total ROI per property
    const roiByProperty = Object.entries(distributionsByProperty).map(([propId, dists]) => {
      const property = properties.find(p => p.id === parseInt(propId));
      const totalAmount = dists.reduce((sum, dist) => sum + dist.amount, 0);
      return {
        propertyId: parseInt(propId),
        propertyName: property?.name || 'Unknown',
        totalDistributed: totalAmount,
        distributionCount: dists.length,
        averagePercentage: dists.reduce((sum, dist) => sum + parseFloat(dist.percentage.toString()), 0) / dists.length,
        lastDistribution: dists.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      };
    });
    
    // Calculate monthly ROI distribution over time (for charts)
    const monthlyDistributions = distributions.reduce((acc, dist) => {
      const date = new Date(dist.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          amount: 0,
          count: 0
        };
      }
      
      acc[monthYear].amount += dist.amount;
      acc[monthYear].count += 1;
      
      return acc;
    }, {} as Record<string, { month: string; amount: number; count: number }>);
    
    // Sort monthly data chronologically
    const monthlyData = Object.values(monthlyDistributions).sort((a, b) => 
      a.month.localeCompare(b.month)
    );
    
    res.json({
      summary: {
        totalDistributed,
        totalTransactions,
        completedDistributions,
        pendingDistributions,
        activeDistributions: distributions.filter(dist => dist.status === 'Processing').length
      },
      roiByProperty,
      monthlyData,
      recentDistributions: distributions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
        .map(dist => {
          const property = properties.find(p => p.id === dist.propertyId);
          return {
            ...dist,
            propertyName: property?.name || 'Unknown'
          };
        })
    });
  } catch (error) {
    console.error('Error getting ROI summary:', error);
    res.status(500).json({ message: 'Server error retrieving ROI summary' });
  }
});

// Create new ROI distribution for a property
router.post('/roi-distributions', async (req, res) => {
  try {
    const { propertyId, percentage, amount, date, notes } = req.body;
    
    if (!propertyId || !percentage || !amount) {
      return res.status(400).json({ message: 'Property ID, percentage, and amount are required' });
    }
    
    // Validate property exists
    const property = await storage.getProperty(parseInt(propertyId));
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Create new ROI distribution
    const distribution = await storage.createROIDistribution({
      propertyId: parseInt(propertyId),
      percentage: parseFloat(percentage),
      amount: parseInt(amount),
      date: date ? new Date(date) : new Date(),
      status: 'Pending',
      notes: notes || ''
    });
    
    res.status(201).json(distribution);
  } catch (error) {
    console.error('Error creating ROI distribution:', error);
    res.status(500).json({ message: 'Server error creating ROI distribution' });
  }
});

// Process ROI distribution and create transactions for investors
router.post('/roi-distributions/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Distribution ID is required' });
    }
    
    const distributionId = parseInt(id);
    
    // Get the distribution
    const distribution = await storage.getROIDistribution(distributionId);
    
    if (!distribution) {
      return res.status(404).json({ message: 'ROI distribution not found' });
    }
    
    if (distribution.status !== 'Pending') {
      return res.status(400).json({ 
        message: `Cannot process distribution with status: ${distribution.status}`,
        currentStatus: distribution.status
      });
    }
    
    // Update distribution status to Processing
    await storage.updateROIDistribution(distributionId, {
      status: 'Processing',
      processedAt: new Date()
    });
    
    // Get all investments for this property
    const investments = await storage.getPropertyInvestments(distribution.propertyId);
    
    if (!investments || investments.length === 0) {
      return res.status(400).json({
        message: 'No investments found for this property',
        propertyId: distribution.propertyId
      });
    }
    
    // Calculate total invested amount
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Create ROI transactions for each investment
    const transactions = await Promise.all(
      investments.map(async (investment) => {
        // Calculate proportional ROI amount based on investment share
        const investmentShare = investment.amount / totalInvested;
        const roiAmount = Math.floor(distribution.amount * investmentShare);
        
        // Create transaction
        return await storage.createROITransaction({
          userId: investment.userId,
          investmentId: investment.id,
          distributionId: distribution.id,
          amount: roiAmount,
          date: new Date(),
          status: 'Completed'
        });
      })
    );
    
    // Update distribution status to Completed
    await storage.updateROIDistribution(distributionId, {
      status: 'Completed'
    });
    
    // Also update the earnings for each investment
    await Promise.all(
      investments.map(async (investment) => {
        const matchingTransaction = transactions.find(t => t.investmentId === investment.id);
        if (matchingTransaction) {
          const newEarnings = (investment.earnings || 0) + matchingTransaction.amount;
          await storage.updateInvestment(investment.id, {
            earnings: newEarnings,
            returns: newEarnings
          });
        }
      })
    );
    
    res.json({
      success: true,
      message: 'ROI distribution processed successfully',
      transactionsCreated: transactions.length,
      distribution: {
        ...distribution,
        status: 'Completed'
      },
      transactions
    });
  } catch (error) {
    console.error('Error processing ROI distribution:', error);
    res.status(500).json({ message: 'Server error processing ROI distribution' });
  }
});

// Get ROI transactions for a specific user
router.get('/roi-transactions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const userIdInt = parseInt(userId);
    
    // Get user ROI transactions
    const transactions = await storage.getROITransactionsByUserId(userIdInt);
    
    // Enrich transactions with investment and property data
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const investment = await storage.getInvestment(transaction.investmentId);
        const property = investment ? await storage.getProperty(investment.propertyId) : null;
        const distribution = await storage.getROIDistribution(transaction.distributionId);
        
        return {
          ...transaction,
          investment: investment ? {
            id: investment.id,
            amount: investment.amount,
            date: investment.date
          } : null,
          property: property ? {
            id: property.id,
            name: property.name,
            type: property.type,
            location: property.location
          } : null,
          distribution: distribution ? {
            id: distribution.id,
            percentage: distribution.percentage,
            date: distribution.date
          } : null
        };
      })
    );
    
    // Calculate summary statistics
    const totalReceived = transactions.reduce((sum, t) => sum + t.amount, 0);
    const transactionsByMonth = transactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          amount: 0,
          count: 0
        };
      }
      
      acc[monthYear].amount += t.amount;
      acc[monthYear].count += 1;
      
      return acc;
    }, {} as Record<string, { month: string; amount: number; count: number }>);
    
    res.json({
      userId: userIdInt,
      totalTransactions: transactions.length,
      totalReceived,
      monthlyData: Object.values(transactionsByMonth).sort((a, b) => a.month.localeCompare(b.month)),
      transactions: enrichedTransactions
    });
  } catch (error) {
    console.error('Error getting user ROI transactions:', error);
    res.status(500).json({ message: 'Server error retrieving user ROI transactions' });
  }
});

// Manually trigger/update ROI for a user
router.post('/roi/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, investmentId, notes } = req.body;
    
    if (!userId || !amount || !investmentId) {
      return res.status(400).json({ 
        message: 'User ID, amount, and investment ID are required' 
      });
    }
    
    const userIdInt = parseInt(userId);
    const amountInt = parseInt(amount);
    const investmentIdInt = parseInt(investmentId);
    
    // Validate user exists
    const user = await storage.getUser(userIdInt);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate investment exists and belongs to the user
    const investment = await storage.getInvestment(investmentIdInt);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    if (investment.userId !== userIdInt) {
      return res.status(403).json({ 
        message: 'Investment does not belong to the specified user' 
      });
    }
    
    // Create a manual ROI distribution for this property
    const distribution = await storage.createROIDistribution({
      propertyId: investment.propertyId,
      percentage: (amountInt / investment.amount) * 100, // Calculate percentage based on amount
      amount: amountInt,
      date: new Date(),
      status: 'Completed',
      notes: `Manual ROI adjustment: ${notes || 'No notes provided'}`,
      processedAt: new Date()
    });
    
    // Create ROI transaction
    const transaction = await storage.createROITransaction({
      userId: userIdInt,
      investmentId: investmentIdInt,
      distributionId: distribution.id,
      amount: amountInt,
      date: new Date(),
      status: 'Completed'
    });
    
    // Update investment earnings
    const newEarnings = (investment.earnings || 0) + amountInt;
    await storage.updateInvestment(investmentIdInt, {
      earnings: newEarnings,
      returns: newEarnings
    });
    
    res.status(201).json({
      success: true,
      message: 'Manual ROI processed successfully',
      transaction,
      distribution,
      updatedInvestment: {
        ...investment,
        earnings: newEarnings,
        returns: newEarnings
      }
    });
  } catch (error) {
    console.error('Error processing manual ROI:', error);
    res.status(500).json({ message: 'Server error processing manual ROI' });
  }
});

// Get admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    const properties = await storage.getAllProperties();
    const investments = await storage.getAllInvestments();
    const distributions = await storage.getAllROIDistributions();
    const transactions = await storage.getAllROITransactions();
    
    // Calculate statistics
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.active !== false).length;
    const adminUsers = users.filter(user => user.isAdmin).length;
    const totalProperties = properties.length;
    const activeProperties = properties.filter(prop => prop.status === 'Active').length;
    
    // Investment and ROI stats
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalROIPaid = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalInvestors = new Set(investments.map(inv => inv.userId)).size;
    
    // Property stats by type
    const propertiesByType = properties.reduce((acc, property) => {
      acc[property.type] = (acc[property.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Property stats by status
    const propertiesByStatus = properties.reduce((acc, property) => {
      acc[property.status || 'Active'] = (acc[property.status || 'Active'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Monthly investment data for charts
    const investmentsByMonth = investments.reduce((acc, inv) => {
      const date = new Date(inv.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          amount: 0,
          count: 0
        };
      }
      
      acc[monthYear].amount += inv.amount;
      acc[monthYear].count += 1;
      
      return acc;
    }, {} as Record<string, { month: string; amount: number; count: number }>);
    
    res.json({
      userStats: {
        totalUsers,
        activeUsers,
        adminUsers,
        totalInvestors
      },
      propertyStats: {
        totalProperties,
        activeProperties,
        propertiesByType,
        propertiesByStatus
      },
      investmentStats: {
        totalInvested,
        totalInvestments: investments.length,
        averageInvestmentAmount: totalInvested / investments.length || 0,
        investmentsByMonth: Object.values(investmentsByMonth).sort((a, b) => a.month.localeCompare(b.month))
      },
      roiStats: {
        totalROIPaid,
        totalDistributions: distributions.length,
        totalTransactions: transactions.length,
        averageROIPercentage: distributions.length > 0 
          ? distributions.reduce((sum, dist) => sum + parseFloat(dist.percentage.toString()), 0) / distributions.length 
          : 0
      },
      recentUsers: users.slice(-5).reverse(),
      recentProperties: properties.slice(-5).reverse(),
      recentInvestments: investments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ message: 'Failed to fetch admin dashboard data' });
  }
});

export default router;