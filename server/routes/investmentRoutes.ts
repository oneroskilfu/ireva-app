import express from 'express';
import * as investmentController from '../controllers/investmentController';
import { verifyToken } from '../auth-jwt';

const router = express.Router();

// All routes are protected by authentication
router.use(verifyToken);

// Get investments for current user
router.get('/', investmentController.getUserInvestments);

// Get specific investment by ID
router.get('/:id', investmentController.getInvestmentById);

// Create a new investment
router.post('/', investmentController.createInvestment);

// Admin routes
// Get all investments (admin only)
router.get('/admin/all', investmentController.getAllInvestments);

// Get investments by property (admin only)
router.get('/property/:propertyId', investmentController.getInvestmentsByProperty);

// Update investment status (admin only)
router.patch('/:id/status', investmentController.updateInvestmentStatus);

// Update investment returns (admin only)
router.patch('/:id/returns', investmentController.updateInvestmentReturns);

export default router;