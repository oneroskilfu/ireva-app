import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide property name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide property description']
  },
  type: {
    type: String,
    required: [true, 'Please specify property type'],
    enum: ['Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Land']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide property address']
    },
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    state: {
      type: String,
      required: [true, 'Please provide state'],
      default: 'Lagos'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  price: {
    type: Number,
    required: [true, 'Please provide property value in Naira']
  },
  images: [String],
  mainImage: String,
  amenities: [String],
  size: {
    type: Number,
    required: [true, 'Please provide property size in square meters']
  },
  numberOfUnits: {
    type: Number,
    default: 1
  },
  investmentDetails: {
    minimumInvestment: {
      type: Number,
      required: [true, 'Please specify minimum investment amount'],
      default: 100000 // ₦100,000
    },
    expectedROI: {
      type: Number,
      required: [true, 'Please provide expected ROI percentage']
    },
    duration: {
      type: Number,
      required: [true, 'Please provide investment duration in years'],
      default: 5
    },
    totalFundingNeeded: {
      type: Number,
      required: [true, 'Please provide the total funding amount needed']
    },
    amountRaised: {
      type: Number,
      default: 0
    },
    fundingProgress: {
      type: Number,
      default: 0
    },
    maturityDate: Date,
    payoutFrequency: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Annually', 'At Maturity'],
      default: 'Quarterly'
    }
  },
  riskRating: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Fully Funded', 'Under Development', 'Completed'],
    default: 'Available'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  documents: [
    {
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['Title Deed', 'Survey', 'Building Permit', 'Floor Plan', 'Other']
      }
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Calculate funding progress
propertySchema.pre('save', function(next) {
  if (this.investmentDetails.amountRaised && this.investmentDetails.totalFundingNeeded) {
    this.investmentDetails.fundingProgress = Math.min(
      100,
      Math.round(
        (this.investmentDetails.amountRaised / this.investmentDetails.totalFundingNeeded) * 100
      )
    );
  }
  this.updatedAt = Date.now();
  next();
});

export const Property = mongoose.model('Property', propertySchema);