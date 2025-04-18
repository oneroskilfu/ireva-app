const mongoose = require('mongoose');

const roiDistributionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  investorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  distributionDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  }
});

module.exports = mongoose.model('RoiDistribution', roiDistributionSchema);