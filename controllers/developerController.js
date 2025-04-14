const Developer = require('../models/Developer');

exports.getDevelopers = async (req, res) => {
  try {
    const developers = await Developer.find();
    res.json(developers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDeveloper = async (req, res) => {
  try {
    const developer = new Developer(req.body);
    await developer.save();
    res.status(201).json(developer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};