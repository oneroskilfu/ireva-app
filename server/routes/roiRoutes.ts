import express from 'express';
import * as roiController from '../controllers/roiController';
import { verifyToken } from '../auth-jwt';

const router = express.Router();

// All routes are protected by authentication
router.use(verifyToken);

// Calculate ROI for a specific property investment
router.post('/property', roiController.calculatePropertyROI);

// Calculate ROI for user's entire portfolio
router.get('/portfolio', roiController.calculatePortfolioROI);

// Compare ROI between multiple properties
router.post('/compare', roiController.comparePropertyROI);

// Calculate ROI forecast with different scenarios
router.post('/forecast', roiController.calculateROIForecast);

export default router;