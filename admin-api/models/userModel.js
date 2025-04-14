const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      match: [
        /^\+[1-9]\d{1,14}$/,
        'Please add a valid phone number in international format (e.g. +2348012345678)'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    isKYCApproved: {
      type: Boolean,
      default: false
    },
    kycDocuments: {
      idCard: String,
      addressProof: String,
      photo: String
    },
    walletBalance: {
      type: Number,
      default: 0
    },
    mfaEnabled: {
      type: Boolean,
      default: false
    },
    mfaSecret: String,
    backupCodes: [String],
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);