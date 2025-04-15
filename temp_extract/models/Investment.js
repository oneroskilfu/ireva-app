const mongoose = require('mongoose');
const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  amount: Number,
  investmentDate: Date,
  roiPercentage: Number,
  payoutDate: Date,
  status: String
});
module.exports = mongoose.model('Investment', investmentSchema);
