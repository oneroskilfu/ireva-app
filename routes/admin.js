const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.post('/login', adminController.loginAdmin);

// Protected routes (require admin authentication)
router.get('/dashboard', protect, admin, adminController.getDashboardData);

module.exports = router;