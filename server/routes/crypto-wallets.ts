import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock wallet data store (would be a database in production)
const wallets = new Map<number, { address: string, network: string, userId: number }>();

// Generate a random address for demo purposes
const generateMockAddress = (network: string) => {
  if (network === 'ethereum' || network === 'polygon' || network === 'binance') {
    return '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  } else if (network === 'solana') {
    return Array.from({ length: 44 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  } else {
    return '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
};

// Connect a crypto wallet
router.post('/connect', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { network = 'ethereum' } = req.body;
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Generate a mock address for the user
    const address = generateMockAddress(network);
    
    // Store the wallet information
    const walletId = Math.floor(Math.random() * 10000);
    wallets.set(walletId, { address, network, userId });
    
    // Create notification
    await storage.createNotification({
      userId,
      type: 'wallet_connected',
      title: 'Wallet Connected',
      message: `Your ${network} wallet has been connected successfully.`,
      isRead: false
    });
    
    res.status(201).json({
      id: walletId,
      address,
      network,
      userId
    });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    res.status(500).json({ message: 'Failed to connect wallet' });
  }
});

// Get user's wallets
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get all wallets for the user
    const userWallets = Array.from(wallets.entries())
      .filter(([, wallet]) => wallet.userId === userId)
      .map(([id, wallet]) => ({
        id,
        address: wallet.address,
        network: wallet.network
      }));
    
    res.json(userWallets);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ message: 'Failed to fetch wallets' });
  }
});

// Disconnect wallet
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const walletId = parseInt(req.params.id);
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const wallet = wallets.get(walletId);
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    if (wallet.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // Remove wallet
    wallets.delete(walletId);
    
    res.json({ message: 'Wallet disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    res.status(500).json({ message: 'Failed to disconnect wallet' });
  }
});

export default router;