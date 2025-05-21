/**
 * Ledger Routes Module
 * 
 * Defines API endpoints for the financial ledger system:
 * - Transaction management
 * - Account management
 * - Financial reporting
 * - Reconciliation
 */

const express = require('express');
const ledgerController = require('../controllers/ledger-controller');
const securityMiddleware = require('../middleware/security-middleware');

const router = express.Router();

// Apply authentication to all ledger routes
router.use(securityMiddleware.verifyToken);

// Initialize the ledger system
router.post(
  '/initialize',
  securityMiddleware.checkPermission('ledger', 'create'),
  async (req, res) => {
    try {
      const result = await ledgerController.initializeLedgerSystem();
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      console.error('Error initializing ledger system:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Get all accounts
router.get(
  '/accounts',
  securityMiddleware.checkPermission('ledger', 'read'),
  async (req, res) => {
    try {
      const { accountType, includeBalances } = req.query;
      const accounts = await ledgerController.getAllAccounts({
        accountType,
        includeBalances: includeBalances === 'true'
      });
      
      res.status(200).json({
        status: 'success',
        data: { accounts }
      });
    } catch (error) {
      console.error('Error getting accounts:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Get user transactions
router.get(
  '/user-transactions/:userId',
  async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        page,
        limit,
        status,
        transactionType,
        startDate,
        endDate,
        sortBy,
        sortOrder
      } = req.query;
      
      // Check if the user is requesting their own transactions
      // or if they have admin permission
      if (
        req.user.id !== parseInt(userId) &&
        !securityMiddleware.hasPermission(req.user, 'ledger', 'read')
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to view these transactions'
        });
      }
      
      const result = await ledgerController.getUserTransactions(
        parseInt(userId),
        {
          page: page ? parseInt(page) : undefined,
          limit: limit ? parseInt(limit) : undefined,
          status,
          transactionType,
          startDate,
          endDate,
          sortBy,
          sortOrder
        }
      );
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      console.error('Error getting user transactions:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Get property transactions
router.get(
  '/property-transactions/:propertyId',
  securityMiddleware.checkPermission('ledger', 'read'),
  async (req, res) => {
    try {
      const { propertyId } = req.params;
      const {
        page,
        limit,
        status,
        transactionType,
        startDate,
        endDate,
        sortBy,
        sortOrder
      } = req.query;
      
      const result = await ledgerController.getPropertyTransactions(
        parseInt(propertyId),
        {
          page: page ? parseInt(page) : undefined,
          limit: limit ? parseInt(limit) : undefined,
          status,
          transactionType,
          startDate,
          endDate,
          sortBy,
          sortOrder
        }
      );
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      console.error('Error getting property transactions:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Get transaction details
router.get(
  '/transaction/:transactionId',
  async (req, res) => {
    try {
      const { transactionId } = req.params;
      const transactionDetails = await ledgerController.getTransactionDetails(parseInt(transactionId));
      
      // Check if this transaction involves the requesting user's account
      // or if they have admin permission
      const userAccountEntry = transactionDetails.entries.find(
        entry => entry.accountType === 'user_wallet' && entry.accountId === req.user.id
      );
      
      if (
        !userAccountEntry &&
        !securityMiddleware.hasPermission(req.user, 'ledger', 'read')
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to view this transaction'
        });
      }
      
      res.status(200).json({
        status: 'success',
        data: { transaction: transactionDetails }
      });
    } catch (error) {
      console.error('Error getting transaction details:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Process a deposit
router.post(
  '/deposit',
  async (req, res) => {
    try {
      const { amount, externalReference, description, metadata } = req.body;
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid deposit amount is required'
        });
      }
      
      const transaction = await ledgerController.processDeposit(
        req.user.id,
        parseFloat(amount),
        {
          description,
          externalReference,
          ipAddress: req.ip,
          initiatedBy: req.user.id,
          metadata
        }
      );
      
      res.status(201).json({
        status: 'success',
        data: { transaction }
      });
    } catch (error) {
      console.error('Error processing deposit:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Process a withdrawal
router.post(
  '/withdraw',
  async (req, res) => {
    try {
      const { amount, externalReference, description, metadata } = req.body;
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid withdrawal amount is required'
        });
      }
      
      const transaction = await ledgerController.processWithdrawal(
        req.user.id,
        parseFloat(amount),
        {
          description,
          externalReference,
          ipAddress: req.ip,
          initiatedBy: req.user.id,
          metadata
        }
      );
      
      res.status(201).json({
        status: 'success',
        data: { transaction }
      });
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Process an investment
router.post(
  '/invest',
  async (req, res) => {
    try {
      const { propertyId, amount, description, metadata } = req.body;
      
      if (!propertyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Property ID is required'
        });
      }
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid investment amount is required'
        });
      }
      
      const transaction = await ledgerController.processInvestment(
        req.user.id,
        parseInt(propertyId),
        parseFloat(amount),
        {
          description,
          ipAddress: req.ip,
          initiatedBy: req.user.id,
          metadata
        }
      );
      
      res.status(201).json({
        status: 'success',
        data: { transaction }
      });
    } catch (error) {
      console.error('Error processing investment:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Process ROI distribution (admin only)
router.post(
  '/distribute-roi',
  securityMiddleware.checkPermission('ledger', 'create'),
  async (req, res) => {
    try {
      const { propertyId, distributions, description, batchId, metadata } = req.body;
      
      if (!propertyId) {
        return res.status(400).json({
          status: 'error',
          message: 'Property ID is required'
        });
      }
      
      if (!distributions || !Array.isArray(distributions) || distributions.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid distributions array is required'
        });
      }
      
      // Validate all distributions
      for (const dist of distributions) {
        if (!dist.userId || !dist.amount || isNaN(dist.amount) || dist.amount <= 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Each distribution must include userId and a valid amount'
          });
        }
      }
      
      const transactions = await ledgerController.processROIDistribution(
        parseInt(propertyId),
        distributions.map(d => ({
          ...d,
          userId: parseInt(d.userId),
          amount: parseFloat(d.amount)
        })),
        {
          description,
          batchId,
          ipAddress: req.ip,
          initiatedBy: req.user.id,
          metadata
        }
      );
      
      res.status(201).json({
        status: 'success',
        data: { transactions }
      });
    } catch (error) {
      console.error('Error processing ROI distribution:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Update transaction status (admin only)
router.patch(
  '/transaction/:transactionId/status',
  securityMiddleware.checkPermission('ledger', 'update'),
  async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { status, reason, errorMessage } = req.body;
      
      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'New status is required'
        });
      }
      
      const transaction = await ledgerController.updateTransactionStatus(
        parseInt(transactionId),
        status,
        {
          reason,
          errorMessage,
          updatedBy: req.user.id
        }
      );
      
      res.status(200).json({
        status: 'success',
        data: { transaction }
      });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Reconcile an account (admin only)
router.post(
  '/reconcile/:accountId',
  securityMiddleware.checkPermission('ledger', 'update'),
  async (req, res) => {
    try {
      const { accountId } = req.params;
      const { expectedBalance, notes } = req.body;
      
      if (expectedBalance === undefined || isNaN(expectedBalance)) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid expected balance is required'
        });
      }
      
      const result = await ledgerController.reconcileAccount(
        parseInt(accountId),
        parseFloat(expectedBalance),
        {
          performedBy: req.user.id,
          notes
        }
      );
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      console.error('Error reconciling account:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Generate financial statement (admin only)
router.get(
  '/financial-statement/:statementType',
  securityMiddleware.checkPermission('ledger', 'read'),
  async (req, res) => {
    try {
      const { statementType } = req.params;
      const { asOfDate, startDate, endDate } = req.query;
      
      if (!['balance', 'income'].includes(statementType)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid statement type. Must be "balance" or "income"'
        });
      }
      
      const statement = await ledgerController.generateFinancialStatement(
        statementType,
        {
          asOfDate: asOfDate ? new Date(asOfDate) : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined
        }
      );
      
      res.status(200).json({
        status: 'success',
        data: { statement }
      });
    } catch (error) {
      console.error('Error generating financial statement:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

module.exports = router;