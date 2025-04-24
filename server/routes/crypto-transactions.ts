import { Router, Request, Response } from 'express';
import { db } from '../db';
import { 
  cryptoWallets, 
  cryptoTransactions, 
  insertCryptoTransactionSchema,
  notifications
} from '../../shared/schema';
import { verifyToken } from '../auth-jwt';
import { and, eq, desc } from 'drizzle-orm';
import { ZodError } from 'zod';

const cryptoTransactionRouter = Router();

/**
 * @route GET /api/crypto-transactions
 * @desc Get all user's crypto transactions across all wallets
 * @access Private
 */
cryptoTransactionRouter.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get all user wallet IDs
    const userWallets = await db
      .select()
      .from(cryptoWallets)
      .where(eq(cryptoWallets.userId, userId.toString()));

    const walletIds = userWallets.map(wallet => wallet.id);

    if (walletIds.length === 0) {
      return res.json([]);
    }

    // Get all transactions from all user wallets
    const transactions = await db
      .select({
        transaction: cryptoTransactions,
        wallet: {
          id: cryptoWallets.id,
          address: cryptoWallets.address,
          network: cryptoWallets.network,
          label: cryptoWallets.label
        }
      })
      .from(cryptoTransactions)
      .innerJoin(
        cryptoWallets,
        eq(cryptoTransactions.cryptoWalletId, cryptoWallets.id)
      )
      .where(
        walletIds.map(id => eq(cryptoTransactions.cryptoWalletId, id)).reduce(
          (prev, curr) => prev || curr
        )
      )
      .orderBy(desc(cryptoTransactions.createdAt));

    // Format the response
    const formattedTransactions = transactions.map(({ transaction, wallet }) => ({
      ...transaction,
      wallet
    }));

    res.json(formattedTransactions);
  } catch (error) {
    console.error("Error fetching crypto transactions:", error);
    res.status(500).json({ 
      message: "Failed to fetch crypto transactions", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route POST /api/crypto-transactions/deposit
 * @desc Record a new crypto deposit
 * @access Private
 */
cryptoTransactionRouter.post('/deposit', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { walletId, txHash, amount, network, amountInFiat } = req.body;

    // Verify wallet belongs to user
    const [wallet] = await db
      .select()
      .from(cryptoWallets)
      .where(
        and(
          eq(cryptoWallets.id, walletId),
          eq(cryptoWallets.userId, userId.toString())
        )
      );

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Create transaction record
    const [transaction] = await db
      .insert(cryptoTransactions)
      .values({
        cryptoWalletId: walletId,
        txHash,
        network,
        amount,
        amountInFiat: amountInFiat?.toString(),
        type: "deposit",
        status: "pending",
        metadata: req.body.metadata || null
      })
      .returning();

    // Update wallet last used timestamp
    await db
      .update(cryptoWallets)
      .set({ 
        lastUsed: new Date()
      })
      .where(eq(cryptoWallets.id, walletId));

    // Create notification
    await db
      .insert(notifications)
      .values({
        userId: userId.toString(),
        title: "Crypto Deposit Initiated",
        message: `Your deposit of ${amount} on ${network} network has been initiated and is pending confirmation.`,
        type: "transaction",
        link: `/wallet/crypto/${walletId}/transactions`
      });

    res.status(201).json({
      message: "Deposit initiated successfully",
      transaction
    });
  } catch (error) {
    console.error("Error initiating deposit:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Invalid transaction data", 
        errors: error.errors 
      });
    }
    res.status(500).json({ 
      message: "Failed to initiate deposit", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route POST /api/crypto-transactions/withdrawal
 * @desc Record a new crypto withdrawal
 * @access Private
 */
cryptoTransactionRouter.post('/withdrawal', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { walletId, txHash, amount, network, amountInFiat, destinationAddress } = req.body;

    // Verify wallet belongs to user
    const [wallet] = await db
      .select()
      .from(cryptoWallets)
      .where(
        and(
          eq(cryptoWallets.id, walletId),
          eq(cryptoWallets.userId, userId.toString())
        )
      );

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Create transaction record
    const [transaction] = await db
      .insert(cryptoTransactions)
      .values({
        cryptoWalletId: walletId,
        txHash,
        network,
        amount,
        amountInFiat: amountInFiat?.toString(),
        type: "withdrawal",
        status: "pending",
        metadata: JSON.stringify({
          destinationAddress,
          ...req.body.metadata
        })
      })
      .returning();

    // Update wallet last used timestamp
    await db
      .update(cryptoWallets)
      .set({ 
        lastUsed: new Date()
      })
      .where(eq(cryptoWallets.id, walletId));

    // Create notification
    await db
      .insert(notifications)
      .values({
        userId: userId.toString(),
        title: "Crypto Withdrawal Initiated",
        message: `Your withdrawal of ${amount} on ${network} network has been initiated and is pending confirmation.`,
        type: "transaction",
        link: `/wallet/crypto/${walletId}/transactions`
      });

    res.status(201).json({
      message: "Withdrawal initiated successfully",
      transaction
    });
  } catch (error) {
    console.error("Error initiating withdrawal:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Invalid transaction data", 
        errors: error.errors 
      });
    }
    res.status(500).json({ 
      message: "Failed to initiate withdrawal", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route PUT /api/crypto-transactions/:id/confirm
 * @desc Confirm a pending transaction (admin only)
 * @access Private/Admin
 */
cryptoTransactionRouter.put('/:id/confirm', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const transactionId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user is admin
    if (req.jwtPayload?.role !== 'admin' && req.jwtPayload?.role !== 'super_admin') {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    // Get transaction
    const [transaction] = await db
      .select({
        transaction: cryptoTransactions,
        wallet: cryptoWallets
      })
      .from(cryptoTransactions)
      .innerJoin(
        cryptoWallets,
        eq(cryptoTransactions.cryptoWalletId, cryptoWallets.id)
      )
      .where(eq(cryptoTransactions.id, transactionId));

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.transaction.status !== 'pending') {
      return res.status(400).json({ message: "Transaction is not in pending state" });
    }

    // Update transaction status
    const [updatedTransaction] = await db
      .update(cryptoTransactions)
      .set({ 
        status: "completed",
        confirmedAt: new Date()
      })
      .where(eq(cryptoTransactions.id, transactionId))
      .returning();

    // Create notification
    await db
      .insert(notifications)
      .values({
        userId: transaction.wallet.userId,
        title: `Crypto ${transaction.transaction.type.charAt(0).toUpperCase() + transaction.transaction.type.slice(1)} Confirmed`,
        message: `Your ${transaction.transaction.type} of ${transaction.transaction.amount} on ${transaction.transaction.network} network has been confirmed.`,
        type: "transaction",
        link: `/wallet/crypto/${transaction.wallet.id}/transactions`
      });

    res.json({
      message: "Transaction confirmed successfully",
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error("Error confirming transaction:", error);
    res.status(500).json({ 
      message: "Failed to confirm transaction", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route PUT /api/crypto-transactions/:id/reject
 * @desc Reject a pending transaction (admin only)
 * @access Private/Admin
 */
cryptoTransactionRouter.put('/:id/reject', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const transactionId = req.params.id;
    const reason = req.body.reason || "Transaction rejected by administrator";
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user is admin
    if (req.jwtPayload?.role !== 'admin' && req.jwtPayload?.role !== 'super_admin') {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    // Get transaction
    const [transaction] = await db
      .select({
        transaction: cryptoTransactions,
        wallet: cryptoWallets
      })
      .from(cryptoTransactions)
      .innerJoin(
        cryptoWallets,
        eq(cryptoTransactions.cryptoWalletId, cryptoWallets.id)
      )
      .where(eq(cryptoTransactions.id, transactionId));

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.transaction.status !== 'pending') {
      return res.status(400).json({ message: "Transaction is not in pending state" });
    }

    // Update transaction status
    const [updatedTransaction] = await db
      .update(cryptoTransactions)
      .set({ 
        status: "failed",
        metadata: JSON.stringify({
          ...JSON.parse(transaction.transaction.metadata?.toString() || "{}"),
          rejectionReason: reason
        })
      })
      .where(eq(cryptoTransactions.id, transactionId))
      .returning();

    // Create notification
    await db
      .insert(notifications)
      .values({
        userId: transaction.wallet.userId,
        title: `Crypto ${transaction.transaction.type.charAt(0).toUpperCase() + transaction.transaction.type.slice(1)} Rejected`,
        message: `Your ${transaction.transaction.type} of ${transaction.transaction.amount} on ${transaction.transaction.network} network has been rejected: ${reason}`,
        type: "transaction",
        link: `/wallet/crypto/${transaction.wallet.id}/transactions`
      });

    res.json({
      message: "Transaction rejected successfully",
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error("Error rejecting transaction:", error);
    res.status(500).json({ 
      message: "Failed to reject transaction", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default cryptoTransactionRouter;