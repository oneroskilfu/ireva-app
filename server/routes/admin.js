import express from 'express';
import { verifyToken } from '../auth-jwt.js';

const router = express.Router();

// Get admin dashboard stats
router.get('/stats', verifyToken, (req, res) => {
  // In a real application, these would come from database queries
  res.json({
    users: 124,
    projects: 8,
    pendingKYCs: 3,
    totalInvestment: 7500000,
  });
});

// Get analytics data for charts
router.get('/analytics', verifyToken, (req, res) => {
  res.json({
    investments: [
      { month: 'Jan', amount: 4000000, count: 24 },
      { month: 'Feb', amount: 3000000, count: 18 },
      { month: 'Mar', amount: 5000000, count: 27 },
      { month: 'Apr', amount: 2780000, count: 15 },
      { month: 'May', amount: 7890000, count: 35 },
      { month: 'Jun', amount: 2390000, count: 12 },
      { month: 'Jul', amount: 3490000, count: 21 },
    ],
    users: [
      { month: 'Jan', newUsers: 40, activeUsers: 24 },
      { month: 'Feb', newUsers: 30, activeUsers: 18 },
      { month: 'Mar', newUsers: 50, activeUsers: 27 },
      { month: 'Apr', newUsers: 27, activeUsers: 15 },
      { month: 'May', newUsers: 78, activeUsers: 35 },
      { month: 'Jun', newUsers: 23, activeUsers: 12 },
      { month: 'Jul', newUsers: 34, activeUsers: 21 },
    ],
    properties: [
      { month: 'Jan', listed: 4, funded: 2 },
      { month: 'Feb', listed: 3, funded: 1 },
      { month: 'Mar', listed: 5, funded: 3 },
      { month: 'Apr', listed: 2, funded: 2 },
      { month: 'May', listed: 7, funded: 4 },
      { month: 'Jun', listed: 2, funded: 1 },
      { month: 'Jul', listed: 3, funded: 2 },
    ],
    distributions: [
      { name: 'Residential', value: 400 },
      { name: 'Commercial', value: 300 },
      { name: 'Mixed Use', value: 200 },
      { name: 'Industrial', value: 100 },
      { name: 'Land', value: 150 },
    ],
  });
});

// Get all KYC submissions with filter by status (pending, verified, rejected)
router.get('/kyc/:status?', verifyToken, async (req, res) => {
  try {
    const status = req.params.status || 'pending';
    
    // In a production app, this would come from the database
    // Example using the storage interface:
    // const submissions = await storage.getKycSubmissionsByStatus(status);
    
    // Mock data for demonstration
    const submissions = [
      {
        id: 1,
        userId: 1,
        fullName: "John Doe",
        idType: "national_id",
        idNumber: "123456789",
        bankName: "First Bank",
        accountNumber: "1234567890",
        address: "123 Main Street, Lagos",
        frontImage: "https://i.imgur.com/example1.jpg",
        backImage: "https://i.imgur.com/example2.jpg",
        selfieImage: "https://i.imgur.com/example3.jpg",
        status: status,
        submittedAt: new Date().toISOString(),
        user: {
          username: "johndoe",
          email: "john@example.com",
          phoneNumber: "+2347012345678"
        }
      },
      {
        id: 2,
        userId: 2,
        fullName: "Jane Smith",
        idType: "drivers_license",
        idNumber: "987654321",
        bankName: "Access Bank",
        accountNumber: "0987654321",
        address: "456 Second Avenue, Abuja",
        frontImage: "https://i.imgur.com/example4.jpg",
        backImage: "https://i.imgur.com/example5.jpg",
        selfieImage: "https://i.imgur.com/example6.jpg",
        addressProofImage: "https://i.imgur.com/example7.jpg",
        addressProofType: "utility_bill",
        status: status,
        submittedAt: new Date().toISOString(),
        user: {
          username: "janesmith",
          email: "jane@example.com",
          phoneNumber: "+2348012345678"
        }
      }
    ];

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching KYC submissions:', error);
    res.status(500).json({ error: 'Failed to fetch KYC submissions' });
  }
});

// Verify or reject KYC submission
router.patch('/kyc/:id/verify', verifyToken, async (req, res) => {
  try {
    const submissionId = parseInt(req.params.id);
    const { status, rejectionReason } = req.body;
    
    // In a production app, this would update the database
    // Example using the storage interface:
    // const updatedSubmission = await storage.updateKycSubmissionStatus(submissionId, status, rejectionReason);
    
    // Mock response for demonstration
    const updatedSubmission = {
      id: submissionId,
      status,
      rejectionReason,
      verifiedAt: status === 'verified' ? new Date().toISOString() : null,
      verifiedBy: req.user.id,
    };
    
    res.json(updatedSubmission);
  } catch (error) {
    console.error('Error updating KYC submission:', error);
    res.status(500).json({ error: 'Failed to update KYC submission' });
  }
});

// Get all users (for admin management)
router.get('/users', verifyToken, async (req, res) => {
  try {
    // In a production app, this would come from the database
    // Example using the storage interface:
    // const users = await storage.getAllUsers();
    
    // Mock data for demonstration
    const users = [
      {
        id: 1,
        username: "johndoe",
        email: "john@example.com",
        role: "user",
        firstName: "John",
        lastName: "Doe",
        kycStatus: "verified",
        createdAt: new Date().toISOString(),
        totalInvested: 500000,
      },
      {
        id: 2,
        username: "janesmith",
        email: "jane@example.com",
        role: "user",
        firstName: "Jane",
        lastName: "Smith",
        kycStatus: "pending",
        createdAt: new Date().toISOString(),
        totalInvested: 250000,
      }
    ];
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get properties (for admin management)
router.get('/properties', verifyToken, async (req, res) => {
  try {
    // In a production app, this would come from the database
    // Example using the storage interface:
    // const properties = await storage.getAllPropertiesWithDetails();
    
    // Mock data for demonstration
    const properties = [
      {
        id: 1,
        name: "Skyline Apartments",
        location: "Lagos",
        type: "residential",
        totalFunding: 5000000,
        currentFunding: 3200000,
        targetReturn: "12.5",
        numberOfInvestors: 180,
        status: "active",
        developerId: 1,
        developerName: "Skyline Developers Ltd",
      },
      {
        id: 2,
        name: "Green Office Complex",
        location: "Abuja",
        type: "commercial",
        totalFunding: 8000000,
        currentFunding: 4500000,
        targetReturn: "15.0",
        numberOfInvestors: 95,
        status: "active",
        developerId: 2,
        developerName: "Green Commercial Properties",
      }
    ];
    
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get investments (for admin management)
router.get('/investments', verifyToken, async (req, res) => {
  try {
    // In a production app, this would come from the database
    // Example using the storage interface:
    // const investments = await storage.getAllInvestmentsWithDetails();
    
    // Mock data for demonstration
    const investments = [
      {
        id: 1,
        userId: 1,
        userName: "John Doe",
        propertyId: 1,
        propertyName: "Skyline Apartments",
        amount: 200000,
        date: new Date().toISOString(),
        status: "active",
        earnings: 15000,
      },
      {
        id: 2,
        userId: 2,
        userName: "Jane Smith",
        propertyId: 1,
        propertyName: "Skyline Apartments",
        amount: 150000,
        date: new Date().toISOString(),
        status: "active",
        earnings: 10000,
      }
    ];
    
    res.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

export default router;