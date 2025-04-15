const mongoose = require('mongoose');
const propertySchema = new mongoose.Schema({
  title: String,
  location: String,
  size: String,
  price: Number,
  description: String,
  status: String,
  developerId: String,
  images: [String],
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Property', propertySchema);
