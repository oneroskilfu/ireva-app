import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  amount: {
    type: Number,
    required: [true, 'Please provide investment amount in Naira'],
    min: [100000, 'Minimum investment is ₦100,000']
  },
  units: {
    type: Number,
    default: 1
  },
  paymentDetails: {
    method: {
      type: String,
      enum: ['Wallet', 'Bank Transfer', 'Card Payment', 'PayStack'],
      required: true
    },
    reference: String,
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    date: Date
  },
  investmentDate: {
    type: Date,
    default: Date.now
  },
  maturityDate: Date,
  roi: {
    expectedRate: {
      type: Number,
      required: true
    },
    projectedAmount: Number,
    payoutSchedule: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Annually', 'At Maturity'],
      default: 'Quarterly'
    },
    nextPayoutDate: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Matured', 'Cancelled', 'Pending'],
    default: 'Pending'
  },
  payouts: [
    {
      amount: Number,
      date: Date,
      status: {
        type: String,
        enum: ['Scheduled', 'Processed', 'Failed'],
        default: 'Scheduled'
      },
      reference: String
    }
  ],
  reinvestment: {
    isAutoReinvest: {
      type: Boolean,
      default: false
    },
    reinvestmentPercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  },
  certificate: {
    certificateNumber: String,
    issuedDate: Date,
    url: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Calculate projected amount
investmentSchema.pre('save', function(next) {
  // Calculate projected amount based on ROI rate
  if (this.roi && this.roi.expectedRate && this.amount) {
    const yearsToMaturity = this.maturityDate ? 
      Math.max(0, (new Date(this.maturityDate) - new Date(this.investmentDate)) / (1000 * 60 * 60 * 24 * 365)) : 
      5; // Default to 5 years if maturity date not set
    
    this.roi.projectedAmount = this.amount * (1 + (this.roi.expectedRate / 100) * yearsToMaturity);
  }
  
  this.updatedAt = Date.now();
  next();
});

export const Investment = mongoose.model('Investment', investmentSchema);