import express from 'express';
import jwt from 'jsonwebtoken';
import { Property } from '../models/Property.js';

const router = express.Router();

// Middleware to authenticate JWT token
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'developer') {
    return res.status(403).json({ msg: 'Access denied. Admin or developer only.' });
  }
  next();
};

// @route   GET /api/properties
// @desc    Get all properties
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Query parameters
    const { type, location, minPrice, maxPrice, riskRating, status } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (type) filter.type = type;
    if (location && location !== 'All') filter['location.city'] = location;
    if (riskRating) filter.riskRating = riskRating;
    if (status) filter.status = status;
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    const properties = await Property.find(filter).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    res.json(property);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/properties
// @desc    Create a property
// @access  Admin or developer
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      location,
      price,
      images,
      mainImage,
      amenities,
      size,
      numberOfUnits,
      investmentDetails,
      riskRating,
      documents,
      projectId
    } = req.body;

    const newProperty = new Property({
      name,
      description,
      type,
      location,
      price,
      images,
      mainImage,
      amenities,
      size,
      numberOfUnits,
      investmentDetails,
      riskRating,
      documents,
      projectId,
      createdBy: req.user.id
    });

    const property = await newProperty.save();
    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/properties/:id
// @desc    Update a property
// @access  Admin or developer
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    // Update fields
    const updateFields = req.body;
    
    // Update property with new fields
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    res.json(updatedProperty);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete a property
// @access  Admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only admin can delete properties
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    await property.remove();
    
    res.json({ msg: 'Property removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/properties/project/:projectId
// @desc    Get properties by project ID
// @access  Public
router.get('/project/:projectId', async (req, res) => {
  try {
    const properties = await Property.find({ projectId: req.params.projectId });
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/properties/:id/funding
// @desc    Update property funding progress
// @access  Admin only
router.put('/:id/funding', auth, async (req, res) => {
  try {
    // Only admin can update funding
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    
    const { amountRaised } = req.body;
    
    if (amountRaised === undefined) {
      return res.status(400).json({ msg: 'Amount raised is required' });
    }
    
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    property.investmentDetails.amountRaised = amountRaised;
    
    // Calculate funding progress
    property.investmentDetails.fundingProgress = Math.min(
      100,
      Math.round(
        (property.investmentDetails.amountRaised / property.investmentDetails.totalFundingNeeded) * 100
      )
    );
    
    // Update status if fully funded
    if (property.investmentDetails.fundingProgress >= 100) {
      property.status = 'Fully Funded';
    }
    
    await property.save();
    
    res.json(property);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Property not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

export default router;