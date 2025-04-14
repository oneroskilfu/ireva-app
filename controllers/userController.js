const User = require('../models/User');
const Investment = require('../models/Investment');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserInvestments = async (req, res) => {
  try {
    const userId = req.params.id;
    const investments = await Investment.find({ user: userId })
      .populate('project', 'name targetReturn')
      .populate({
        path: 'project',
        populate: {
          path: 'property',
          select: 'name location type'
        }
      });
    
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserKYCStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('isKYCApproved');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ isKYCApproved: user.isKYCApproved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserKYCStatus = async (req, res) => {
  try {
    const { isKYCApproved } = req.body;
    
    if (isKYCApproved === undefined) {
      return res.status(400).json({ message: 'isKYCApproved field is required' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isKYCApproved },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'KYC status updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};