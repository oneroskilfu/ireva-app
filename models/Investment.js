const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentReference: String,
  investmentDate: {
    type: Date,
    default: Date.now
  },
  maturityDate: Date,
  currentValue: {
    type: Number,
    default: function() {
      return this.amount;
    }
  },
  earnings: {
    type: Number,
    default: 0
  },
  transactions: [{
    type: {
      type: String,
      enum: ['deposit', 'withdrawal', 'earnings', 'fee']
    },
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  documents: [{
    title: String,
    url: String
  }]
});

module.exports = mongoose.model('Investment', investmentSchema);