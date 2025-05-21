/**
 * Property Routes
 * 
 * Defines API endpoints for property management and investment
 */

const express = require('express');
const propertyController = require('../controllers/property-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

// All property routes require authentication
router.use(authController.protect);

// Public property routes (for all authenticated users)
router.get('/', propertyController.getAllProperties);
router.get('/stats', propertyController.getPropertyStats);
router.get('/:id', propertyController.getProperty);
router.get('/:id/updates', propertyController.getPropertyUpdates);

// Admin-only routes
router.use(authController.restrictTo('admin'));
router.post('/', propertyController.createProperty);
router.patch('/:id', propertyController.updateProperty);
router.post('/:id/updates', propertyController.addPropertyUpdate);
router.delete('/:id', propertyController.deleteProperty);

module.exports = router;