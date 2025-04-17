import express from 'express';
import { verifyToken } from '../auth-jwt.js';

const router = express.Router();

// Get investor dashboard stats
router.get('/dashboard', verifyToken, (req, res) => {
  // In a real application, these would come from database queries
  res.json({
    totalInvested: 285000,
    totalEarnings: 28000,
    activeInvestments: 4,
    nextPayout: 8500,
    portfolioGrowth: 9.8
  });
});

// Get investor portfolio summary
router.get('/portfolio', verifyToken, (req, res) => {
  // In a real application, these would come from database queries
  res.json({
    totalInvestment: 200000,
    projectsInvested: 4,
    roiEarned: 35000,
    walletBalance: 12000,
  });
});

// Get investor investments
router.get('/investments', verifyToken, async (req, res) => {
  try {
    // In a production app, this would come from the database
    // Example using the storage interface:
    // const investments = await storage.getUserInvestments(req.user.id);
    
    // Mock data for demonstration
    const investments = [
      {
        id: 1,
        propertyId: 1,
        propertyName: "Skyline Apartments",
        location: "Lagos",
        type: "residential",
        imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        amount: 50000,
        date: "2023-04-10T00:00:00.000Z",
        status: "active",
        currentValue: 55000,
        earnings: 5000,
        roi: 10,
        term: 36,
        maturityDate: "2026-04-10T00:00:00.000Z"
      },
      {
        id: 2,
        propertyId: 2,
        propertyName: "Green Office Complex",
        location: "Abuja",
        type: "commercial",
        imageUrl: "https://images.unsplash.com/photo-1577979749830-f1d742b96791?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        amount: 75000,
        date: "2023-02-15T00:00:00.000Z",
        status: "active",
        currentValue: 85000,
        earnings: 10000,
        roi: 13.33,
        term: 36,
        maturityDate: "2026-02-15T00:00:00.000Z"
      },
      {
        id: 3,
        propertyId: 3,
        propertyName: "Palm Villas",
        location: "Lagos",
        type: "residential",
        imageUrl: "https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        amount: 60000,
        date: "2023-06-20T00:00:00.000Z",
        status: "active",
        currentValue: 63000,
        earnings: 3000,
        roi: 5,
        term: 36,
        maturityDate: "2026-06-20T00:00:00.000Z"
      },
      {
        id: 4,
        propertyId: 4,
        propertyName: "Industrial Warehouse",
        location: "Port Harcourt",
        type: "industrial",
        imageUrl: "https://images.unsplash.com/photo-1586528116493-a029325540ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        amount: 100000,
        date: "2023-05-05T00:00:00.000Z",
        status: "active",
        currentValue: 110000,
        earnings: 10000,
        roi: 10,
        term: 36,
        maturityDate: "2026-05-05T00:00:00.000Z"
      }
    ];
    
    res.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// Get investor wallet transactions
router.get('/wallet/transactions', verifyToken, async (req, res) => {
  try {
    // In a production app, this would come from the database
    // Example using the storage interface:
    // const transactions = await storage.getUserWalletTransactions(req.user.id);
    
    // Mock data for demonstration
    const transactions = [
      {
        id: 1,
        amount: 50000,
        type: "deposit",
        description: "Initial deposit",
        reference: "TRX123456",
        balanceBefore: 0,
        balanceAfter: 50000,
        status: "completed",
        createdAt: "2023-03-10T10:00:00.000Z"
      },
      {
        id: 2,
        amount: 25000,
        type: "investment",
        description: "Investment in Skyline Apartments",
        reference: "INV123456",
        balanceBefore: 50000,
        balanceAfter: 25000,
        status: "completed",
        propertyId: 1,
        investmentId: 1,
        createdAt: "2023-04-10T14:30:00.000Z"
      },
      {
        id: 3,
        amount: 20000,
        type: "deposit",
        description: "Wallet top-up",
        reference: "TRX234567",
        balanceBefore: 25000,
        balanceAfter: 45000,
        status: "completed",
        createdAt: "2023-05-15T09:45:00.000Z"
      },
      {
        id: 4,
        amount: 35000,
        type: "investment",
        description: "Investment in Green Office Complex",
        reference: "INV234567",
        balanceBefore: 45000,
        balanceAfter: 10000,
        status: "completed",
        propertyId: 2,
        investmentId: 2,
        createdAt: "2023-05-20T16:15:00.000Z"
      },
      {
        id: 5,
        amount: 5000,
        type: "return",
        description: "Monthly return from Skyline Apartments",
        reference: "RTN123456",
        balanceBefore: 10000,
        balanceAfter: 15000,
        status: "completed",
        propertyId: 1,
        investmentId: 1,
        createdAt: "2023-06-10T12:00:00.000Z"
      },
      {
        id: 6,
        amount: 3000,
        type: "withdrawal",
        description: "Withdrawal to bank account",
        reference: "WTH123456",
        balanceBefore: 15000,
        balanceAfter: 12000,
        status: "completed",
        createdAt: "2023-07-05T10:30:00.000Z"
      }
    ];
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ error: 'Failed to fetch wallet transactions' });
  }
});

// Get user's KYC status
router.get('/kyc/status', verifyToken, async (req, res) => {
  try {
    // In a production app, this would come from the database
    // Example using the storage interface:
    // const kycStatus = await storage.getUserKycStatus(req.user.id);
    
    // Mock data for demonstration
    const kycStatus = {
      status: "pending", // not_started, pending, verified, rejected
      submittedAt: "2023-06-20T15:30:00.000Z",
      verifiedAt: null,
      rejectionReason: null,
      documents: {
        idType: "national_id",
        idNumber: "123456789",
        hasFrontImage: true,
        hasBackImage: true,
        hasSelfie: true,
        hasAddressProof: false
      }
    };
    
    res.json(kycStatus);
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    res.status(500).json({ error: 'Failed to fetch KYC status' });
  }
});

// Submit KYC documents
router.post('/kyc/submit', verifyToken, async (req, res) => {
  try {
    const { 
      fullName, 
      idType, 
      idNumber, 
      bankName, 
      accountNumber, 
      address, 
      frontImage, 
      backImage, 
      selfieImage, 
      addressProofImage, 
      addressProofType 
    } = req.body;
    
    // Validate required fields
    if (!fullName || !idType || !idNumber || !bankName || !accountNumber || !address || !frontImage || !selfieImage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // In a production app, this would save to the database
    // Example using the storage interface:
    // const submission = await storage.createKycSubmission({
    //   userId: req.user.id,
    //   fullName,
    //   idType,
    //   idNumber,
    //   bankName,
    //   accountNumber,
    //   address,
    //   frontImage,
    //   backImage,
    //   selfieImage,
    //   addressProofImage,
    //   addressProofType
    // });
    
    // Mock response for demonstration
    const submission = {
      id: 123,
      userId: req.user.id,
      fullName,
      idType,
      idNumber,
      bankName,
      accountNumber,
      address,
      status: "pending",
      submittedAt: new Date().toISOString()
    };
    
    res.status(201).json(submission);
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ error: 'Failed to submit KYC documents' });
  }
});

// Get available properties for investment
router.get('/available-properties', verifyToken, async (req, res) => {
  try {
    // In a production app, this would come from the database
    // Example using the storage interface:
    // const properties = await storage.getAvailableProperties();
    
    // Mock data for demonstration
    const properties = [
      {
        id: 1,
        name: "Skyline Apartments",
        location: "Lagos",
        description: "Modern apartment complex in Ikoyi with 120 units and premium amenities.",
        type: "residential",
        imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        imageGallery: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
        tier: "premium",
        targetReturn: "12.5",
        minimumInvestment: 50000,
        term: 36,
        totalFunding: 5000000,
        currentFunding: 3200000,
        numberOfInvestors: 180,
        daysLeft: 28,
        amenities: ["Pool", "Gym", "Security", "Parking"],
        developer: "Skyline Developers Ltd"
      },
      {
        id: 2,
        name: "Green Office Complex",
        location: "Abuja",
        description: "A-grade office complex in the Central Business District featuring sustainable design.",
        type: "commercial",
        imageUrl: "https://images.unsplash.com/photo-1577979749830-f1d742b96791?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        imageGallery: ["https://images.unsplash.com/photo-1577979749830-f1d742b96791?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
        tier: "elite",
        targetReturn: "15.0",
        minimumInvestment: 100000,
        term: 48,
        totalFunding: 8000000,
        currentFunding: 4500000,
        numberOfInvestors: 95,
        daysLeft: 35,
        amenities: ["Backup Power", "Security", "Parking", "Conference Center"],
        developer: "Green Commercial Properties"
      },
      {
        id: 3,
        name: "Palm Villas",
        location: "Lagos",
        description: "Luxury villa development in Lekki with private beach access.",
        type: "residential",
        imageUrl: "https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        imageGallery: ["https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
        tier: "growth",
        targetReturn: "11.0",
        minimumInvestment: 75000,
        term: 36,
        totalFunding: 6000000,
        currentFunding: 2800000,
        numberOfInvestors: 65,
        daysLeft: 45,
        amenities: ["Beach Access", "Pool", "Security", "Garden"],
        developer: "Palm Developers"
      },
      {
        id: 4,
        name: "Industrial Warehouse",
        location: "Port Harcourt",
        description: "Modern logistics warehouse with excellent transportation links.",
        type: "industrial",
        imageUrl: "https://images.unsplash.com/photo-1586528116493-a029325540ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        imageGallery: ["https://images.unsplash.com/photo-1586528116493-a029325540ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"],
        tier: "starter",
        targetReturn: "13.0",
        minimumInvestment: 25000,
        term: 30,
        totalFunding: 3000000,
        currentFunding: 1500000,
        numberOfInvestors: 110,
        daysLeft: 20,
        amenities: ["Loading Bays", "Security", "Office Space"],
        developer: "Industrial Solutions Ltd"
      }
    ];
    
    res.json(properties);
  } catch (error) {
    console.error('Error fetching available properties:', error);
    res.status(500).json({ error: 'Failed to fetch available properties' });
  }
});

// Get investor notifications
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    // In a production app, this would come from the database
    // Example using the storage interface:
    // const notifications = await storage.getUserNotifications(req.user.id);
    
    // Mock data for demonstration
    const notifications = [
      {
        id: 1,
        type: "investment",
        title: "Investment Confirmed",
        message: "Your investment of ₦50,000 in Skyline Apartments has been confirmed.",
        isRead: true,
        createdAt: "2023-04-10T14:35:00.000Z",
        readAt: "2023-04-10T15:20:00.000Z"
      },
      {
        id: 2,
        type: "return",
        title: "Return Received",
        message: "You've received a return of ₦5,000 from your investment in Skyline Apartments.",
        isRead: true,
        createdAt: "2023-06-10T12:05:00.000Z",
        readAt: "2023-06-10T14:30:00.000Z"
      },
      {
        id: 3,
        type: "property",
        title: "New Property Available",
        message: "A new investment opportunity is now available: Palm Villas in Lagos.",
        isRead: false,
        createdAt: "2023-06-15T09:00:00.000Z",
        readAt: null
      },
      {
        id: 4,
        type: "kyc",
        title: "KYC Submission Received",
        message: "Your KYC documents have been received and are under review.",
        isRead: false,
        createdAt: "2023-06-20T15:35:00.000Z",
        readAt: null
      }
    ];
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Make an investment
router.post('/invest', verifyToken, async (req, res) => {
  try {
    const { propertyId, amount, paymentMethod } = req.body;
    
    // Validate required fields
    if (!propertyId || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // In a production app, this would verify and process the investment
    // Example using the storage interface:
    // const investment = await storage.createInvestment({
    //   userId: req.user.id,
    //   propertyId,
    //   amount,
    //   paymentMethod
    // });
    
    // Mock response for demonstration
    const investment = {
      id: 999,
      userId: req.user.id,
      propertyId,
      amount,
      date: new Date().toISOString(),
      status: "active",
      currentValue: amount,
      completedDate: null,
      earnings: 0,
      reference: `INV${Math.floor(Math.random() * 1000000)}`,
      transactionId: `TRX${Math.floor(Math.random() * 1000000)}`
    };
    
    res.status(201).json(investment);
  } catch (error) {
    console.error('Error processing investment:', error);
    res.status(500).json({ error: 'Failed to process investment' });
  }
});

export default router;