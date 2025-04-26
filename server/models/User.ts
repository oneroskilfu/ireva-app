import mongoose, { Schema, Document } from 'mongoose';

// Define the document interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'investor' | 'admin' | 'super_admin';
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isPhoneVerified: boolean;
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  kycDocuments?: {
    idDocument: {
      type: string;
      url: string;
      uploadedAt: Date;
    };
    selfie?: {
      url: string;
      uploadedAt: Date;
    };
    proofOfAddress?: {
      type: string;
      url: string;
      uploadedAt: Date;
    };
  };
  kycRejectionReason?: string;
  kycSubmittedAt?: Date;
  kycVerifiedAt?: Date;
  accreditationLevel: 'non_accredited' | 'accredited' | 'qualified_investor';
  accreditationDocuments?: {
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }[];
  accreditationVerifiedAt?: Date;
  profileImage?: string;
  bio?: string;
  investmentPreferences?: {
    propertyTypes: string[];
    locations: string[];
    minimumROI: number;
    investmentHorizon: 'short_term' | 'medium_term' | 'long_term';
  };
  wallet?: {
    balance: number;
    pendingTransactions: number;
    lastUpdated: Date;
  };
  bankAccounts?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode?: string;
    default: boolean;
  }[];
  totalInvested: number;
  totalEarnings: number;
  rewardsPoints: number;
  badges?: string[];
  referralCode?: string;
  referredBy?: mongoose.Types.ObjectId;
  referrals?: mongoose.Types.ObjectId[];
  referralBonus: number;
  referralRewards: number;
  notificationPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketingEmails: boolean;
  };
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  directMessageEnabled: boolean;
  lastActiveAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the User schema
const UserSchema: Schema = new Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['investor', 'admin', 'super_admin'], 
      default: 'investor' 
    },
    firstName: { 
      type: String, 
      required: true 
    },
    lastName: { 
      type: String, 
      required: true 
    },
    phoneNumber: { 
      type: String, 
      required: true 
    },
    isPhoneVerified: { 
      type: Boolean, 
      default: false 
    },
    kycStatus: { 
      type: String, 
      enum: ['not_started', 'pending', 'approved', 'rejected'], 
      default: 'not_started' 
    },
    kycDocuments: {
      idDocument: {
        type: { type: String },
        url: { type: String },
        uploadedAt: { type: Date }
      },
      selfie: {
        url: { type: String },
        uploadedAt: { type: Date }
      },
      proofOfAddress: {
        type: { type: String },
        url: { type: String },
        uploadedAt: { type: Date }
      }
    },
    kycRejectionReason: { type: String },
    kycSubmittedAt: { type: Date },
    kycVerifiedAt: { type: Date },
    accreditationLevel: { 
      type: String, 
      enum: ['non_accredited', 'accredited', 'qualified_investor'], 
      default: 'non_accredited' 
    },
    accreditationDocuments: [{
      name: { type: String },
      url: { type: String },
      type: { type: String },
      uploadedAt: { type: Date }
    }],
    accreditationVerifiedAt: { type: Date },
    profileImage: { type: String },
    bio: { type: String },
    investmentPreferences: {
      propertyTypes: [{ type: String }],
      locations: [{ type: String }],
      minimumROI: { type: Number },
      investmentHorizon: { 
        type: String,
        enum: ['short_term', 'medium_term', 'long_term']
      }
    },
    wallet: {
      balance: { type: Number, default: 0 },
      pendingTransactions: { type: Number, default: 0 },
      lastUpdated: { type: Date }
    },
    bankAccounts: [{
      accountName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      bankName: { type: String, required: true },
      bankCode: { type: String },
      default: { type: Boolean, default: false }
    }],
    totalInvested: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    rewardsPoints: { type: Number, default: 0 },
    badges: [{ type: String }],
    referralCode: { type: String, unique: true, index: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    referrals: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    referralBonus: { type: Number, default: 0 },
    referralRewards: { type: Number, default: 0 },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      marketingEmails: { type: Boolean, default: false }
    },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    directMessageEnabled: { type: Boolean, default: true },
    lastActiveAt: { type: Date },
    lastLoginAt: { type: Date }
  },
  { 
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.password; // Remove password from JSON responses
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

// Index for search
UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text', username: 'text' });

// Index for KYC
UserSchema.index({ kycStatus: 1 });

// Index for createdAt
UserSchema.index({ createdAt: -1 });

// Create and export the User model
const User = mongoose.model<IUser>('User', UserSchema);

export default User;