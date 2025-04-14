const mongoose = require('mongoose');

const propertySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a property name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    location: {
      type: String,
      required: [true, 'Please add a location']
    },
    type: {
      type: String,
      required: [true, 'Please add a property type'],
      enum: ['Residential', 'Commercial', 'Industrial', 'Land', 'Mixed-Use']
    },
    price: {
      type: Number,
      required: [true, 'Please add a price']
    },
    size: {
      type: Number,
      required: [true, 'Please add size in square meters']
    },
    roi: {
      type: Number,
      required: [true, 'Please add expected ROI percentage']
    },
    minimumInvestment: {
      type: Number,
      required: [true, 'Please add minimum investment amount'],
      default: 100000
    },
    developer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Developer',
      required: true
    },
    images: [String],
    amenities: [String],
    status: {
      type: String,
      enum: ['Available', 'Fully Funded', 'Under Construction', 'Completed'],
      default: 'Available'
    },
    fundingProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    },
    term: {
      type: Number,
      required: [true, 'Please add investment term in years']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    documents: [
      {
        title: String,
        file: String,
        type: {
          type: String,
          enum: ['Deed', 'Certificate', 'Survey', 'Permit', 'Other']
        }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for investments
propertySchema.virtual('investments', {
  ref: 'Investment',
  localField: '_id',
  foreignField: 'property',
  justOne: false
});

// Cascade delete investments when a property is deleted
propertySchema.pre('remove', async function(next) {
  await this.model('Investment').deleteMany({ property: this._id });
  next();
});

module.exports = mongoose.model('Property', propertySchema);