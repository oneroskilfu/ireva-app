import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import investorRoiController from '../controllers/investorRoiController';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get ROI summary statistics for an investor
router.get('/stats', investorRoiController.getRoiStats);

// Get ROI chart data for an investor
router.get('/chart', investorRoiController.getRoiChartData);

// Get ROI transactions for an investor
router.get('/transactions', investorRoiController.getRoiTransactions);

// Get investment performance metrics
router.get('/performance', investorRoiController.getInvestmentPerformance);

export default router;