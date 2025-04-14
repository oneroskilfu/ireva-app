const mongoose = require('mongoose');

const roiSchema = new mongoose.Schema({
  investment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: true
  },
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
  initialInvestment: {
    type: Number,
    required: true
  },
  expectedROIRate: {
    type: Number,
    required: true
  },
  investmentDate: {
    type: Date,
    required: true
  },
  maturityDate: {
    type: Date,
    required: true
  },
  projectedReturns: {
    totalReturn: Number,
    projectedAmount: Number,
    annualizedReturnRate: Number
  },
  actualReturns: {
    totalPaidOut: {
      type: Number,
      default: 0
    },
    currentValue: {
      type: Number,
      default: 0
    },
    currentROIRate: {
      type: Number,
      default: 0
    }
  },
  payouts: [
    {
      amount: Number,
      date: Date,
      period: {
        start: Date,
        end: Date
      },
      status: {
        type: String,
        enum: ['Scheduled', 'Processed', 'Pending', 'Failed'],
        default: 'Scheduled'
      },
      reference: String
    }
  ],
  performanceMetrics: {
    valueAppreciation: Number,
    occupancyRate: Number,
    rentalYield: Number,
    marketComparison: Number,
    constructionProgress: Number
  },
  status: {
    type: String,
    enum: ['Active', 'Matured', 'Cancelled', 'On Hold'],
    default: 'Active'
  },
  lastCalculationDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Calculate projected returns before saving
roiSchema.pre('save', function(next) {
  // Calculate investment duration in years
  const investmentDuration = 
    (new Date(this.maturityDate) - new Date(this.investmentDate)) / (1000 * 60 * 60 * 24 * 365);
  
  // Calculate projected total return
  const totalReturn = this.initialInvestment * (this.expectedROIRate / 100) * investmentDuration;
  
  // Calculate projected amount at maturity
  const projectedAmount = this.initialInvestment + totalReturn;
  
  // Calculate annualized return rate
  const annualizedReturnRate = this.expectedROIRate;
  
  // Update projected returns
  this.projectedReturns = {
    totalReturn,
    projectedAmount,
    annualizedReturnRate
  };
  
  // Update last calculation date and updatedAt
  this.lastCalculationDate = new Date();
  this.updatedAt = new Date();
  
  next();
});

module.exports = mongoose.model('ROI', roiSchema);