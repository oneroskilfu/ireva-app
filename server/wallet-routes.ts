import { Request, Response, Router } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./db";
import { wallets, transactions, users, transactionActionEnum } from "@shared/schema";
import { authMiddleware } from "./auth-jwt";
import { zodValidator } from "./utils/validators";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const walletRouter = Router();

// Get user wallet
walletRouter.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User ID not found" });
    }
    
    // Find the user's wallet
    const [wallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, req.user.id));
    
    if (!wallet) {
      // Create a new wallet if one doesn't exist
      const [newWallet] = await db.insert(wallets)
        .values({
          userId: req.user.id,
          balance: 0,
          currency: "NGN",
          isActive: true,
        })
        .returning();
      
      return res.json(newWallet);
    }
    
    res.json(wallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});

// Get wallet transaction history
walletRouter.get("/transactions", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User ID not found" });
    }
    
    const walletTransactions = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, req.user.id))
      .orderBy(desc(transactions.createdAt));
    
    res.json(walletTransactions);
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    res.status(500).json({ error: "Failed to fetch wallet transactions" });
  }
});

// Fund wallet
walletRouter.post(
  "/fund", 
  authMiddleware,
  zodValidator(z.object({
    amount: z.number().positive("Amount must be positive"),
    description: z.string().optional(),
  })),
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "User ID not found" });
      }
      
      const { amount, description } = req.body;
      
      // Find the user's wallet
      const [wallet] = await db.select()
        .from(wallets)
        .where(eq(wallets.userId, req.user.id));
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      // Begin transaction
      await db.transaction(async (tx) => {
        // Update wallet balance
        const [updatedWallet] = await tx.update(wallets)
          .set({
            balance: wallet.balance + amount,
            lastUpdated: new Date(),
          })
          .where(eq(wallets.id, wallet.id))
          .returning();
        
        // Create transaction record
        const [transaction] = await tx.insert(transactions)
          .values({
            userId: req.user!.id,
            type: "deposit",
            amount,
            description: description || "Wallet funding",
            reference: uuidv4(),
            status: "completed",
            walletId: wallet.id,
            balanceBefore: wallet.balance,
            balanceAfter: updatedWallet.balance,
          })
          .returning();
        
        res.status(201).json({ wallet: updatedWallet, transaction });
      });
    } catch (error) {
      console.error("Error funding wallet:", error);
      res.status(500).json({ error: "Failed to fund wallet" });
    }
  }
);

// Withdraw from wallet
walletRouter.post(
  "/withdraw", 
  authMiddleware,
  zodValidator(z.object({
    amount: z.number().positive("Amount must be positive"),
    description: z.string().optional(),
  })),
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "User ID not found" });
      }
      
      const { amount, description } = req.body;
      
      // Find the user's wallet
      const [wallet] = await db.select()
        .from(wallets)
        .where(eq(wallets.userId, req.user.id));
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      // Check if sufficient balance
      if (wallet.balance < amount) {
        return res.status(400).json({ error: "Insufficient funds" });
      }
      
      // Begin transaction
      await db.transaction(async (tx) => {
        // Update wallet balance
        const [updatedWallet] = await tx.update(wallets)
          .set({
            balance: wallet.balance - amount,
            lastUpdated: new Date(),
          })
          .where(eq(wallets.id, wallet.id))
          .returning();
        
        // Create transaction record
        const [transaction] = await tx.insert(transactions)
          .values({
            userId: req.user!.id,
            type: "withdrawal",
            amount,
            description: description || "Wallet withdrawal",
            reference: uuidv4(),
            status: "completed",
            walletId: wallet.id,
            balanceBefore: wallet.balance,
            balanceAfter: updatedWallet.balance,
          })
          .returning();
        
        res.status(201).json({ wallet: updatedWallet, transaction });
      });
    } catch (error) {
      console.error("Error withdrawing from wallet:", error);
      res.status(500).json({ error: "Failed to withdraw from wallet" });
    }
  }
);

// Admin: Get all wallets (Admin only)
walletRouter.get("/admin/wallets", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User ID not found" });
    }
    
    // Check if user is admin
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    // Get all wallets with user information
    const allWallets = await db.select({
      wallet: wallets,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      }
    })
    .from(wallets)
    .innerJoin(users, eq(wallets.userId, users.id));
    
    res.json(allWallets);
  } catch (error) {
    console.error("Error fetching all wallets:", error);
    res.status(500).json({ error: "Failed to fetch all wallets" });
  }
});

// Admin: Get all wallet transactions (Admin only)
walletRouter.get("/admin/transactions", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "User ID not found" });
    }
    
    // Check if user is admin
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    // Get all transactions with user information
    const allTransactions = await db.select({
      transaction: transactions,
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      }
    })
    .from(transactions)
    .innerJoin(users, eq(transactions.userId, users.id))
    .orderBy(desc(transactions.createdAt));
    
    res.json(allTransactions);
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    res.status(500).json({ error: "Failed to fetch all transactions" });
  }
});

// Admin: Manually adjust user wallet (Admin only)
walletRouter.post(
  "/admin/adjust", 
  authMiddleware,
  zodValidator(z.object({
    userId: z.number(),
    amount: z.number(),
    type: z.enum(["deposit", "withdrawal", "adjustment"]),
    description: z.string(),
  })),
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "User ID not found" });
      }
      
      // Check if user is admin
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      const { userId, amount, type, description } = req.body;
      
      // Find the target user's wallet
      const [wallet] = await db.select()
        .from(wallets)
        .where(eq(wallets.userId, userId));
      
      if (!wallet) {
        return res.status(404).json({ error: "Wallet not found" });
      }
      
      // Calculate new balance based on type
      let newBalance = wallet.balance;
      if (type === "deposit") {
        newBalance += amount;
      } else if (type === "withdrawal") {
        // Check if sufficient balance for withdrawals
        if (wallet.balance < amount) {
          return res.status(400).json({ error: "Insufficient funds" });
        }
        newBalance -= amount;
      } else if (type === "adjustment") {
        // For direct adjustments, amount can be positive or negative
        newBalance += amount;
      }
      
      // Begin transaction
      await db.transaction(async (tx) => {
        // Update wallet balance
        const [updatedWallet] = await tx.update(wallets)
          .set({
            balance: newBalance,
            lastUpdated: new Date(),
          })
          .where(eq(wallets.id, wallet.id))
          .returning();
        
        // Create transaction record
        const [transaction] = await tx.insert(transactions)
          .values({
            userId,
            type: type as any, // Cast to transaction type
            amount: Math.abs(amount), // Store absolute amount
            description: `[Admin adjustment] ${description}`,
            reference: uuidv4(),
            status: "completed",
            walletId: wallet.id,
            balanceBefore: wallet.balance,
            balanceAfter: updatedWallet.balance,
            metadata: {
              adjustedBy: req.user!.id,
              adminNote: description
            }
          })
          .returning();
        
        res.status(201).json({ wallet: updatedWallet, transaction });
      });
    } catch (error) {
      console.error("Error adjusting wallet:", error);
      res.status(500).json({ error: "Failed to adjust wallet" });
    }
  }
);

export default walletRouter;