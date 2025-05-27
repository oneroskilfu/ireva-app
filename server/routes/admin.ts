import express from 'express';
import { storage } from '../storage';
import { authenticateToken } from '../auth';

const router = express.Router();

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get admin statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await storage.getUserCount();
    const totalProperties = await storage.getPropertyCount();
    const totalInvestments = await storage.getInvestmentCount();
    const totalRevenue = await storage.getTotalRevenue();

    // Get monthly growth data
    const monthlyGrowth = await storage.getMonthlyGrowth();

    const stats = {
      totalUsers,
      totalProperties,
      totalInvestments,
      totalRevenue,
      monthlyGrowth: {
        users: monthlyGrowth.userGrowth || 0,
        properties: monthlyGrowth.propertyGrowth || 0,
        revenue: monthlyGrowth.revenueGrowth || 0,
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get all users for admin management
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await storage.getAllUsersWithStats();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await storage.getUserWithDetails(parseInt(id));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedUser = await storage.updateUserStatus(parseInt(id), isActive);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Update user role
router.patch('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['investor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const updatedUser = await storage.updateUserRole(parseInt(id), role);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Get all properties for admin management
router.get('/properties', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const properties = await storage.getAllPropertiesWithStats();
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// Create new property
router.post('/properties', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const propertyData = req.body;
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'location', 'price', 'propertyType', 'targetAmount'];
    for (const field of requiredFields) {
      if (!propertyData[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const property = await storage.createProperty({
      ...propertyData,
      status: 'active',
      raisedAmount: 0,
      createdAt: new Date(),
      images: propertyData.images || [],
      features: propertyData.features || [],
      specifications: propertyData.specifications || {},
      developer: propertyData.developer || {},
      documents: propertyData.documents || [],
      timeline: propertyData.timeline || [],
      risks: propertyData.risks || [],
      returns: propertyData.returns || {}
    });

    res.status(201).json({
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({ message: 'Failed to create property' });
  }
});

// Update property
router.put('/properties/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProperty = await storage.updateProperty(parseInt(id), updateData);
    
    if (!updatedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ message: 'Failed to update property' });
  }
});

// Delete property
router.delete('/properties/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property has investments
    const investmentCount = await storage.getPropertyInvestmentCount(parseInt(id));
    
    if (investmentCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete property with existing investments' 
      });
    }

    const deleted = await storage.deleteProperty(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ message: 'Failed to delete property' });
  }
});

// Get property details with investments
router.get('/properties/:id/details', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const propertyDetails = await storage.getPropertyWithInvestments(parseInt(id));
    
    if (!propertyDetails) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(propertyDetails);
  } catch (error) {
    console.error('Error fetching property details:', error);
    res.status(500).json({ message: 'Failed to fetch property details' });
  }
});

// Get investment analytics
router.get('/analytics/investments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const analytics = await storage.getInvestmentAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching investment analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Get user analytics
router.get('/analytics/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const analytics = await storage.getUserAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ message: 'Failed to fetch user analytics' });
  }
});

// Get platform performance metrics
router.get('/analytics/performance', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const performance = await storage.getPlatformPerformance();
    res.json(performance);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ message: 'Failed to fetch performance metrics' });
  }
});

// Update platform settings
router.patch('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = req.body;
    const updatedSettings = await storage.updatePlatformSettings(settings);
    
    res.json({
      message: 'Platform settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// Export investment data
router.get('/export/investments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;
    
    const investmentData = await storage.getInvestmentDataForExport({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=investments.csv');
      
      // Convert to CSV format
      const csvData = investmentData.map(investment => 
        `${investment.id},${investment.userId},${investment.propertyId},${investment.amount},${investment.createdAt}`
      ).join('\n');
      
      res.send(`ID,User ID,Property ID,Amount,Date\n${csvData}`);
    } else {
      res.json(investmentData);
    }
  } catch (error) {
    console.error('Error exporting investment data:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
});

// Get audit logs
router.get('/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query;
    
    const logs = await storage.getAuditLogs({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      action: action as string,
      userId: userId ? parseInt(userId as string) : undefined
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Failed to fetch audit logs' });
  }
});

export default router;