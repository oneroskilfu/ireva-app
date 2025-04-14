const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['investor', 'admin', 'projectOwner'],
    default: 'investor'
  },
  avatar: {
    type: String,
    default: ''
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  investments: [{
    type: Schema.Types.ObjectId,
    ref: 'Investment'
  }],
  // KYC verification status
  kycVerified: {
    type: Boolean,
    default: false
  },
  kycDocuments: {
    idDocument: { type: String, default: '' },
    addressProof: { type: String, default: '' },
    photo: { type: String, default: '' },
    submitted: { type: Boolean, default: false },
    reviewedAt: { type: Date, default: null }
  },
  // Authentication and security
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaMethod: {
    type: String,
    enum: ['app', 'sms', 'email', null],
    default: null
  },
  mfaSecret: {
    type: String,
    default: null
  },
  backupCodes: [{
    code: String,
    used: { type: Boolean, default: false }
  }],
  lastLogin: {
    type: Date,
    default: null
  },
  securityQuestions: [{
    question: String,
    answer: String
  }],
  // Preferences and notification settings
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'NGN' }
  },
  // Social media integration
  socialAccounts: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  // Additional metadata
  bio: {
    type: String,
    default: ''
  },
  location: {
    city: String,
    state: String,
    country: { type: String, default: 'Nigeria' }
  },
  // Session management
  activeSessions: [{
    token: String,
    device: String,
    ip: String,
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
  }],
  // Community and social features
  referredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  referrals: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  achievements: [{
    type: { type: String },
    name: String,
    description: String,
    dateEarned: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', UserSchema);