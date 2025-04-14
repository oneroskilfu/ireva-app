const mongoose = require('mongoose');

// Calculate funding percentage based on current and total funding
const calculateFundingPercentage = (currentFunding, totalFunding) => {
  if (totalFunding <= 0) return 0;
  const percentage = (currentFunding / totalFunding) * 100;
  return Math.min(Math.round(percentage * 100) / 100, 100); // Round to 2 decimal places, max 100%
};

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    trim: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  developer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Developer',
    required: true
  },
  totalFunding: {
    type: Number,
    required: true
  },
  currentFunding: {
    type: Number,
    default: 0
  },
  targetReturn: {
    type: Number,
    required: true
  },
  actualReturn: {
    type: Number,
    default: 0
  },
  term: {
    type: Number,
    required: true
  }, // in months
  minInvestment: {
    type: Number,
    required: true,
    default: 100000 // Default minimum investment in Naira (₦)
  },
  maxInvestment: {
    type: Number
  },
  riskRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  location: {
    type: String,
    enum: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Other'],
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'funding', 'construction', 'completed', 'cancelled'],
    default: 'planning'
  },
  projectType: {
    type: String,
    enum: ['Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Land'],
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  fundingDeadline: {
    type: Date
  },
  startDate: Date,
  estimatedCompletionDate: Date,
  actualCompletionDate: Date,
  investorCount: {
    type: Number,
    default: 0
  },
  fundingPercentage: {
    type: Number,
    default: 0
  },
  images: [String],
  coverImage: String,
  documents: [{
    title: String,
    description: String,
    fileType: {
      type: String,
      enum: ['pdf', 'doc', 'image', 'other']
    },
    url: String,
    isPublic: {
      type: Boolean,
      default: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  updates: [{
    title: String,
    content: String,
    date: {
      type: Date,
      default: Date.now
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  faqs: [{
    question: String,
    answer: String
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

// Pre-save middleware to update fundingPercentage and updatedAt
projectSchema.pre('save', function(next) {
  // Update the funding percentage
  this.fundingPercentage = calculateFundingPercentage(this.currentFunding, this.totalFunding);
  
  // Update the updatedAt timestamp
  this.updatedAt = new Date();
  
  // Auto-change status to 'funding' if it's in planning and has some funding
  if (this.status === 'planning' && this.currentFunding > 0) {
    this.status = 'funding';
  }
  
  // Auto-change status to 'completed' if 100% funded and past estimated completion date
  if (this.fundingPercentage === 100 && 
      this.estimatedCompletionDate && 
      new Date() > this.estimatedCompletionDate &&
      this.status !== 'completed') {
    this.status = 'completed';
    this.actualCompletionDate = new Date();
  }
  
  next();
});

// Virtual for funding progress
projectSchema.virtual('fundingProgress').get(function() {
  return {
    current: this.currentFunding,
    total: this.totalFunding,
    percentage: this.fundingPercentage,
    remaining: Math.max(0, this.totalFunding - this.currentFunding)
  };
});

// Virtual for time remaining calculation
projectSchema.virtual('timeRemaining').get(function() {
  if (!this.fundingDeadline) return null;
  
  const now = new Date();
  const deadline = new Date(this.fundingDeadline);
  
  if (now > deadline) return 0;
  
  const diffTime = Math.abs(deadline - now);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Enable virtuals in JSON
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);