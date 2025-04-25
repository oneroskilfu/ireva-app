import mongoose from 'mongoose';
import Investment from '../models/Investment';
import Transaction from '../models/Transaction.js';
import Wallet from '../models/Wallet.js';
import Project from '../models/Project';
import { generateInvestmentReference } from '../utils/referenceGenerator.js';
import { CryptoPaymentService } from '../services/crypto-payment-service.js';

// Initialize the crypto payment service
const cryptoPaymentService = new CryptoPaymentService();

/**
 * Create a new investment
 */
const investInProject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, projectId, amount } = req.body;

    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Validate minimum investment amount
    if (amount < project.minimumInvestment) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum investment amount is ${project.minimumInvestment}` 
      });
    }

    // Find or create user wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
    }

    // Check wallet balance
    if (wallet.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient funds in wallet' 
      });
    }

    // Generate a unique reference
    const reference = generateInvestmentReference();

    // Create investment
    const investment = await Investment.create({
      userId,
      projectId,
      amount,
      investmentDate: new Date(),
      status: 'active',
      reference
    });

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      amount,
      type: 'investment',
      reference,
      projectId,
      status: 'completed',
      description: `Investment in ${project.name}`
    });

    // Update wallet
    wallet.balance -= amount;
    wallet.totalInvested += amount;
    await wallet.save();

    // Update project funding
    project.currentFunding += amount;
    project.numberOfInvestors = await Investment.countDocuments({ projectId, status: { $ne: 'cancelled' } });
    await project.save();

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Return success response
    res.status(201).json({ 
      success: true, 
      investment,
      transaction,
      wallet: {
        balance: wallet.balance,
        totalInvested: wallet.totalInvested
      }
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error('Investment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process investment',
      error: error.message
    });
  }
};

/**
 * Handle crypto investment in a project
 * This function:
 * 1. Validates the amount and currency
 * 2. Generates a payment session or wallet address via CoinGate/internal system
 * 3. Saves the transaction with a 'pending' status
 * 4. Sets up for webhook notification or polling for confirmation
 */
const handleCryptoInvestment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, projectId, amount, currency, network } = req.body;
    
    // Validate input parameters
    if (!userId || !projectId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userId, projectId, amount'
      });
    }
    
    // Validate currency (must be a supported crypto currency)
    const supportedCurrencies = cryptoPaymentService.getSupportedCurrencies();
    if (currency && !supportedCurrencies.includes(currency)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported currency. Please use one of: ${supportedCurrencies.join(', ')}`
      });
    }
    
    // Validate network (must be a supported blockchain network)
    const supportedNetworks = cryptoPaymentService.getSupportedNetworks();
    if (network && !supportedNetworks.includes(network)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported network. Please use one of: ${supportedNetworks.join(', ')}`
      });
    }
    
    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check minimum investment amount
    if (amount < project.minimumInvestment) {
      return res.status(400).json({
        success: false,
        message: `Minimum investment amount is ${project.minimumInvestment}`
      });
    }
    
    // Generate a unique reference
    const reference = generateInvestmentReference();
    
    // Create investment record with 'pending' status
    const investment = await Investment.create({
      investor: userId,
      property: projectId,
      amount,
      startDate: new Date(),
      status: 'pending', // Start with pending until payment confirmed
      reference,
      paymentMethod: 'crypto',
      currency: currency || 'USDC',
      network: network || 'ethereum'
    });
    
    // Create transaction record with 'pending' status
    const transaction = await Transaction.create({
      userId,
      amount,
      type: 'crypto_investment',
      reference,
      projectId,
      status: 'pending',
      description: `Crypto investment in ${project.name}`,
      paymentMethod: 'crypto',
      currency: currency || 'USDC',
      network: network || 'ethereum'
    });
    
    // Generate a crypto payment session using the payment service
    const cryptoPayment = await cryptoPaymentService.createPayment({
      userId: parseInt(userId),
      propertyId: parseInt(projectId),
      amount,
      currency: currency || 'USDC',
      network: network || 'ethereum'
    });
    
    // Update the transaction with the crypto payment details
    transaction.paymentId = cryptoPayment.id;
    transaction.paymentAddress = cryptoPayment.paymentAddress;
    transaction.paymentUrl = cryptoPayment.paymentUrl;
    transaction.expiresAt = cryptoPayment.expiresAt;
    await transaction.save();
    
    // Save a reference to the transaction in the investment
    investment.transactionId = transaction._id;
    investment.paymentId = cryptoPayment.id;
    await investment.save();
    
    // Commit all database changes
    await session.commitTransaction();
    session.endSession();
    
    // Return success with payment details
    res.status(201).json({
      success: true,
      investment,
      transaction,
      cryptoPayment: {
        id: cryptoPayment.id,
        amount: cryptoPayment.amount,
        amountInCrypto: cryptoPayment.amountInCrypto,
        currency: cryptoPayment.currency,
        network: cryptoPayment.network,
        paymentAddress: cryptoPayment.paymentAddress,
        paymentUrl: cryptoPayment.paymentUrl,
        expiresAt: cryptoPayment.expiresAt,
        status: cryptoPayment.status
      }
    });
    
    // Set up asynchronous monitoring of the payment status
    // This would typically be handled by webhooks, but we'll start a polling process as backup
    if (process.env.NODE_ENV === 'development') {
      // In development, simulate a payment confirmation after a short delay
      setTimeout(async () => {
        try {
          // Get 20% chance of success in development for testing
          if (Math.random() < 0.2) {
            const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
            await confirmCryptoPayment(cryptoPayment.id, mockTxHash);
            console.log(`Development: Auto-confirmed crypto payment ${cryptoPayment.id}`);
          }
        } catch (error) {
          console.error('Error in development auto-confirmation:', error);
        }
      }, 15000); // 15 seconds
    }
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Crypto investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process crypto investment',
      error: error.message
    });
  }
};

/**
 * Confirm a crypto payment and update investment status
 * This is called by the webhook handler or polling mechanism
 */
const confirmCryptoPayment = async (paymentId, txHash) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Update the crypto payment status
    await cryptoPaymentService.updateTransactionStatus(paymentId, {
      status: 'confirmed',
      txHash
    });
    
    // Find the transaction associated with this payment
    const transaction = await Transaction.findOne({ paymentId });
    if (!transaction) {
      throw new Error(`Transaction not found for payment ID: ${paymentId}`);
    }
    
    // Update transaction status
    transaction.status = 'completed';
    transaction.transactionHash = txHash;
    transaction.completedAt = new Date();
    await transaction.save();
    
    // Find and update the investment
    const investment = await Investment.findOne({ paymentId });
    if (!investment) {
      throw new Error(`Investment not found for payment ID: ${paymentId}`);
    }
    
    // Update investment status
    investment.status = 'active';
    investment.paymentConfirmedAt = new Date();
    await investment.save();
    
    // Update project funding
    const project = await Project.findById(investment.property);
    if (project) {
      project.currentFunding += investment.amount;
      project.numberOfInvestors = await Investment.countDocuments({
        property: project._id,
        status: { $nin: ['cancelled', 'pending'] }
      });
      await project.save();
    }
    
    await session.commitTransaction();
    session.endSession();
    
    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error confirming crypto payment:', error);
    return false;
  }
};

/**
 * Check crypto payment status and update if needed
 */
const checkCryptoPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }
    
    // Get the payment status from the crypto payment service
    const payment = await cryptoPaymentService.getPayment(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false, 
        message: 'Payment not found'
      });
    }
    
    // If payment is confirmed but not yet updated in our system, update it
    if (payment.status === 'confirmed' || payment.status === 'completed') {
      const transaction = await Transaction.findOne({ paymentId });
      
      if (transaction && transaction.status === 'pending') {
        // Confirm the payment
        await confirmCryptoPayment(paymentId, payment.txHash);
      }
    }
    
    // Return the current status
    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        amountInCrypto: payment.amountInCrypto,
        currency: payment.currency,
        network: payment.network,
        txHash: payment.txHash,
        updatedAt: payment.updatedAt,
        expiresAt: payment.expiresAt
      }
    });
  } catch (error) {
    console.error('Error checking crypto payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
};

/**
 * Get user investments
 */
const getUserInvestments = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const investments = await Investment.find({ userId })
      .populate('projectId')
      .sort({ investmentDate: -1 });
    
    res.status(200).json({ 
      success: true, 
      count: investments.length,
      data: investments
    });
  } catch (error) {
    console.error('Error fetching user investments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch investments',
      error: error.message
    });
  }
};

/**
 * Get investment details
 */
const getInvestmentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const investment = await Investment.findById(id)
      .populate('projectId')
      .populate('userId', 'firstName lastName email username');
    
    if (!investment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Investment not found' 
      });
    }
    
    // Get related transactions
    const transactions = await Transaction.find({ 
      userId: investment.userId,
      projectId: investment.projectId,
      type: { $in: ['investment', 'return', 'crypto_investment'] }
    }).sort({ createdAt: -1 });
    
    // If this is a crypto investment, get the crypto payment details
    let cryptoPayment = null;
    if (investment.paymentMethod === 'crypto' && investment.paymentId) {
      cryptoPayment = await cryptoPaymentService.getPayment(investment.paymentId);
    }
    
    res.status(200).json({ 
      success: true, 
      data: { 
        investment, 
        transactions,
        cryptoPayment: cryptoPayment ? {
          id: cryptoPayment.id,
          status: cryptoPayment.status,
          amount: cryptoPayment.amount,
          amountInCrypto: cryptoPayment.amountInCrypto,
          currency: cryptoPayment.currency,
          network: cryptoPayment.network,
          txHash: cryptoPayment.txHash,
          updatedAt: cryptoPayment.updatedAt,
          expiresAt: cryptoPayment.expiresAt,
          paymentAddress: cryptoPayment.paymentAddress,
          paymentUrl: cryptoPayment.paymentUrl
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching investment details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch investment details',
      error: error.message
    });
  }
};

/**
 * Update investment returns
 */
const updateInvestmentReturns = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { monthlyReturn, totalReturn, returnDate } = req.body;
    
    const investment = await Investment.findById(id);
    
    if (!investment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Investment not found' 
      });
    }
    
    // Update investment returns
    investment.totalReturns = (investment.totalReturns || 0) + totalReturn;
    investment.lastReturnDate = returnDate || new Date();
    investment.monthlyReturns = investment.monthlyReturns || [];
    
    // Add monthly return record
    investment.monthlyReturns.push({
      amount: monthlyReturn,
      date: returnDate || new Date(),
      status: 'paid'
    });
    
    await investment.save();
    
    // Create transaction for the return
    const transaction = await Transaction.create({
      userId: investment.userId,
      amount: totalReturn,
      type: 'return',
      reference: `RET-${Date.now()}`,
      projectId: investment.projectId,
      status: 'completed',
      description: `Returns from investment ${investment.reference}`
    });
    
    // Update user wallet
    let wallet = await Wallet.findOne({ userId: investment.userId });
    if (wallet) {
      wallet.balance += totalReturn;
      wallet.totalReturns += totalReturn;
      await wallet.save();
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ 
      success: true, 
      data: { investment, transaction }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error updating investment returns:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update investment returns',
      error: error.message
    });
  }
};

/**
 * Cancel investment
 */
const cancelInvestment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const investment = await Investment.findById(id);
    
    if (!investment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Investment not found' 
      });
    }
    
    // Check if investment can be cancelled
    if (investment.status !== 'pending' && investment.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: 'This investment cannot be cancelled' 
      });
    }
    
    // Update investment status
    investment.status = 'cancelled';
    investment.cancellationReason = reason;
    investment.cancellationDate = new Date();
    await investment.save();
    
    // For crypto investments, cancel the payment if it's still pending
    if (investment.paymentMethod === 'crypto' && investment.paymentId) {
      const payment = await cryptoPaymentService.getPayment(investment.paymentId);
      if (payment && payment.status === 'pending') {
        await cryptoPaymentService.cancelPayment(investment.paymentId);
      }
    }
    
    // Refund to wallet if active
    if (investment.status === 'active') {
      // Create refund transaction
      const transaction = await Transaction.create({
        userId: investment.userId,
        amount: investment.amount,
        type: 'divestment',
        reference: `DIV-${Date.now()}`,
        projectId: investment.projectId,
        status: 'completed',
        description: `Refund from cancelled investment ${investment.reference}`
      });
      
      // Update user wallet
      let wallet = await Wallet.findOne({ userId: investment.userId });
      if (wallet) {
        wallet.balance += investment.amount;
        wallet.totalInvested -= investment.amount;
        await wallet.save();
      }
      
      // Update project funding
      const project = await Project.findById(investment.projectId);
      if (project) {
        project.currentFunding -= investment.amount;
        project.numberOfInvestors = await Investment.countDocuments({ 
          projectId: project._id, 
          status: { $ne: 'cancelled' } 
        });
        await project.save();
      }
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ 
      success: true, 
      data: investment
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error cancelling investment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel investment',
      error: error.message
    });
  }
};

// Export the functions
export {
  investInProject,
  getUserInvestments,
  getInvestmentDetails,
  updateInvestmentReturns,
  cancelInvestment,
  handleCryptoInvestment,
  checkCryptoPaymentStatus
};