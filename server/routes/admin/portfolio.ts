import express from 'express';
import { ensureAdmin } from '../../auth-jwt';
import { validate } from '../../middleware/validate';
import { z } from 'zod';
import { 
  getPortfolioInvestments,
  getPortfolioPerformance,
  getInvestmentDetails,
  updateInvestmentStatus,
  getPortfolioSummary
} from '../../controllers/admin/portfolio';

const router = express.Router();

// Validation schemas
const updateInvestmentStatusSchema = z.object({
  status: z.enum(['active', 'matured', 'withdrawn', 'defaulted', 'completed', 'cancelled']).optional(),
  actualROI: z.number().min(0).max(100).optional()
});

// Get all investments with filtering for portfolio management
router.get('/', ensureAdmin, getPortfolioInvestments);

// Get portfolio performance metrics for visualization
router.get('/performance', ensureAdmin, getPortfolioPerformance);

// Get portfolio summary statistics
router.get('/summary', ensureAdmin, getPortfolioSummary);

// Get a specific investment by ID with detailed information
router.get('/investment/:id', ensureAdmin, getInvestmentDetails);

// Update investment status
router.patch(
  '/investment/:id/status',
  ensureAdmin,
  validate(updateInvestmentStatusSchema),
  updateInvestmentStatus
);

export default router;