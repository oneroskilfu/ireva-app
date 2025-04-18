const mongoose = require('mongoose');

/**
 * Log Schema
 * Stores admin actions for audit purposes
 */
const logSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['ROI', 'KYC', 'Project', 'Investment', 'User', 'Wallet', 'System']
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Create compound indexes for common queries
logSchema.index({ type: 1, createdAt: -1 });
logSchema.index({ adminId: 1, createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);