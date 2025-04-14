const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['residential', 'commercial', 'industrial', 'mixed-use', 'land'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  size: String,
  description: String,
  imageUrl: String,
  features: [String],
  targetReturn: Number,
  riskRating: {
    type: String,
    enum: ['Low', 'Medium', 'High']
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'under contract'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Property', propertySchema);