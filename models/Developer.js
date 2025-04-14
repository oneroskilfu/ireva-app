const mongoose = require('mongoose');

const developerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  logoUrl: String,
  website: String,
  contactEmail: String,
  contactPhone: String,
  address: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  establishedYear: Number,
  completedProjects: Number,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Developer', developerSchema);