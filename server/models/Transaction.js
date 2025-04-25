import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['investment', 'deposit', 'withdrawal', 'divestment', 'return', 'fee', 'transfer', 'referral_bonus', 'crypto_investment'],
    required: true
  },
  reference: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed' 
  },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  description: { type: String },
  receipt: { type: String }, // URL to receipt PDF if generated
  metadata: { type: mongoose.Schema.Types.Mixed }, // For additional data specific to transaction types
  paymentMethod: { type: String, enum: ['fiat', 'crypto'] },
  currency: { type: String },
  network: { type: String },
  paymentId: { type: String },
  paymentAddress: { type: String }, 
  paymentUrl: { type: String },
  expiresAt: { type: Date },
  transactionHash: { type: String }, // Blockchain transaction hash
  completedAt: { type: Date },
  crypto: {
    provider: { type: String }, // Payment provider (e.g., CoinGate, MetaMask)
    txHash: { type: String },    // Transaction hash on blockchain
    status: { type: String },    // Status from the provider
    walletAddress: { type: String }, // User's wallet address
    confirmations: { type: Number, default: 0 }, // Number of confirmations
    receivedAmount: { type: Number }, // Actual amount received after fees
    exchangeRate: { type: Number }    // Exchange rate at time of transaction
  },
  createdAt: { type: Date, default: Date.now }
});

// Create compound index on userId and createdAt for efficient user transaction history queries
transactionSchema.index({ userId: 1, createdAt: -1 });

// Create index on type for transaction reporting
transactionSchema.index({ type: 1 });

// Create index on status for transaction monitoring
transactionSchema.index({ status: 1 });

// Create index on paymentId for faster payment lookups
transactionSchema.index({ paymentId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;