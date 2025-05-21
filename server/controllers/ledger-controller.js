/**
 * Ledger Controller
 * 
 * Handles all financial transactions using a double-entry bookkeeping system:
 * - Creating and processing transactions
 * - Managing journal entries
 * - Account reconciliation
 * - Financial reporting
 * 
 * Every financial movement requires at least two entries (debit and credit)
 * that must balance to zero, ensuring financial integrity.
 */

const { eq, and, asc, desc, sql, or, inArray } = require('drizzle-orm');
const { db } = require('../db.cjs');
const { nanoid } = require('nanoid');
const {
  accounts,
  ledgerTransactions,
  journalEntries,
  reconciliations,
  accountBalanceHistory
} = require('../../shared/schema-ledger');
const { users, wallets, investments, properties } = require('../../shared/schema');
const auditController = require('./audit-controller');

/**
 * Initialize the financial ledger system
 * 
 * Sets up the default accounts in the chart of accounts
 * This should be run during system initialization or first setup
 */
exports.initializeLedgerSystem = async () => {
  try {
    // Check if accounts already exist
    const existingAccounts = await db.select().from(accounts).limit(1);
    
    if (existingAccounts.length === 0) {
      // Create default system accounts
      const defaultAccounts = [
        { accountType: 'platform_revenue', name: 'Platform Revenue', description: 'Main revenue account for the platform' },
        { accountType: 'fee_collection', name: 'Fee Collection', description: 'Account for collecting platform fees' },
        { accountType: 'escrow', name: 'Escrow Account', description: 'Holding account for funds in escrow' },
        { accountType: 'investment_pool', name: 'Investment Pool', description: 'Pool of funds from all investors' },
        { accountType: 'roi_reserve', name: 'ROI Reserve', description: 'Reserve for ROI payments to investors' }
      ];
      
      await db.insert(accounts).values(defaultAccounts);
      
      console.log('Ledger system initialized with default accounts');
      return { success: true, message: 'Ledger system initialized successfully' };
    }
    
    return { success: true, message: 'Ledger system already initialized' };
  } catch (error) {
    console.error('Error initializing ledger system:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create or get user wallet account
 * 
 * Ensures each user has a corresponding account in the ledger system
 * 
 * @param {number} userId - ID of the user
 * @returns {Promise<object>} The user's wallet account
 */
exports.ensureUserWalletAccount = async (userId) => {
  try {
    // Check if user wallet account already exists
    const [existingAccount] = await db.select()
      .from(accounts)
      .where(and(
        eq(accounts.userId, userId),
        eq(accounts.accountType, 'user_wallet')
      ));
    
    if (existingAccount) {
      return existingAccount;
    }
    
    // Get user info for the account name
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email
    })
    .from(users)
    .where(eq(users.id, userId));
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Create new wallet account
    const [newAccount] = await db.insert(accounts)
      .values({
        accountType: 'user_wallet',
        name: `${user.name}'s Wallet`,
        description: `Wallet account for user ${user.name} (${user.email})`,
        userId: userId,
        currentBalance: 0,
        isActive: true
      })
      .returning();
    
    // Also ensure wallet exists in the wallet table
    const [existingWallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    if (!existingWallet) {
      await db.insert(wallets)
        .values({
          userId: userId,
          balance: 0,
          currency: 'USD',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    return newAccount;
  } catch (error) {
    console.error('Error ensuring user wallet account:', error);
    throw error;
  }
};

/**
 * Create or get property funding account
 * 
 * Ensures each property has a corresponding account in the ledger system
 * 
 * @param {number} propertyId - ID of the property
 * @returns {Promise<object>} The property funding account
 */
exports.ensurePropertyFundingAccount = async (propertyId) => {
  try {
    // Check if property account already exists
    const [existingAccount] = await db.select()
      .from(accounts)
      .where(and(
        eq(accounts.propertyId, propertyId),
        eq(accounts.accountType, 'property_funding')
      ));
    
    if (existingAccount) {
      return existingAccount;
    }
    
    // Get property info
    const [property] = await db.select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!property) {
      throw new Error(`Property with ID ${propertyId} not found`);
    }
    
    // Create new property account
    const [newAccount] = await db.insert(accounts)
      .values({
        accountType: 'property_funding',
        name: `${property.name} Funding`,
        description: `Funding account for property ${property.name}`,
        propertyId: propertyId,
        currentBalance: 0,
        isActive: true
      })
      .returning();
    
    return newAccount;
  } catch (error) {
    console.error('Error ensuring property funding account:', error);
    throw error;
  }
};

/**
 * Find account by type (and optional user/property ID)
 * 
 * Helper function to find accounts by their type
 * 
 * @param {string} accountType - Type of account to find
 * @param {object} options - Additional options (userId, propertyId)
 * @returns {Promise<object>} The found account
 */
exports.findAccountByType = async (accountType, options = {}) => {
  try {
    const { userId, propertyId } = options;
    
    let query = db.select().from(accounts).where(eq(accounts.accountType, accountType));
    
    if (userId) {
      query = query.where(eq(accounts.userId, userId));
    }
    
    if (propertyId) {
      query = query.where(eq(accounts.propertyId, propertyId));
    }
    
    const [account] = await query;
    
    if (!account) {
      throw new Error(`Account of type ${accountType} not found`);
    }
    
    return account;
  } catch (error) {
    console.error('Error finding account by type:', error);
    throw error;
  }
};

/**
 * Create a new ledger transaction
 * 
 * This is the main entry point for creating financial transactions
 * Every transaction must include at least two journal entries that balance to zero
 * 
 * @param {string} transactionType - Type of transaction
 * @param {number} amount - Transaction amount (positive value)
 * @param {array} entries - Array of journal entries (each with accountId and amount)
 * @param {object} options - Additional transaction options
 * @returns {Promise<object>} The created transaction
 */
exports.createTransaction = async (transactionType, amount, entries, options = {}) => {
  // Start a transaction to ensure all operations succeed or fail together
  return await db.transaction(async (tx) => {
    try {
      const {
        description,
        metadata,
        initiatedBy,
        externalReference,
        ipAddress,
        status = 'pending'
      } = options;
      
      // Validate entries
      if (!entries || entries.length < 2) {
        throw new Error('A transaction must have at least two entries (debit and credit)');
      }
      
      // Calculate the sum of all entries (must equal zero for valid double-entry)
      const entriesSum = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
      
      // Ensure entries balance to zero (with small tolerance for floating point errors)
      if (Math.abs(entriesSum) > 0.0001) {
        throw new Error(`Transaction entries do not balance. Sum: ${entriesSum}`);
      }
      
      // Generate a unique reference number
      const referenceNumber = `TRX-${nanoid(10)}`;
      
      // Create the ledger transaction
      const [transaction] = await tx.insert(ledgerTransactions)
        .values({
          referenceNumber,
          transactionType,
          amount,
          description,
          metadata: metadata ? JSON.stringify(metadata) : null,
          initiatedBy,
          externalReference,
          ipAddress,
          status,
          transactionDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Create journal entries for this transaction
      for (const entry of entries) {
        const { accountId, amount: entryAmount, description: entryDescription } = entry;
        
        // Get current account balance
        const [account] = await tx.select()
          .from(accounts)
          .where(eq(accounts.id, accountId));
        
        if (!account) {
          throw new Error(`Account with ID ${accountId} not found`);
        }
        
        // Calculate new balance
        const newBalance = Number(account.currentBalance) + Number(entryAmount);
        
        // Create journal entry
        await tx.insert(journalEntries)
          .values({
            transactionId: transaction.id,
            accountId,
            amount: entryAmount,
            description: entryDescription || description,
            createdAt: new Date(),
            runningBalance: newBalance
          });
        
        // Update account balance
        await tx.update(accounts)
          .set({
            currentBalance: newBalance,
            updatedAt: new Date()
          })
          .where(eq(accounts.id, accountId));
        
        // Record balance history
        await tx.insert(accountBalanceHistory)
          .values({
            accountId,
            recordDate: new Date(),
            balance: newBalance,
            lastTransactionId: transaction.id
          });
      }
      
      // If this involved a user wallet, update the wallet table as well
      for (const entry of entries) {
        const [account] = await tx.select()
          .from(accounts)
          .where(eq(accounts.id, entry.accountId));
        
        if (account && account.accountType === 'user_wallet' && account.userId) {
          await tx.update(wallets)
            .set({
              balance: account.currentBalance,
              updatedAt: new Date()
            })
            .where(eq(wallets.userId, account.userId));
        }
      }
      
      // Record the transaction in the audit trail
      if (initiatedBy) {
        await auditController.recordEntityChange(
          'ledger_transaction',
          transaction.id,
          'create',
          null,
          {
            ...transaction,
            entries: entries.map(e => ({ ...e, transactionId: transaction.id }))
          },
          initiatedBy,
          `${transactionType} transaction created`,
          { ip: ipAddress }
        );
      }
      
      return transaction;
    } catch (error) {
      console.error('Error creating ledger transaction:', error);
      throw error;
    }
  });
};

/**
 * Process a deposit to a user's wallet
 * 
 * Creates a transaction that credits the user's wallet account
 * and debits the platform's escrow account
 * 
 * @param {number} userId - ID of the user
 * @param {number} amount - Amount to deposit (positive value)
 * @param {object} options - Additional options
 * @returns {Promise<object>} The created transaction
 */
exports.processDeposit = async (userId, amount, options = {}) => {
  try {
    const {
      description = 'Wallet deposit',
      externalReference,
      ipAddress,
      initiatedBy = userId,
      metadata
    } = options;
    
    // Ensure user wallet account exists
    const userWalletAccount = await exports.ensureUserWalletAccount(userId);
    
    // Get escrow account
    const escrowAccount = await exports.findAccountByType('escrow');
    
    // Create entries for the transaction
    const entries = [
      {
        accountId: userWalletAccount.id,
        amount: amount, // Credit user wallet (positive)
        description: 'Deposit to wallet'
      },
      {
        accountId: escrowAccount.id,
        amount: -amount, // Debit escrow account (negative)
        description: 'Funds transferred from escrow'
      }
    ];
    
    // Create the transaction
    const transaction = await exports.createTransaction(
      'deposit',
      amount,
      entries,
      {
        description,
        externalReference,
        ipAddress,
        initiatedBy,
        metadata,
        status: 'completed' // Deposits are completed immediately
      }
    );
    
    return transaction;
  } catch (error) {
    console.error('Error processing deposit:', error);
    throw error;
  }
};

/**
 * Process a withdrawal from a user's wallet
 * 
 * Creates a transaction that debits the user's wallet account
 * and credits the platform's escrow account
 * 
 * @param {number} userId - ID of the user
 * @param {number} amount - Amount to withdraw (positive value)
 * @param {object} options - Additional options
 * @returns {Promise<object>} The created transaction
 */
exports.processWithdrawal = async (userId, amount, options = {}) => {
  try {
    const {
      description = 'Wallet withdrawal',
      externalReference,
      ipAddress,
      initiatedBy = userId,
      metadata,
      status = 'pending' // Withdrawals may need approval
    } = options;
    
    // Ensure user wallet account exists
    const userWalletAccount = await exports.ensureUserWalletAccount(userId);
    
    // Get escrow account
    const escrowAccount = await exports.findAccountByType('escrow');
    
    // Check if user has sufficient balance
    if (Number(userWalletAccount.currentBalance) < amount) {
      throw new Error('Insufficient funds for withdrawal');
    }
    
    // Create entries for the transaction
    const entries = [
      {
        accountId: userWalletAccount.id,
        amount: -amount, // Debit user wallet (negative)
        description: 'Withdrawal from wallet'
      },
      {
        accountId: escrowAccount.id,
        amount: amount, // Credit escrow account (positive)
        description: 'Funds transferred to escrow for withdrawal'
      }
    ];
    
    // Create the transaction
    const transaction = await exports.createTransaction(
      'withdrawal',
      amount,
      entries,
      {
        description,
        externalReference,
        ipAddress,
        initiatedBy,
        metadata,
        status
      }
    );
    
    return transaction;
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    throw error;
  }
};

/**
 * Process an investment transaction
 * 
 * Creates a transaction that transfers funds from a user's wallet
 * to a property's funding account
 * 
 * @param {number} userId - ID of the investor
 * @param {number} propertyId - ID of the property
 * @param {number} amount - Amount to invest (positive value)
 * @param {object} options - Additional options
 * @returns {Promise<object>} The created transaction
 */
exports.processInvestment = async (userId, propertyId, amount, options = {}) => {
  try {
    const {
      description = 'Property investment',
      externalReference,
      ipAddress,
      initiatedBy = userId,
      metadata,
      investmentId
    } = options;
    
    // Ensure user wallet account exists
    const userWalletAccount = await exports.ensureUserWalletAccount(userId);
    
    // Ensure property funding account exists
    const propertyAccount = await exports.ensurePropertyFundingAccount(propertyId);
    
    // Get fee collection account
    const feeAccount = await exports.findAccountByType('fee_collection');
    
    // Check if user has sufficient balance
    if (Number(userWalletAccount.currentBalance) < amount) {
      throw new Error('Insufficient funds for investment');
    }
    
    // Calculate platform fee (e.g., 2% of investment)
    const feePercentage = 0.02;
    const feeAmount = amount * feePercentage;
    const investmentAmount = amount - feeAmount;
    
    // Create entries for the transaction
    const entries = [
      {
        accountId: userWalletAccount.id,
        amount: -amount, // Debit user wallet (negative)
        description: 'Investment withdrawal'
      },
      {
        accountId: propertyAccount.id,
        amount: investmentAmount, // Credit property account (positive)
        description: 'Investment deposit'
      },
      {
        accountId: feeAccount.id,
        amount: feeAmount, // Credit fee account (positive)
        description: 'Platform fee'
      }
    ];
    
    // Create the transaction
    const transaction = await exports.createTransaction(
      'investment',
      amount,
      entries,
      {
        description,
        externalReference,
        ipAddress,
        initiatedBy,
        metadata: {
          ...metadata,
          investmentId,
          propertyId,
          feeAmount,
          investmentAmount
        },
        status: 'completed' // Investments are completed immediately
      }
    );
    
    return transaction;
  } catch (error) {
    console.error('Error processing investment:', error);
    throw error;
  }
};

/**
 * Process an ROI distribution to investors
 * 
 * Creates transactions that distribute ROI from a property's account
 * to investors' wallet accounts
 * 
 * @param {number} propertyId - ID of the property
 * @param {array} distributions - Array of distributions (userId, amount)
 * @param {object} options - Additional options
 * @returns {Promise<array>} The created transactions
 */
exports.processROIDistribution = async (propertyId, distributions, options = {}) => {
  try {
    const {
      description = 'ROI Distribution',
      externalReference,
      ipAddress,
      initiatedBy,
      metadata,
      batchId = nanoid(10)
    } = options;
    
    const transactions = [];
    
    // Ensure property funding account exists
    const propertyAccount = await exports.ensurePropertyFundingAccount(propertyId);
    
    // Get ROI reserve account
    const roiReserveAccount = await exports.findAccountByType('roi_reserve');
    
    // Process each distribution
    for (const distribution of distributions) {
      const { userId, amount, investmentId } = distribution;
      
      // Ensure user wallet account exists
      const userWalletAccount = await exports.ensureUserWalletAccount(userId);
      
      // Create entries for this distribution
      const entries = [
        {
          accountId: userWalletAccount.id,
          amount: amount, // Credit user wallet (positive)
          description: 'ROI payment received'
        },
        {
          accountId: roiReserveAccount.id,
          amount: -amount, // Debit ROI reserve account (negative)
          description: 'ROI payment sent'
        }
      ];
      
      // Create the transaction
      const transaction = await exports.createTransaction(
        'roi_distribution',
        amount,
        entries,
        {
          description: `${description} - ${propertyAccount.name}`,
          externalReference,
          ipAddress,
          initiatedBy,
          metadata: {
            ...metadata,
            propertyId,
            investmentId,
            batchId
          },
          status: 'completed' // ROI distributions are completed immediately
        }
      );
      
      transactions.push(transaction);
    }
    
    return transactions;
  } catch (error) {
    console.error('Error processing ROI distribution:', error);
    throw error;
  }
};

/**
 * Update transaction status
 * 
 * Updates the status of a transaction (e.g., from pending to completed)
 * 
 * @param {number} transactionId - ID of the transaction
 * @param {string} newStatus - New status for the transaction
 * @param {object} options - Additional options
 * @returns {Promise<object>} The updated transaction
 */
exports.updateTransactionStatus = async (transactionId, newStatus, options = {}) => {
  try {
    const {
      reason,
      updatedBy,
      errorMessage
    } = options;
    
    // Get current transaction
    const [transaction] = await db.select()
      .from(ledgerTransactions)
      .where(eq(ledgerTransactions.id, transactionId));
    
    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }
    
    // Update transaction status
    const [updatedTransaction] = await db.update(ledgerTransactions)
      .set({
        status: newStatus,
        updatedAt: new Date(),
        errorMessage: errorMessage || null
      })
      .where(eq(ledgerTransactions.id, transactionId))
      .returning();
    
    // Record in audit trail
    if (updatedBy) {
      await auditController.recordEntityChange(
        'ledger_transaction',
        transactionId,
        'update',
        { status: transaction.status },
        { status: newStatus },
        updatedBy,
        reason || `Transaction status updated to ${newStatus}`
      );
    }
    
    return updatedTransaction;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};

/**
 * Get transaction details
 * 
 * Retrieves detailed information about a transaction, including all journal entries
 * 
 * @param {number} transactionId - ID of the transaction
 * @returns {Promise<object>} The transaction details
 */
exports.getTransactionDetails = async (transactionId) => {
  try {
    // Get transaction
    const [transaction] = await db.select()
      .from(ledgerTransactions)
      .where(eq(ledgerTransactions.id, transactionId));
    
    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }
    
    // Get journal entries for this transaction
    const entries = await db.select({
      entry: journalEntries,
      account: accounts
    })
    .from(journalEntries)
    .leftJoin(accounts, eq(journalEntries.accountId, accounts.id))
    .where(eq(journalEntries.transactionId, transactionId))
    .orderBy(asc(journalEntries.id));
    
    // Format entries
    const formattedEntries = entries.map(item => ({
      id: item.entry.id,
      accountId: item.entry.accountId,
      accountType: item.account.accountType,
      accountName: item.account.name,
      amount: item.entry.amount,
      description: item.entry.description,
      runningBalance: item.entry.runningBalance,
      createdAt: item.entry.createdAt
    }));
    
    // Get user info if transaction was initiated by a user
    let initiator = null;
    if (transaction.initiatedBy) {
      const [user] = await db.select({
        id: users.id,
        name: users.name,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, transaction.initiatedBy));
      
      if (user) {
        initiator = user;
      }
    }
    
    return {
      transaction: {
        ...transaction,
        metadata: transaction.metadata ? JSON.parse(transaction.metadata) : null
      },
      entries: formattedEntries,
      initiator
    };
  } catch (error) {
    console.error('Error getting transaction details:', error);
    throw error;
  }
};

/**
 * Get user transactions
 * 
 * Retrieves all transactions involving a user's wallet account
 * 
 * @param {number} userId - ID of the user
 * @param {object} options - Additional options (pagination, filtering)
 * @returns {Promise<object>} The user's transactions
 */
exports.getUserTransactions = async (userId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      transactionType,
      startDate,
      endDate,
      sortBy = 'transactionDate',
      sortOrder = 'desc'
    } = options;
    
    // Ensure user wallet account exists
    const userWalletAccount = await exports.ensureUserWalletAccount(userId);
    
    // Get all entries involving this account
    const entriesQuery = db.select({
      transactionId: journalEntries.transactionId
    })
    .from(journalEntries)
    .where(eq(journalEntries.accountId, userWalletAccount.id));
    
    const entriesResult = await entriesQuery;
    
    if (entriesResult.length === 0) {
      return {
        transactions: [],
        pagination: {
          page,
          limit,
          totalItems: 0,
          totalPages: 0
        }
      };
    }
    
    // Get transaction IDs
    const transactionIds = entriesResult.map(entry => entry.transactionId);
    
    // Build query for transactions
    let query = db.select()
      .from(ledgerTransactions)
      .where(inArray(ledgerTransactions.id, transactionIds));
    
    // Apply filters
    if (status) {
      query = query.where(eq(ledgerTransactions.status, status));
    }
    
    if (transactionType) {
      query = query.where(eq(ledgerTransactions.transactionType, transactionType));
    }
    
    if (startDate) {
      query = query.where(sql`${ledgerTransactions.transactionDate} >= ${new Date(startDate)}`);
    }
    
    if (endDate) {
      query = query.where(sql`${ledgerTransactions.transactionDate} <= ${new Date(endDate)}`);
    }
    
    // Count total matching transactions
    const countQuery = db.select({
      count: sql`count(*)`
    })
    .from(ledgerTransactions)
    .where(inArray(ledgerTransactions.id, transactionIds));
    
    // Apply the same filters to the count query
    if (status) {
      countQuery.where(eq(ledgerTransactions.status, status));
    }
    
    if (transactionType) {
      countQuery.where(eq(ledgerTransactions.transactionType, transactionType));
    }
    
    if (startDate) {
      countQuery.where(sql`${ledgerTransactions.transactionDate} >= ${new Date(startDate)}`);
    }
    
    if (endDate) {
      countQuery.where(sql`${ledgerTransactions.transactionDate} <= ${new Date(endDate)}`);
    }
    
    const [{ count }] = await countQuery;
    const totalItems = Number(count);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);
    
    // Apply sorting
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(ledgerTransactions[sortBy]));
    } else {
      query = query.orderBy(desc(ledgerTransactions[sortBy]));
    }
    
    // Execute query
    const transactions = await query;
    
    // Format transactions
    const formattedTransactions = await Promise.all(transactions.map(async (transaction) => {
      // Get the entry for this user's account to determine if it was a credit or debit
      const [entry] = await db.select()
        .from(journalEntries)
        .where(and(
          eq(journalEntries.transactionId, transaction.id),
          eq(journalEntries.accountId, userWalletAccount.id)
        ));
      
      // Determine if this was a credit (money in) or debit (money out)
      const direction = entry && entry.amount > 0 ? 'credit' : 'debit';
      
      // Get description for this specific user
      let userDescription = transaction.description;
      
      if (entry) {
        userDescription = entry.description || transaction.description;
      }
      
      return {
        ...transaction,
        metadata: transaction.metadata ? JSON.parse(transaction.metadata) : null,
        direction,
        userDescription
      };
    }));
    
    return {
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    };
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
};

/**
 * Get property transactions
 * 
 * Retrieves all transactions involving a property's funding account
 * 
 * @param {number} propertyId - ID of the property
 * @param {object} options - Additional options (pagination, filtering)
 * @returns {Promise<object>} The property's transactions
 */
exports.getPropertyTransactions = async (propertyId, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      transactionType,
      startDate,
      endDate,
      sortBy = 'transactionDate',
      sortOrder = 'desc'
    } = options;
    
    // Ensure property funding account exists
    const propertyAccount = await exports.ensurePropertyFundingAccount(propertyId);
    
    // Get all entries involving this account
    const entriesQuery = db.select({
      transactionId: journalEntries.transactionId
    })
    .from(journalEntries)
    .where(eq(journalEntries.accountId, propertyAccount.id));
    
    const entriesResult = await entriesQuery;
    
    if (entriesResult.length === 0) {
      return {
        transactions: [],
        pagination: {
          page,
          limit,
          totalItems: 0,
          totalPages: 0
        }
      };
    }
    
    // Get transaction IDs
    const transactionIds = entriesResult.map(entry => entry.transactionId);
    
    // Build query for transactions
    let query = db.select()
      .from(ledgerTransactions)
      .where(inArray(ledgerTransactions.id, transactionIds));
    
    // Apply filters
    if (status) {
      query = query.where(eq(ledgerTransactions.status, status));
    }
    
    if (transactionType) {
      query = query.where(eq(ledgerTransactions.transactionType, transactionType));
    }
    
    if (startDate) {
      query = query.where(sql`${ledgerTransactions.transactionDate} >= ${new Date(startDate)}`);
    }
    
    if (endDate) {
      query = query.where(sql`${ledgerTransactions.transactionDate} <= ${new Date(endDate)}`);
    }
    
    // Count total matching transactions
    const countQuery = db.select({
      count: sql`count(*)`
    })
    .from(ledgerTransactions)
    .where(inArray(ledgerTransactions.id, transactionIds));
    
    // Apply the same filters to the count query
    if (status) {
      countQuery.where(eq(ledgerTransactions.status, status));
    }
    
    if (transactionType) {
      countQuery.where(eq(ledgerTransactions.transactionType, transactionType));
    }
    
    if (startDate) {
      countQuery.where(sql`${ledgerTransactions.transactionDate} >= ${new Date(startDate)}`);
    }
    
    if (endDate) {
      countQuery.where(sql`${ledgerTransactions.transactionDate} <= ${new Date(endDate)}`);
    }
    
    const [{ count }] = await countQuery;
    const totalItems = Number(count);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);
    
    // Apply sorting
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(ledgerTransactions[sortBy]));
    } else {
      query = query.orderBy(desc(ledgerTransactions[sortBy]));
    }
    
    // Execute query
    const transactions = await query;
    
    // Format transactions
    const formattedTransactions = await Promise.all(transactions.map(async (transaction) => {
      // Get the entry for this property's account to determine if it was a credit or debit
      const [entry] = await db.select()
        .from(journalEntries)
        .where(and(
          eq(journalEntries.transactionId, transaction.id),
          eq(journalEntries.accountId, propertyAccount.id)
        ));
      
      // Determine if this was a credit (money in) or debit (money out)
      const direction = entry && entry.amount > 0 ? 'credit' : 'debit';
      
      return {
        ...transaction,
        metadata: transaction.metadata ? JSON.parse(transaction.metadata) : null,
        direction
      };
    }));
    
    return {
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    };
  } catch (error) {
    console.error('Error getting property transactions:', error);
    throw error;
  }
};

/**
 * Get all financial accounts in the system
 * 
 * @param {object} options - Options for filtering accounts
 * @returns {Promise<array>} List of accounts
 */
exports.getAllAccounts = async (options = {}) => {
  try {
    const {
      accountType,
      isActive = true,
      includeBalances = true
    } = options;
    
    // Build query
    let query = db.select()
      .from(accounts);
    
    if (accountType) {
      query = query.where(eq(accounts.accountType, accountType));
    }
    
    if (isActive !== null) {
      query = query.where(eq(accounts.isActive, isActive));
    }
    
    // Execute query
    const accountsList = await query;
    
    // If requested, include the total debits and credits for each account
    if (includeBalances) {
      const accountsWithBalances = await Promise.all(accountsList.map(async (account) => {
        // Get total credits (positive amounts)
        const [creditResult] = await db.select({
          total: sql`COALESCE(SUM(amount), 0)`,
        })
        .from(journalEntries)
        .where(and(
          eq(journalEntries.accountId, account.id),
          sql`amount > 0`
        ));
        
        // Get total debits (negative amounts)
        const [debitResult] = await db.select({
          total: sql`COALESCE(SUM(amount), 0)`,
        })
        .from(journalEntries)
        .where(and(
          eq(journalEntries.accountId, account.id),
          sql`amount < 0`
        ));
        
        const totalCredits = Number(creditResult.total);
        const totalDebits = Number(debitResult.total);
        
        return {
          ...account,
          totalCredits,
          totalDebits,
          // The net balance should equal the current balance
          netBalance: totalCredits + totalDebits
        };
      }));
      
      return accountsWithBalances;
    }
    
    return accountsList;
  } catch (error) {
    console.error('Error getting all accounts:', error);
    throw error;
  }
};

/**
 * Reconcile an account
 * 
 * Compares the expected balance with the actual balance and records any discrepancies
 * 
 * @param {number} accountId - ID of the account to reconcile
 * @param {number} expectedBalance - Expected balance of the account
 * @param {object} options - Additional options
 * @returns {Promise<object>} The reconciliation result
 */
exports.reconcileAccount = async (accountId, expectedBalance, options = {}) => {
  try {
    const {
      performedBy,
      notes
    } = options;
    
    // Get current account
    const [account] = await db.select()
      .from(accounts)
      .where(eq(accounts.id, accountId));
    
    if (!account) {
      throw new Error(`Account with ID ${accountId} not found`);
    }
    
    // Get actual balance from journal entries
    const [balanceResult] = await db.select({
      balance: sql`COALESCE(SUM(amount), 0)`
    })
    .from(journalEntries)
    .where(eq(journalEntries.accountId, accountId));
    
    const actualBalance = Number(balanceResult.balance);
    
    // Calculate discrepancy
    const discrepancy = actualBalance - expectedBalance;
    
    // Determine reconciliation status
    const status = Math.abs(discrepancy) < 0.01 ? 'matched' : 'discrepancy';
    
    // Record the reconciliation
    const [reconciliation] = await db.insert(reconciliations)
      .values({
        accountId,
        performedBy,
        reconciliationDate: new Date(),
        expectedBalance,
        actualBalance,
        discrepancy,
        notes,
        status
      })
      .returning();
    
    // If there's a discrepancy, record it in the audit trail
    if (status === 'discrepancy') {
      await auditController.recordEntityChange(
        'account_reconciliation',
        reconciliation.id,
        'create',
        null,
        reconciliation,
        performedBy,
        `Account reconciliation with discrepancy of ${discrepancy}`
      );
    }
    
    return {
      reconciliation,
      account,
      actualBalance,
      expectedBalance,
      discrepancy,
      status
    };
  } catch (error) {
    console.error('Error reconciling account:', error);
    throw error;
  }
};

/**
 * Generate a financial statement for the platform
 * 
 * @param {string} statementType - Type of statement (balance, income)
 * @param {object} options - Options for the statement
 * @returns {Promise<object>} The financial statement
 */
exports.generateFinancialStatement = async (statementType, options = {}) => {
  try {
    const {
      asOfDate = new Date(),
      startDate,
      endDate = new Date()
    } = options;
    
    if (statementType === 'balance') {
      // Generate a balance sheet
      
      // Get all accounts and their balances
      const accountsList = await exports.getAllAccounts({
        includeBalances: true
      });
      
      // Group accounts by type
      const accountsByType = accountsList.reduce((acc, account) => {
        const type = account.accountType;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(account);
        return acc;
      }, {});
      
      // Calculate totals by account type
      const totalsByType = {};
      Object.keys(accountsByType).forEach(type => {
        totalsByType[type] = accountsByType[type].reduce((sum, account) => sum + Number(account.currentBalance), 0);
      });
      
      // Calculate total assets, liabilities, and equity
      const assets = (totalsByType['user_wallet'] || 0) + (totalsByType['property_funding'] || 0);
      const liabilities = (totalsByType['escrow'] || 0);
      const equity = assets - liabilities;
      
      return {
        statementType: 'balance',
        asOfDate,
        accounts: accountsByType,
        totalsByType,
        summary: {
          assets,
          liabilities,
          equity
        }
      };
      
    } else if (statementType === 'income') {
      // Generate an income statement
      
      if (!startDate) {
        throw new Error('Start date is required for income statement');
      }
      
      // Get all transactions within the date range
      const transactions = await db.select()
        .from(ledgerTransactions)
        .where(and(
          sql`${ledgerTransactions.transactionDate} >= ${new Date(startDate)}`,
          sql`${ledgerTransactions.transactionDate} <= ${new Date(endDate)}`,
          eq(ledgerTransactions.status, 'completed')
        ));
      
      // Get revenue (from fee collections)
      const [revenueResult] = await db.select({
        total: sql`COALESCE(SUM(amount), 0)`
      })
      .from(journalEntries)
      .innerJoin(ledgerTransactions, eq(journalEntries.transactionId, ledgerTransactions.id))
      .innerJoin(accounts, eq(journalEntries.accountId, accounts.id))
      .where(and(
        eq(accounts.accountType, 'fee_collection'),
        sql`${journalEntries.amount} > 0`,
        sql`${ledgerTransactions.transactionDate} >= ${new Date(startDate)}`,
        sql`${ledgerTransactions.transactionDate} <= ${new Date(endDate)}`,
        eq(ledgerTransactions.status, 'completed')
      ));
      
      const totalRevenue = Number(revenueResult.total);
      
      // Group transactions by type
      const transactionsByType = transactions.reduce((acc, transaction) => {
        const type = transaction.transactionType;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(transaction);
        return acc;
      }, {});
      
      // Calculate totals by transaction type
      const totalsByType = {};
      Object.keys(transactionsByType).forEach(type => {
        totalsByType[type] = transactionsByType[type].reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      });
      
      return {
        statementType: 'income',
        startDate,
        endDate,
        transactions: transactionsByType,
        totalsByType,
        summary: {
          totalRevenue,
          netIncome: totalRevenue
        }
      };
    }
    
    throw new Error(`Unsupported statement type: ${statementType}`);
  } catch (error) {
    console.error('Error generating financial statement:', error);
    throw error;
  }
};