const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'investor', 'developer', 'staff'],
    default: 'investor'
  },
  profileImage: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Nigeria' }
  },
  kycVerified: {
    type: Boolean,
    default: false
  },
  kycDocuments: {
    idType: {
      type: String,
      enum: ['nationalId', 'driverLicense', 'passport', 'voterCard', ''],
      default: ''
    },
    idNumber: String,
    idFrontImage: String,
    idBackImage: String,
    selfieWithId: String,
    proofOfAddress: String,
    submissionDate: Date,
    verificationDate: Date,
    status: {
      type: String,
      enum: ['not_submitted', 'pending', 'approved', 'rejected'],
      default: 'not_submitted'
    },
    rejectionReason: String
  },
  financialInfo: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    bankCode: String,
    bvn: String,
    walletBalance: {
      type: Number,
      default: 0
    }
  },
  security: {
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    mfaMethod: {
      type: String,
      enum: ['none', 'app', 'sms', 'email'],
      default: 'none'
    },
    mfaSecret: String,
    backupCodes: [String],
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockedUntil: Date
  },
  socialAuth: {
    provider: String,
    providerId: String
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'NGN'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: true
    },
    appNotifications: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: true
    }
  },
  investmentPreferences: {
    riskTolerance: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    preferredLocations: [String],
    preferredPropertyTypes: [String],
    targetReturns: Number,
    investmentHorizon: Number // in months
  },
  statistics: {
    totalInvested: {
      type: Number,
      default: 0
    },
    totalReturns: {
      type: Number,
      default: 0
    },
    activeInvestments: {
      type: Number,
      default: 0
    },
    completedInvestments: {
      type: Number,
      default: 0
    },
    averageReturn: {
      type: Number,
      default: 0
    },
    lastLoginDate: Date
  },
  achievements: {
    badges: [{
      name: String,
      description: String,
      iconUrl: String,
      earnedAt: Date
    }],
    level: {
      type: Number,
      default: 1
    },
    points: {
      type: Number,
      default: 0
    },
    milestones: [{
      name: String,
      completed: Boolean,
      completedAt: Date
    }]
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastActive: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updatedAt timestamp
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update lastActive on login
  if (this.isModified('lastActive')) {
    this.statistics.lastLoginDate = this.lastActive;
  }
  
  // Ensure security.passwordChangedAt is updated when password changes
  if (this.isModified('password')) {
    this.security.passwordChangedAt = new Date();
  }
  
  next();
});

// Instance method to check if password is correct
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for KYC status
UserSchema.virtual('kycStatus').get(function() {
  return this.kycVerified ? 'Verified' : this.kycDocuments.status;
});

// Enable virtuals in JSON
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);