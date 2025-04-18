const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['investment', 'deposit', 'withdrawal', 'divestment', 'return', 'fee', 'transfer', 'referral_bonus'],
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
  createdAt: { type: Date, default: Date.now }
});

// Create compound index on userId and createdAt for efficient user transaction history queries
transactionSchema.index({ userId: 1, createdAt: -1 });

// Create index on type for transaction reporting
transactionSchema.index({ type: 1 });

// Create index on status for transaction monitoring
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);