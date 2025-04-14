const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in query results
  },
  role: {
    type: String,
    enum: ['admin', 'investor', 'project_owner'],
    default: 'investor'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  phoneNumber: {
    type: String,
    match: [/^\+[1-9]\d{1,14}$/, 'Please provide a valid phone number in E.164 format'],
    sparse: true // Allow null values but enforce uniqueness if provided
  },
  kycStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'approved', 'rejected'],
    default: 'not_submitted'
  },
  kycDocuments: {
    idCard: {
      type: String,
      default: null
    },
    addressProof: {
      type: String,
      default: null
    },
    selfie: {
      type: String,
      default: null
    }
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  mfaEnabled: {
    type: Boolean,
    default: false
  },
  mfaSecret: {
    type: String,
    select: false // Don't return MFA secret in query results
  },
  backupCodes: {
    type: [String],
    select: false // Don't return backup codes in query results
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password matches
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate JWT token
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, username: this.username, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Static method to find user by id and update last login
UserSchema.statics.findByIdAndUpdateLogin = async function(id) {
  return await this.findByIdAndUpdate(
    id,
    { lastLogin: Date.now() },
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -resetPasswordToken');
};

module.exports = mongoose.model('User', UserSchema);