const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ROISchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  roi: {
    type: Number,
    required: true,
    comment: 'Return on Investment percentage'
  },
  projectedRoi: {
    type: Number,
    default: null,
    comment: 'Projected ROI percentage'
  },
  investment: {
    type: Number,
    default: null,
    comment: 'Investment amount for the period'
  },
  returns: {
    type: Number,
    default: null,
    comment: 'Returns amount for the period'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
ROISchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ROI', ROISchema);