import express from 'express';
import * as authJwt from '../auth-jwt';
import { validateRequest } from '../middleware/validate';

const { verifyToken: ensureAuthenticated, ensureAdmin } = authJwt;
import { z } from 'zod';
import { 
  createListing,
  getActiveListings,
  getListingDetails,
  updateListingStatus,
  placeBid,
  acceptBid,
  rejectBid,
  getUserActivity
} from '../controllers/secondaryMarket';

const router = express.Router();

// Validation schemas
const listingIdParam = z.object({
  id: z.string().uuid()
});

const bidIdParam = z.object({
  bidId: z.string().uuid()
});

const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'active', 'cancelled', 'expired']),
  adminNotes: z.string().optional()
});

const rejectBidSchema = z.object({
  reason: z.string().optional()
});

// Create a new secondary market listing
router.post('/listings', 
  ensureAuthenticated, 
  createListing
);

// Get all active secondary market listings
router.get('/listings', 
  ensureAuthenticated, 
  getActiveListings
);

// Get a specific listing with its details
router.get('/listings/:id', 
  ensureAuthenticated, 
  validateRequest({ params: listingIdParam }), 
  getListingDetails
);

// Update listing status (cancel by owner, approve by admin)
router.patch('/listings/:id/status', 
  ensureAuthenticated, 
  validateRequest({ params: listingIdParam, body: statusUpdateSchema }), 
  updateListingStatus
);

// Place a bid on a secondary market listing
router.post('/bids', 
  ensureAuthenticated, 
  placeBid
);

// Accept a bid (seller)
router.post('/bids/:bidId/accept', 
  ensureAuthenticated, 
  validateRequest({ params: bidIdParam }), 
  acceptBid
);

// Reject a bid (seller)
router.post('/bids/:bidId/reject', 
  ensureAuthenticated, 
  validateRequest({ params: bidIdParam, body: rejectBidSchema }), 
  rejectBid
);

// Get user's listings and bids (personal activity)
router.get('/user/activity', 
  ensureAuthenticated, 
  getUserActivity
);

export default router;