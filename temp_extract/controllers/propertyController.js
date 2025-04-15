const Property = require('../models/Property');

exports.getAllProperties = async (req, res) => {
  const properties = await Property.find();
  res.json(properties);
};

exports.createProperty = async (req, res) => {
  const property = new Property(req.body);
  await property.save();
  res.status(201).json(property);
};

exports.updateProperty = async (req, res) => {
  const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

exports.deleteProperty = async (req, res) => {
  await Property.findByIdAndDelete(req.params.id);
  res.json({ message: 'Property deleted' });
};
