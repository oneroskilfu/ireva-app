const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * ROI Distribution Schema
 * Stores records of ROI distributions made to investors
 */
const roiDistributionSchema = new Schema({
  // The project for which ROI is being distributed
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  // The investor receiving the ROI
  investorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The specific investment for which ROI is distributed
  investmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Investment',
    required: true
  },
  
  // The amount of ROI distributed
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // When the distribution was made
  distributionDate: {
    type: Date,
    default: Date.now
  },
  
  // Status of the distribution (Pending, Completed, Failed)
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  
  // Any notes or description about this distribution
  notes: {
    type: String
  },
  
  // Distribution period (e.g., "May 2023", "Q2 2023")
  distributionPeriod: {
    type: String
  },
  
  // The ROI percentage rate for this distribution
  roiPercentage: {
    type: Number,
    min: 0
  },
  
  // Reference ID for the transaction record
  transactionReference: {
    type: String
  }
}, { timestamps: true });

// Add indexes for common queries
roiDistributionSchema.index({ projectId: 1 });
roiDistributionSchema.index({ investorId: 1 });
roiDistributionSchema.index({ distributionDate: -1 });
roiDistributionSchema.index({ status: 1 });

// Create a compound index for querying distributions by project and status
roiDistributionSchema.index({ projectId: 1, status: 1 });

// Create a compound index for querying distributions by investor and period
roiDistributionSchema.index({ investorId: 1, distributionPeriod: 1 });

module.exports = mongoose.model('RoiDistribution', roiDistributionSchema);