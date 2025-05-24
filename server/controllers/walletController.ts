import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertWalletSchema, insertWalletTransactionSchema } from '../../shared/schema';
import { z } from 'zod';

// Get wallet for currently logged in user
export async function getWallet(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const wallet = await storage.getUserWallet(req.user.id);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    return res.status(200).json(wallet);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return res.status(500).json({ message: 'Error fetching wallet' });
  }
}

// Get wallet transactions for currently logged in user
export async function getWalletTransactions(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const wallet = await storage.getUserWallet(req.user.id);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const transactions = await storage.getWalletTransactions(wallet.id);
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return res.status(500).json({ message: 'Error fetching wallet transactions' });
  }
}

// Create wallet for user
export async function createWallet(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user already has a wallet
    const existingWallet = await storage.getUserWallet(req.user.id);
    if (existingWallet) {
      return res.status(400).json({ message: 'User already has a wallet' });
    }

    // Create wallet
    const walletData = insertWalletSchema.parse({
      userId: req.user.id,
      balance: 0,
      currency: 'NGN'
    });

    const wallet = await storage.createWallet(walletData);
    return res.status(201).json(wallet);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid wallet data', errors: error.errors });
    }
    console.error('Error creating wallet:', error);
    return res.status(500).json({ message: 'Error creating wallet' });
  }
}

// Deposit funds into wallet
export async function depositFunds(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const schema = z.object({
      amount: z.number().positive('Amount must be positive'),
      reference: z.string().optional()
    });

    const { amount, reference } = schema.parse(req.body);

    // Get user wallet
    const wallet = await storage.getUserWallet(req.user.id);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Create transaction
    const transactionData = insertWalletTransactionSchema.parse({
      walletId: wallet.id,
      amount,
      type: 'deposit',
      description: 'Deposit to wallet',
      reference,
      status: 'successful'
    });

    // Update wallet balance and create transaction
    const updatedWallet = await storage.updateWalletBalance(wallet.id, amount);
    const transaction = await storage.createWalletTransaction(transactionData, updatedWallet);

    return res.status(200).json({ wallet: updatedWallet, transaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid deposit data', errors: error.errors });
    }
    console.error('Error depositing funds:', error);
    return res.status(500).json({ message: 'Error depositing funds' });
  }
}

// Withdraw funds from wallet
export async function withdrawFunds(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const schema = z.object({
      amount: z.number().positive('Amount must be positive'),
      reference: z.string().optional()
    });

    const { amount, reference } = schema.parse(req.body);

    // Get user wallet
    const wallet = await storage.getUserWallet(req.user.id);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check if wallet has sufficient funds
    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Create transaction
    const transactionData = insertWalletTransactionSchema.parse({
      walletId: wallet.id,
      amount: -amount, // Negative amount for withdrawal
      type: 'withdrawal',
      description: 'Withdrawal from wallet',
      reference,
      status: 'successful'
    });

    // Update wallet balance and create transaction
    const updatedWallet = await storage.updateWalletBalance(wallet.id, -amount);
    const transaction = await storage.createWalletTransaction(transactionData, updatedWallet);

    return res.status(200).json({ wallet: updatedWallet, transaction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid withdrawal data', errors: error.errors });
    }
    console.error('Error withdrawing funds:', error);
    return res.status(500).json({ message: 'Error withdrawing funds' });
  }
}