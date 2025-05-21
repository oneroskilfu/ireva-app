const express = require('express');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const investorRoutes = require('./investor');
const notificationsRoutes = require('./notifications');
const insightsRoutes = require('./insights');
const { verifyToken } = require('../middleware/authMiddleware');
const propertyController = require('../controllers/propertyController');

const router = express.Router();

// Auth routes
router.use('/auth', authRoutes);

// Admin routes
router.use('/admin', adminRoutes);

// Investor routes
router.use('/investor', investorRoutes);

// Notification system routes
router.use('/', notificationsRoutes);

// Insights and reporting dashboard routes
router.use('/', insightsRoutes);

// Property routes (accessible to all users)
router.get('/properties', propertyController.getAllProperties);
router.get('/properties/:id', propertyController.getPropertyById);

// Protected property routes (accessible to admins only)
router.post('/properties', verifyToken, propertyController.createProperty);
router.put('/properties/:id', verifyToken, propertyController.updateProperty);
router.delete('/properties/:id', verifyToken, propertyController.deleteProperty);

// Catch-all route for API 404
router.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

module.exports = router;