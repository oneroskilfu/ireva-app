import express from 'express';
import * as authJwt from '../auth-jwt';
import { validateRequest } from '../middleware/validate';

const { verifyToken: ensureAuthenticated, ensureAdmin } = authJwt;
import { z } from 'zod';
import { 
  addPropertyValuation, 
  getPropertyValuations, 
  getValuationHistory, 
  deletePropertyValuation,
  getLatestValuations
} from '../controllers/valuations';

const router = express.Router();

// Validation schemas
const propertyIdParam = z.object({
  propertyId: z.string().uuid()
});

const valuationIdParam = z.object({
  id: z.string().uuid()
});

// Add a new property valuation (admin only)
router.post('/', 
  ensureAuthenticated, 
  ensureAdmin, 
  addPropertyValuation
);

// Get all valuations for a property
router.get('/property/:propertyId', 
  ensureAuthenticated, 
  validateRequest({ params: propertyIdParam }), 
  getPropertyValuations
);

// Get property valuation history with trend analysis
router.get('/history/:propertyId', 
  ensureAuthenticated, 
  validateRequest({ params: propertyIdParam }), 
  getValuationHistory
);

// Delete a property valuation (admin only)
router.delete('/:id', 
  ensureAuthenticated, 
  ensureAdmin, 
  validateRequest({ params: valuationIdParam }), 
  deletePropertyValuation
);

// Get latest valuation for each property (dashboard overview)
router.get('/latest', 
  ensureAuthenticated, 
  getLatestValuations
);

export default router;