import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  balance: { 
    type: Number, 
    default: 0,
    min: 0
  },
  totalDeposited: { 
    type: Number, 
    default: 0 
  },
  totalWithdrawn: { 
    type: Number, 
    default: 0 
  },
  totalInvested: { 
    type: Number, 
    default: 0 
  },
  totalReturns: { 
    type: Number, 
    default: 0 
  },
  pendingTransactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  status: {
    type: String,
    enum: ['active', 'suspended', 'locked'],
    default: 'active'
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  // Crypto-related fields
  cryptoBalances: {
    type: Map,
    of: Number,
    default: new Map()
  },
  cryptoAddresses: {
    type: Map,
    of: String,
    default: new Map()
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Add middleware to update lastUpdated on each save
walletSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Create index for efficient user lookup
walletSchema.index({ userId: 1 });

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;