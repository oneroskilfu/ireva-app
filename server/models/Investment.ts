import mongoose, { Schema, Document } from 'mongoose';

// Define the document interface
export interface IInvestment extends Document {
  investor: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  earnings: number;
  monthlyReturn: number;
  nextPayoutDate?: Date;
  startDate: Date;
  endDate?: Date;
  term: number; // In months
  payoutMethod?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode?: string;
  };
  certificateUrl?: string;
  payoutHistory: {
    date: Date;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    reference?: string;
    notes?: string;
  }[];
  documents: {
    name: string;
    url: string;
    type: string;
    createdAt: Date;
  }[];
  roi: number;
  roiAccrued: number;
  reinvestmentOption: 'auto' | 'manual';
  reinvestmentPercentage?: number;
  investmentNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Investment schema
const InvestmentSchema: Schema = new Schema(
  {
    investor: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    property: { 
      type: Schema.Types.ObjectId, 
      ref: 'Project', 
      required: true,
      index: true
    },
    amount: { type: Number, required: true },
    status: { 
      type: String, 
      required: true, 
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
      index: true
    },
    earnings: { type: Number, default: 0 },
    monthlyReturn: { type: Number, required: true },
    nextPayoutDate: { type: Date },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    term: { type: Number, required: true }, // In months
    payoutMethod: { type: String, default: 'bank_transfer' },
    bankDetails: {
      accountName: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      bankCode: { type: String }
    },
    certificateUrl: { type: String },
    payoutHistory: [{
      date: { type: Date, required: true },
      amount: { type: Number, required: true },
      status: { 
        type: String, 
        required: true, 
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      },
      reference: { type: String },
      notes: { type: String }
    }],
    documents: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    roi: { type: Number, required: true }, // Expected ROI percentage
    roiAccrued: { type: Number, default: 0 }, // Actual accrued ROI percentage
    reinvestmentOption: { 
      type: String, 
      enum: ['auto', 'manual'],
      default: 'manual'
    },
    reinvestmentPercentage: { type: Number, default: 0 }, // Percentage of earnings to reinvest
    investmentNotes: { type: String }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index for investor and property
InvestmentSchema.index({ investor: 1, property: 1 });

// Index for reporting and analytics
InvestmentSchema.index({ createdAt: -1 });
InvestmentSchema.index({ status: 1, createdAt: -1 });

// Virtuals for calculated fields
InvestmentSchema.virtual('durationInMonths').get(function(this: IInvestment) {
  if (!this.endDate) return 0;
  
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
    
  return months;
});

InvestmentSchema.virtual('totalExpectedReturn').get(function(this: IInvestment) {
  return this.amount * (this.roi / 100);
});

InvestmentSchema.virtual('progress').get(function(this: IInvestment) {
  if (this.status === 'completed') return 100;
  
  const startDate = new Date(this.startDate);
  const currentDate = new Date();
  const endDate = this.endDate ? new Date(this.endDate) : 
    new Date(startDate.setMonth(startDate.getMonth() + this.term));
  
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = currentDate.getTime() - startDate.getTime();
  
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  return Math.round(progress);
});

// Pre-save hook to update nextPayoutDate if not set
InvestmentSchema.pre('save', function(next) {
  if (!this.nextPayoutDate && this.status === 'active') {
    const now = new Date();
    // Set next payout to 30 days from now
    this.nextPayoutDate = new Date(now.setDate(now.getDate() + 30));
  }
  next();
});

// Create and export the Investment model
const Investment = mongoose.model<IInvestment>('Investment', InvestmentSchema);

export default Investment;