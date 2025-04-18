const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { authMiddleware } = require('../auth-jwt');

// Get current user's transactions
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .populate('projectId', 'name type location imageUrl');
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// Get transaction by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    const transactionId = req.params.id;
    
    const transaction = await Transaction.findById(transactionId)
      .populate('projectId', 'name type location imageUrl description targetReturn');
    
    // Check if transaction exists
    if (!transaction) {
      return res.status(404).json({
        success: false, 
        message: 'Transaction not found'
      });
    }
    
    // Check if transaction belongs to user
    if (transaction.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction'
      });
    }
    
    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction',
      error: error.message
    });
  }
});

// Create a deposit transaction
router.post('/deposit', authMiddleware, async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    const { amount, paymentMethod } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }
    
    // Create reference number
    const reference = `DEP-${Date.now()}`;
    
    // Create transaction
    const transaction = await Transaction.create({
      userId,
      amount,
      type: 'deposit',
      reference,
      status: 'completed',
      description: `Deposit via ${paymentMethod || 'bank transfer'}`,
      metadata: { paymentMethod }
    });
    
    // Update user wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
    }
    
    wallet.balance += amount;
    wallet.totalDeposited += amount;
    await wallet.save();
    
    res.status(201).json({
      success: true,
      data: {
        transaction,
        wallet: {
          balance: wallet.balance,
          totalDeposited: wallet.totalDeposited
        }
      }
    });
  } catch (error) {
    console.error('Error creating deposit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process deposit',
      error: error.message
    });
  }
});

// Create a withdrawal request
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    const { amount, bankDetails } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }
    
    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.bankName) {
      return res.status(400).json({
        success: false,
        message: 'Bank details are required'
      });
    }
    
    // Check wallet balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient funds'
      });
    }
    
    // Create reference number
    const reference = `WIT-${Date.now()}`;
    
    // Create transaction (initially pending)
    const transaction = await Transaction.create({
      userId,
      amount,
      type: 'withdrawal',
      reference,
      status: 'pending',
      description: `Withdrawal to ${bankDetails.bankName} account ending with ${bankDetails.accountNumber.slice(-4)}`,
      metadata: { bankDetails }
    });
    
    // Update user wallet (reserve the amount)
    wallet.balance -= amount;
    await wallet.save();
    
    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted and is being processed',
      data: {
        transaction,
        wallet: {
          balance: wallet.balance
        }
      }
    });
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal request',
      error: error.message
    });
  }
});

// Get user wallet info
router.get('/wallet', authMiddleware, async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    
    // Find or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId });
    }
    
    // Get recent transactions
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('projectId', 'name');
    
    // Count transactions by type
    const depositCount = await Transaction.countDocuments({ userId, type: 'deposit' });
    const withdrawalCount = await Transaction.countDocuments({ userId, type: 'withdrawal' });
    const investmentCount = await Transaction.countDocuments({ userId, type: 'investment' });
    
    res.status(200).json({
      success: true,
      data: {
        wallet,
        recentTransactions,
        stats: {
          depositCount,
          withdrawalCount,
          investmentCount
        }
      }
    });
  } catch (error) {
    console.error('Error fetching wallet info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet information',
      error: error.message
    });
  }
});

module.exports = router;