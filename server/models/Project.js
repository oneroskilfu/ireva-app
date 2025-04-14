const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide project name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide project description']
  },
  developer: {
    name: {
      type: String,
      required: [true, 'Please provide developer name']
    },
    description: String,
    logo: String,
    website: String,
    established: Number,
    completedProjects: Number,
    contactInfo: {
      email: String,
      phone: String,
      address: String
    }
  },
  location: {
    address: String,
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
  projectType: {
    type: String,
    required: [true, 'Please specify project type'],
    enum: ['Residential Development', 'Commercial Development', 'Mixed-Use Development', 'Land Development', 'Industrial Development']
  },
  timeline: {
    startDate: {
      type: Date,
      required: [true, 'Please provide project start date']
    },
    estimatedCompletion: {
      type: Date,
      required: [true, 'Please provide estimated completion date']
    },
    milestones: [
      {
        name: String,
        description: String,
        date: Date,
        completed: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  financials: {
    totalBudget: {
      type: Number,
      required: [true, 'Please provide total project budget']
    },
    fundingTarget: {
      type: Number,
      required: [true, 'Please provide funding target']
    },
    raisedAmount: {
      type: Number,
      default: 0
    },
    fundingProgress: {
      type: Number,
      default: 0
    },
    expectedROI: {
      type: Number,
      required: [true, 'Please provide expected ROI percentage']
    }
  },
  status: {
    type: String,
    enum: ['Planning', 'Funding', 'Under Construction', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Planning'
  },
  images: [String],
  mainImage: String,
  documents: [
    {
      title: String,
      url: String,
      type: {
        type: String,
        enum: ['Business Plan', 'Approval Document', 'Financial Projection', 'Legal Document', 'Other']
      }
    }
  ],
  properties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    }
  ],
  updates: [
    {
      title: String,
      content: String,
      date: {
        type: Date,
        default: Date.now
      },
      images: [String]
    }
  ],
  risks: [
    {
      category: {
        type: String,
        enum: ['Market', 'Construction', 'Regulatory', 'Financial', 'Environmental', 'Other']
      },
      description: String,
      mitigationStrategy: String,
      impact: {
        type: String,
        enum: ['Low', 'Medium', 'High']
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
projectSchema.pre('save', function(next) {
  if (this.financials.raisedAmount && this.financials.fundingTarget) {
    this.financials.fundingProgress = Math.min(
      100,
      Math.round(
        (this.financials.raisedAmount / this.financials.fundingTarget) * 100
      )
    );
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);