// server/controllers/adminWalletController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// Mock data for wallets
const walletData = [
  {
    id: "w-1",
    type: "main",
    balance: 12500000,
    currency: "₦"
  },
  {
    id: "w-2",
    type: "escrow",
    balance: 8900000,
    currency: "₦"
  },
  {
    id: "w-3",
    type: "rewards",
    balance: 450000,
    currency: "₦"
  },
];

// Mock data for transactions
let transactionData = [
  {
    id: "tx-1",
    type: "deposit",
    amount: 500000,
    status: "completed",
    date: "2025-04-25T10:15:32Z"
  },
  {
    id: "tx-2",
    type: "withdrawal",
    amount: 250000,
    status: "pending",
    date: "2025-04-27T14:22:10Z"
  },
  {
    id: "tx-3",
    type: "deposit",
    amount: 1000000,
    status: "completed",
    date: "2025-04-26T09:05:47Z"
  },
  {
    id: "tx-4",
    type: "withdrawal",
    amount: 750000,
    status: "pending",
    date: "2025-04-28T16:30:22Z"
  },
  {
    id: "tx-5",
    type: "deposit",
    amount: 320000,
    status: "pending",
    date: "2025-04-28T18:45:19Z"
  }
];

export const getWallets = async (req: Request, res: Response) => {
  try {
    res.status(200).json(walletData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve wallet data' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    res.status(200).json(transactionData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve transaction data' });
  }
};

export const approveTransaction = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const transactionIndex = transactionData.findIndex(tx => tx.id === id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    if (transactionData[transactionIndex].status !== 'pending') {
      return res.status(400).json({ error: 'Transaction is not pending' });
    }
    
    // Update the transaction status
    transactionData[transactionIndex] = {
      ...transactionData[transactionIndex],
      status: 'completed'
    };
    
    res.status(200).json({ 
      message: 'Transaction approved successfully',
      transaction: transactionData[transactionIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve transaction' });
  }
};