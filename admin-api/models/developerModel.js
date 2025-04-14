const mongoose = require('mongoose');

const developerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a developer name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number']
    },
    website: String,
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    logo: String,
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'Nigeria'
      }
    },
    regNumber: String,
    completedProjects: {
      type: Number,
      default: 0
    },
    establishedYear: Number,
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending'
    },
    portfolio: [
      {
        projectName: String,
        description: String,
        year: Number,
        location: String,
        images: [String]
      }
    ],
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for properties created by this developer
developerSchema.virtual('properties', {
  ref: 'Property',
  localField: '_id',
  foreignField: 'developer',
  justOne: false
});

module.exports = mongoose.model('Developer', developerSchema);