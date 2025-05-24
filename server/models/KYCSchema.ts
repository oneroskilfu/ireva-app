import mongoose, { Schema, Document } from 'mongoose';

// Define the document interface
export interface IKYC extends Document {
  user: mongoose.Types.ObjectId;
  userId: number; // Numeric ID from SQL database
  username: string; // Username for easier lookups
  status: 'pending' | 'approved' | 'rejected';
  documents: {
    idDocument: {
      type: 'national_id' | 'passport' | 'drivers_license' | 'voters_card';
      url: string;
      uploadedAt: Date;
      verificationStatus?: 'pending' | 'verified' | 'rejected';
      rejectionReason?: string;
    };
    selfie?: {
      url: string;
      uploadedAt: Date;
      verificationStatus?: 'pending' | 'verified' | 'rejected';
      rejectionReason?: string;
    };
    proofOfAddress?: {
      type: 'utility_bill' | 'bank_statement' | 'tax_document' | 'rental_agreement';
      url: string;
      uploadedAt: Date;
      verificationStatus?: 'pending' | 'verified' | 'rejected';
      rejectionReason?: string;
    };
  };
  personalInfo: {
    dateOfBirth: Date;
    nationality: string;
    residentialAddress: string;
    city: string;
    state: string;
    postalCode?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    occupation?: string;
    employmentStatus?: 'employed' | 'self_employed' | 'unemployed' | 'student' | 'retired';
  };
  submittedAt: Date;
  processedAt?: Date;
  processedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  adminNotes?: string;
  ipAddress?: string;
  userAgent?: string;
  verificationAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the KYC schema
const KYCSchema: Schema = new Schema(
  {
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    userId: {
      type: Number,
      required: true
      // Removed duplicate index: true since schema.index() is used elsewhere
    },
    username: {
      type: String,
      required: true,
      index: true
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending',
      index: true
    },
    documents: {
      idDocument: {
        type: { 
          type: String, 
          enum: ['national_id', 'passport', 'drivers_license', 'voters_card'], 
          required: true 
        },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        verificationStatus: { 
          type: String, 
          enum: ['pending', 'verified', 'rejected'], 
          default: 'pending' 
        },
        rejectionReason: { type: String }
      },
      selfie: {
        url: { type: String },
        uploadedAt: { type: Date },
        verificationStatus: { 
          type: String, 
          enum: ['pending', 'verified', 'rejected'], 
          default: 'pending' 
        },
        rejectionReason: { type: String }
      },
      proofOfAddress: {
        type: { 
          type: String, 
          enum: ['utility_bill', 'bank_statement', 'tax_document', 'rental_agreement'] 
        },
        url: { type: String },
        uploadedAt: { type: Date },
        verificationStatus: { 
          type: String, 
          enum: ['pending', 'verified', 'rejected'], 
          default: 'pending' 
        },
        rejectionReason: { type: String }
      }
    },
    personalInfo: {
      dateOfBirth: { type: Date, required: true },
      nationality: { type: String, required: true },
      residentialAddress: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String },
      gender: { 
        type: String,
        enum: ['male', 'female', 'other', 'prefer_not_to_say']
      },
      occupation: { type: String },
      employmentStatus: { 
        type: String,
        enum: ['employed', 'self_employed', 'unemployed', 'student', 'retired']
      }
    },
    submittedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    processedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    rejectionReason: { type: String },
    adminNotes: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    verificationAttempts: { type: Number, default: 1 }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for faster queries
KYCSchema.index({ 'documents.idDocument.verificationStatus': 1 });
KYCSchema.index({ submittedAt: -1 });
KYCSchema.index({ status: 1, submittedAt: -1 });

// Pre save middleware to update the user's KYC status
KYCSchema.pre('save', async function(next) {
  if (this.isModified('status')) {
    try {
      // Update the user's KYC status
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(this.user, { 
        kycStatus: this.status,
        kycSubmittedAt: this.submittedAt,
        kycVerifiedAt: this.status === 'approved' ? this.processedAt : undefined,
        kycRejectionReason: this.status === 'rejected' ? this.rejectionReason : undefined
      });
    } catch (error) {
      console.error('Error updating user KYC status:', error);
    }
  }
  next();
});

// Create and export the KYC model
const KYC = mongoose.model<IKYC>('KYC', KYCSchema);

export default KYC;