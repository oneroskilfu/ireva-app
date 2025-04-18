const mongoose = require('mongoose');

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

module.exports = mongoose.model('Wallet', walletSchema);