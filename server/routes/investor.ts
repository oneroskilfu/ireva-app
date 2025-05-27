import express from 'express';
import { storage } from '../storage';
import { authenticateToken } from '../auth';

const router = express.Router();

// Middleware to check investor role (or admin can access too)
const requireInvestor = (req: any, res: any, next: any) => {
  if (!req.user || !['investor', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Investor access required' });
  }
  next();
};

// Get investor portfolio statistics
router.get('/stats', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's investment statistics
    const investments = await storage.getUserInvestments(userId);
    const properties = await storage.getUserProperties(userId);
    const kycStatus = await storage.getUserKYCStatus(userId);

    const totalInvestments = investments.length;
    const totalValue = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0);
    const activeProperties = properties.filter((p: any) => p.status === 'active').length;
    
    // Calculate expected returns (simplified calculation)
    const expectedReturns = investments.reduce((sum: number, inv: any) => {
      return sum + (inv.amount * (inv.expectedROI / 100));
    }, 0);

    // Calculate portfolio growth
    const currentValue = investments.reduce((sum: number, inv: any) => {
      return sum + inv.currentValue;
    }, 0);
    const portfolioGrowth = totalValue > 0 ? ((currentValue - totalValue) / totalValue * 100) : 0;

    const stats = {
      totalInvestments,
      totalValue,
      activeProperties,
      expectedReturns,
      portfolioGrowth,
      kycStatus: kycStatus?.status || 'incomplete'
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching investor stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get investor's properties
router.get('/properties', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const properties = await storage.getUserPropertiesWithDetails(userId);
    res.json(properties);
  } catch (error) {
    console.error('Error fetching user properties:', error);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// Get investment history
router.get('/investments', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 50, status, propertyId } = req.query;

    const investments = await storage.getUserInvestmentHistory(userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as string,
      propertyId: propertyId ? parseInt(propertyId as string) : undefined
    });

    res.json(investments);
  } catch (error) {
    console.error('Error fetching investment history:', error);
    res.status(500).json({ message: 'Failed to fetch investment history' });
  }
});

// Get specific investment details
router.get('/investments/:id', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const investment = await storage.getInvestmentDetails(parseInt(id), userId);
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json(investment);
  } catch (error) {
    console.error('Error fetching investment details:', error);
    res.status(500).json({ message: 'Failed to fetch investment details' });
  }
});

// Get KYC status and documents
router.get('/kyc', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const kycData = await storage.getUserKYCData(userId);
    
    res.json(kycData || {
      status: 'incomplete',
      documents: [],
      submittedAt: null,
      reviewedAt: null
    });
  } catch (error) {
    console.error('Error fetching KYC data:', error);
    res.status(500).json({ message: 'Failed to fetch KYC data' });
  }
});

// Submit KYC documents
router.post('/kyc/submit', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const { documents } = req.body;

    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ message: 'Documents array is required' });
    }

    const kycSubmission = await storage.submitKYCDocuments(userId, documents);
    
    res.status(201).json({
      message: 'KYC documents submitted successfully',
      submission: kycSubmission
    });
  } catch (error) {
    console.error('Error submitting KYC documents:', error);
    res.status(500).json({ message: 'Failed to submit KYC documents' });
  }
});

// Update KYC document
router.patch('/kyc/documents/:docId', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const { docId } = req.params;
    const updateData = req.body;

    const updatedDocument = await storage.updateKYCDocument(parseInt(docId), userId, updateData);
    
    if (!updatedDocument) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({
      message: 'Document updated successfully',
      document: updatedDocument
    });
  } catch (error) {
    console.error('Error updating KYC document:', error);
    res.status(500).json({ message: 'Failed to update document' });
  }
});

// Get portfolio performance analytics
router.get('/analytics/portfolio', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '1y' } = req.query;

    const analytics = await storage.getPortfolioAnalytics(userId, period as string);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching portfolio analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Get investment performance by property
router.get('/analytics/performance', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const performance = await storage.getInvestmentPerformance(userId);
    res.json(performance);
  } catch (error) {
    console.error('Error fetching investment performance:', error);
    res.status(500).json({ message: 'Failed to fetch performance data' });
  }
});

// Get dividend/return history
router.get('/dividends', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const dividends = await storage.getUserDividends(userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    res.json(dividends);
  } catch (error) {
    console.error('Error fetching dividends:', error);
    res.status(500).json({ message: 'Failed to fetch dividend history' });
  }
});

// Export investment data
router.get('/export', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const { format = 'csv', type = 'investments' } = req.query;

    let exportData;
    let filename;

    switch (type) {
      case 'investments':
        exportData = await storage.getUserInvestmentHistory(userId, { limit: 1000 });
        filename = `investments_${userId}.${format}`;
        break;
      case 'properties':
        exportData = await storage.getUserPropertiesWithDetails(userId);
        filename = `properties_${userId}.${format}`;
        break;
      case 'dividends':
        exportData = await storage.getUserDividends(userId, { limit: 1000 });
        filename = `dividends_${userId}.${format}`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      // Convert to CSV based on data type
      let csvData = '';
      if (type === 'investments') {
        csvData = exportData.map((inv: any) => 
          `${inv.id},${inv.propertyTitle},${inv.amount},${inv.investmentDate},${inv.status}`
        ).join('\n');
        res.send(`ID,Property,Amount,Date,Status\n${csvData}`);
      } else if (type === 'properties') {
        csvData = exportData.map((prop: any) => 
          `${prop.id},${prop.title},${prop.location},${prop.investmentAmount},${prop.currentROI}`
        ).join('\n');
        res.send(`ID,Title,Location,Investment,Current ROI\n${csvData}`);
      } else {
        csvData = exportData.map((div: any) => 
          `${div.id},${div.propertyTitle},${div.amount},${div.paymentDate}`
        ).join('\n');
        res.send(`ID,Property,Amount,Payment Date\n${csvData}`);
      }
    } else {
      res.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
});

// Update investor preferences
router.patch('/preferences', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    const updatedUser = await storage.updateUserPreferences(userId, preferences);
    
    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedUser.preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ message: 'Failed to update preferences' });
  }
});

// Get investment recommendations
router.get('/recommendations', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    const recommendations = await storage.getInvestmentRecommendations(userId, parseInt(limit as string));
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

// Get notifications for investor
router.get('/notifications', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const notifications = await storage.getUserNotifications(userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      unreadOnly: unreadOnly === 'true'
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await storage.markNotificationAsRead(parseInt(id), userId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to update notification' });
  }
});

// Get investment summary for tax purposes
router.get('/tax-summary/:year', authenticateToken, requireInvestor, async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.params;

    const taxSummary = await storage.getInvestmentTaxSummary(userId, parseInt(year));
    res.json(taxSummary);
  } catch (error) {
    console.error('Error fetching tax summary:', error);
    res.status(500).json({ message: 'Failed to fetch tax summary' });
  }
});

export default router;