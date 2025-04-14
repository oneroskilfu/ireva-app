const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');

// GET all properties
router.get('/', propertyController.getProperties);

// GET property by ID
router.get('/:id', propertyController.getPropertyById);

// POST create new property
router.post('/', propertyController.createProperty);

// PUT update property
router.put('/:id', propertyController.updateProperty);

// DELETE property
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;