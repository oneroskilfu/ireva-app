const mongoose = require('mongoose');

/**
 * Enhanced KYC schema with crypto-specific compliance fields
 * Includes fields required for anti-money laundering (AML) and
 * know-your-customer (KYC) compliance for crypto transactions
 */
const KYCSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Personal Information
  fullName: { 
    type: String, 
    required: true,
    trim: true
  },
  address: { 
    type: String, 
    required: true,
    trim: true
  },
  city: { 
    type: String, 
    required: true,
    trim: true
  },
  country: { 
    type: String, 
    required: true,
    trim: true
  },
  citizenship: { 
    type: String, 
    required: true,
    trim: true
  },
  occupation: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Identity Verification
  idDocumentType: {
    type: String,
    enum: ['passport', 'drivers-license', 'national-id'],
    required: true
  },
  idDocumentUrl: { 
    type: String, 
    required: true 
  },
  proofOfAddressUrl: { 
    type: String, 
    required: true 
  },
  
  // Crypto-Specific Information
  cryptoWallet: { 
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Validate Ethereum address format (optional field)
        return !v || /^(0x)?[0-9a-fA-F]{40}$/.test(v);
      },
      message: props => `${props.value} is not a valid Ethereum address!`
    }
  },
  sourceOfFunds: { 
    type: String, 
    required: true,
    trim: true
  },
  expectedInvestmentRange: {
    type: String,
    enum: ['under-10k', '10k-50k', '50k-100k', '100k-500k', 'above-500k'],
    required: true
  },
  isPEP: { 
    type: Boolean, 
    default: false
  },
  
  // AML/KYC Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  rejectionReason: { 
    type: String,
    trim: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: { 
    type: Date 
  },
  
  // IP address for compliance tracking
  submissionIp: {
    type: String,
    trim: true
  },
  
  // System tracking
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

// Index for efficient queries
KYCSchema.index({ status: 1, createdAt: -1 });

// Pre-save hook to ensure updatedAt is set properly
KYCSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('KYC', KYCSchema);