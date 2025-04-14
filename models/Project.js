const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
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
  term: {
    type: Number,
    required: true
  }, // in months
  minInvestment: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'funding', 'construction', 'completed'],
    default: 'planning'
  },
  startDate: Date,
  estimatedCompletionDate: Date,
  images: [String],
  documents: [{
    title: String,
    url: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', projectSchema);