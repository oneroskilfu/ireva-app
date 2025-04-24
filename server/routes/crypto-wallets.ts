import { Router, Request, Response } from 'express';
import { db } from '../db';
import { 
  cryptoWallets, 
  cryptoTransactions, 
  insertCryptoWalletSchema,
  insertCryptoTransactionSchema 
} from '../../shared/schema';
import { verifyToken } from '../auth-jwt';
import { and, eq, desc } from 'drizzle-orm';
import { ZodError } from 'zod';

const cryptoWalletRouter = Router();

/**
 * @route GET /api/crypto-wallets
 * @desc Get all user's crypto wallets
 * @access Private
 */
cryptoWalletRouter.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userWallets = await db
      .select()
      .from(cryptoWallets)
      .where(eq(cryptoWallets.userId, userId.toString()))
      .orderBy(cryptoWallets.createdAt);

    res.json(userWallets);
  } catch (error) {
    console.error("Error fetching crypto wallets:", error);
    res.status(500).json({ 
      message: "Failed to fetch crypto wallets", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route POST /api/crypto-wallets
 * @desc Add a new crypto wallet
 * @access Private
 */
cryptoWalletRouter.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validate wallet data
    const walletData = insertCryptoWalletSchema.parse({
      ...req.body,
      userId: userId.toString()
    });

    // Check if wallet address already exists for this network
    const existingWallet = await db
      .select()
      .from(cryptoWallets)
      .where(
        and(
          eq(cryptoWallets.address, walletData.address),
          eq(cryptoWallets.network, walletData.network)
        )
      );

    if (existingWallet.length > 0) {
      return res.status(400).json({ message: "Wallet with this address and network already exists" });
    }

    // If this is the first wallet, mark it as primary
    const userWallets = await db
      .select()
      .from(cryptoWallets)
      .where(eq(cryptoWallets.userId, userId.toString()));

    const isPrimary = userWallets.length === 0;

    // Create wallet
    const [newWallet] = await db
      .insert(cryptoWallets)
      .values({
        ...walletData,
        isPrimary
      })
      .returning();

    res.status(201).json(newWallet);
  } catch (error) {
    console.error("Error adding crypto wallet:", error);
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Invalid wallet data", 
        errors: error.errors 
      });
    }
    res.status(500).json({ 
      message: "Failed to add crypto wallet", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route PUT /api/crypto-wallets/:id/primary
 * @desc Set a crypto wallet as primary
 * @access Private
 */
cryptoWalletRouter.put('/:id/primary', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const walletId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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

    // Update all user's wallets to non-primary
    await db
      .update(cryptoWallets)
      .set({ isPrimary: false })
      .where(eq(cryptoWallets.userId, userId.toString()));

    // Set this wallet to primary
    await db
      .update(cryptoWallets)
      .set({ isPrimary: true })
      .where(eq(cryptoWallets.id, walletId));

    res.json({ message: "Wallet set as primary" });
  } catch (error) {
    console.error("Error setting primary wallet:", error);
    res.status(500).json({ 
      message: "Failed to set primary wallet", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route PUT /api/crypto-wallets/:id
 * @desc Update a crypto wallet
 * @access Private
 */
cryptoWalletRouter.put('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const walletId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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

    // Update wallet (only allow updating label)
    const [updatedWallet] = await db
      .update(cryptoWallets)
      .set({ 
        label: req.body.label 
      })
      .where(eq(cryptoWallets.id, walletId))
      .returning();

    res.json(updatedWallet);
  } catch (error) {
    console.error("Error updating crypto wallet:", error);
    res.status(500).json({ 
      message: "Failed to update crypto wallet", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route DELETE /api/crypto-wallets/:id
 * @desc Delete a crypto wallet
 * @access Private
 */
cryptoWalletRouter.delete('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const walletId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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

    // Delete wallet
    await db
      .delete(cryptoWallets)
      .where(eq(cryptoWallets.id, walletId));

    // If this was the primary wallet, set another wallet as primary
    if (wallet.isPrimary) {
      const [anotherWallet] = await db
        .select()
        .from(cryptoWallets)
        .where(eq(cryptoWallets.userId, userId.toString()))
        .limit(1);

      if (anotherWallet) {
        await db
          .update(cryptoWallets)
          .set({ isPrimary: true })
          .where(eq(cryptoWallets.id, anotherWallet.id));
      }
    }

    res.json({ message: "Wallet deleted successfully" });
  } catch (error) {
    console.error("Error deleting crypto wallet:", error);
    res.status(500).json({ 
      message: "Failed to delete crypto wallet", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route GET /api/crypto-wallets/:id/transactions
 * @desc Get all transactions for a crypto wallet
 * @access Private
 */
cryptoWalletRouter.get('/:id/transactions', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const walletId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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

    // Get wallet transactions
    const transactions = await db
      .select()
      .from(cryptoTransactions)
      .where(eq(cryptoTransactions.cryptoWalletId, walletId))
      .orderBy(desc(cryptoTransactions.createdAt));

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    res.status(500).json({ 
      message: "Failed to fetch wallet transactions", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default cryptoWalletRouter;