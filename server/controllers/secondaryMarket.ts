import { Request, Response } from 'express';
import { db } from '../db';
import { investments, secondaryListings, secondaryBids, users } from '@shared/schema';
import { eq, and, gte, lte, ne } from 'drizzle-orm';
import { 
  insertSecondaryListingSchema, 
  insertSecondaryBidSchema 
} from '@shared/schema';
import { broadcastToAll, broadcastToUser } from '../socketio';

/**
 * Create a new secondary market listing
 */
export const createListing = async (req: Request, res: Response) => {
  try {
    const validatedData = insertSecondaryListingSchema.parse(req.body);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify the investment exists and belongs to the user
    const investment = await db.query.investments.findFirst({
      where: and(
        eq(investments.id, validatedData.investmentId),
        eq(investments.userId, userId)
      ),
    });
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found or does not belong to you' });
    }
    
    // Check if there's already an active listing for this investment
    const existingListing = await db.query.secondaryListings.findFirst({
      where: and(
        eq(secondaryListings.investmentId, validatedData.investmentId),
        ne(secondaryListings.status, 'expired'),
        ne(secondaryListings.status, 'sold'),
        ne(secondaryListings.status, 'cancelled')
      ),
    });
    
    if (existingListing) {
      return res.status(400).json({ 
        message: 'This investment already has an active secondary market listing' 
      });
    }
    
    // Calculate default expiration date (30 days from now)
    const expiresAt = validatedData.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Create the listing
    const [listing] = await db.insert(secondaryListings).values({
      ...validatedData,
      createdBy: userId,
      expiresAt
    }).returning();
    
    // Notify interested users via WebSocket
    broadcastToAll({
      type: 'secondaryMarket:newListing',
      listingId: listing.id,
      investmentId: listing.investmentId,
      askingPrice: listing.askingPrice
    });
    
    return res.status(201).json(listing);
  } catch (error: any) {
    console.error('Error creating secondary market listing:', error);
    return res.status(400).json({ 
      message: 'Failed to create secondary market listing', 
      error: error.message 
    });
  }
};

/**
 * Get all active secondary market listings
 */
export const getActiveListings = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    
    // Get all active listings that haven't expired
    const listings = await db.query.secondaryListings.findMany({
      where: and(
        eq(secondaryListings.status, 'active'),
        gte(secondaryListings.expiresAt, currentDate)
      ),
      with: {
        investment: {
          with: {
            property: {
              columns: {
                id: true,
                name: true,
                location: true,
                type: true,
                imageUrl: true,
              }
            }
          }
        },
        createdByUser: {
          columns: {
            id: true,
            username: true,
          }
        }
      },
      orderBy: (listings, { asc }) => [asc(listings.createdAt)],
    });
    
    return res.status(200).json(listings);
  } catch (error: any) {
    console.error('Error retrieving secondary market listings:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve secondary market listings', 
      error: error.message 
    });
  }
};

/**
 * Get a specific listing with its details
 */
export const getListingDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const listing = await db.query.secondaryListings.findFirst({
      where: eq(secondaryListings.id, id),
      with: {
        investment: {
          with: {
            property: true,
            user: {
              columns: {
                id: true,
                username: true,
                email: true,
              }
            }
          }
        },
        createdByUser: {
          columns: {
            id: true,
            username: true,
          }
        },
        soldToUser: {
          columns: {
            id: true,
            username: true,
          }
        }
      }
    });
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Get bids for this listing if requested
    const includeBids = req.query.includeBids === 'true';
    let bids = [];
    
    if (includeBids) {
      bids = await db.query.secondaryBids.findMany({
        where: eq(secondaryBids.listingId, id),
        with: {
          bidder: {
            columns: {
              id: true,
              username: true,
            }
          }
        },
        orderBy: (bids, { desc }) => [desc(bids.bidPrice)],
      });
    }
    
    return res.status(200).json({
      listing,
      bids: includeBids ? bids : undefined
    });
  } catch (error: any) {
    console.error('Error retrieving listing details:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve listing details', 
      error: error.message 
    });
  }
};

/**
 * Update listing status (cancel, approve by admin)
 */
export const updateListingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const userId = req.user?.id;
    
    // Find the listing
    const listing = await db.query.secondaryListings.findFirst({
      where: eq(secondaryListings.id, id),
    });
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // For cancellation, check if the user is the owner
    if (status === 'cancelled' && listing.createdBy !== userId) {
      return res.status(403).json({ 
        message: 'You are not authorized to cancel this listing' 
      });
    }
    
    // For admin approval, check if user is admin (this is handled by middleware)
    const updates: any = { status };
    
    if (status === 'active' && req.user?.role === 'admin') {
      updates.adminApproved = true;
      updates.adminApprovedBy = userId;
      updates.adminApprovedAt = new Date();
    }
    
    // Update the listing
    const [updatedListing] = await db.update(secondaryListings)
      .set(updates)
      .where(eq(secondaryListings.id, id))
      .returning();
    
    // Notify via WebSocket
    // Notify the listing owner
    broadcastToUser(listing.createdBy.toString(), {
      type: 'secondaryMarket:statusUpdate',
      listingId: listing.id,
      status: updatedListing.status
    });
    
    // If approved, broadcast to all users
    if (status === 'active') {
      broadcastToAll({
        type: 'secondaryMarket:newActiveListing',
        listingId: listing.id,
        investmentId: listing.investmentId
      });
    }
    
    return res.status(200).json(updatedListing);
  } catch (error: any) {
    console.error('Error updating listing status:', error);
    return res.status(500).json({ 
      message: 'Failed to update listing status', 
      error: error.message 
    });
  }
};

/**
 * Place a bid on a secondary market listing
 */
export const placeBid = async (req: Request, res: Response) => {
  try {
    const validatedData = insertSecondaryBidSchema.parse(req.body);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Verify the listing exists and is active
    const listing = await db.query.secondaryListings.findFirst({
      where: and(
        eq(secondaryListings.id, validatedData.listingId),
        eq(secondaryListings.status, 'active'),
        gte(secondaryListings.expiresAt, new Date())
      ),
    });
    
    if (!listing) {
      return res.status(404).json({ 
        message: 'Listing not found, inactive, or expired' 
      });
    }
    
    // Prevent the listing owner from bidding on their own listing
    if (listing.createdBy === userId) {
      return res.status(400).json({ 
        message: 'You cannot bid on your own listing' 
      });
    }
    
    // Verify bid amount is valid
    if (parseFloat(String(validatedData.bidPrice)) < parseFloat(String(listing.minPrice || listing.askingPrice))) {
      return res.status(400).json({ 
        message: `Bid price must be at least ${listing.minPrice || listing.askingPrice}` 
      });
    }
    
    // Create the bid
    const [bid] = await db.insert(secondaryBids).values({
      ...validatedData,
      bidderId: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Bid valid for 7 days
    }).returning();
    
    // Notify the listing owner via WebSocket
    broadcastToUser(listing.createdBy.toString(), {
      type: 'secondaryMarket:newBid',
      listingId: listing.id,
      bidId: bid.id,
      bidAmount: bid.bidPrice
    });
    
    return res.status(201).json(bid);
  } catch (error: any) {
    console.error('Error placing bid:', error);
    return res.status(400).json({ 
      message: 'Failed to place bid', 
      error: error.message 
    });
  }
};

/**
 * Accept a bid (seller)
 */
export const acceptBid = async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Find the bid
    const bid = await db.query.secondaryBids.findFirst({
      where: eq(secondaryBids.id, bidId),
      with: {
        listing: true
      }
    });
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }
    
    // Verify the user is the listing owner
    if (bid.listing.createdBy !== userId) {
      return res.status(403).json({ 
        message: 'You are not authorized to accept this bid' 
      });
    }
    
    // Verify the listing is still active
    if (bid.listing.status !== 'active') {
      return res.status(400).json({ 
        message: 'This listing is no longer active' 
      });
    }
    
    // Update the bid status
    await db.update(secondaryBids)
      .set({ status: 'accepted', responseAt: new Date() })
      .where(eq(secondaryBids.id, bidId));
    
    // Update the listing as sold
    await db.update(secondaryListings)
      .set({
        status: 'sold',
        soldAt: new Date(),
        soldTo: bid.bidderId,
        soldPrice: bid.bidPrice
      })
      .where(eq(secondaryListings.id, bid.listingId));
    
    // Reject all other bids for this listing
    await db.update(secondaryBids)
      .set({ status: 'rejected', responseAt: new Date() })
      .where(and(
        eq(secondaryBids.listingId, bid.listingId),
        ne(secondaryBids.id, bidId)
      ));
    
    // TODO: Transfer the investment to the new owner
    // This would involve updating the investment record and creating transaction records
    
    // Notify the bidder via WebSocket
    broadcastToUser(bid.bidderId.toString(), {
      type: 'secondaryMarket:bidAccepted',
      listingId: bid.listingId,
      bidId: bid.id
    });
    
    return res.status(200).json({ 
      message: 'Bid accepted successfully',
      bidId: bid.id,
      listingId: bid.listingId
    });
  } catch (error: any) {
    console.error('Error accepting bid:', error);
    return res.status(500).json({ 
      message: 'Failed to accept bid', 
      error: error.message 
    });
  }
};

/**
 * Reject a bid (seller)
 */
export const rejectBid = async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Find the bid
    const bid = await db.query.secondaryBids.findFirst({
      where: eq(secondaryBids.id, bidId),
      with: {
        listing: true
      }
    });
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }
    
    // Verify the user is the listing owner
    if (bid.listing.createdBy !== userId) {
      return res.status(403).json({ 
        message: 'You are not authorized to reject this bid' 
      });
    }
    
    // Update the bid
    await db.update(secondaryBids)
      .set({ 
        status: 'rejected', 
        responseAt: new Date(),
        notes: reason || 'Rejected by seller'
      })
      .where(eq(secondaryBids.id, bidId));
    
    // Notify the bidder via WebSocket
    broadcastToUser(bid.bidderId.toString(), {
      type: 'secondaryMarket:bidRejected',
      listingId: bid.listingId,
      bidId: bid.id,
      reason
    });
    
    return res.status(200).json({ 
      message: 'Bid rejected successfully',
      bidId: bid.id
    });
  } catch (error: any) {
    console.error('Error rejecting bid:', error);
    return res.status(500).json({ 
      message: 'Failed to reject bid', 
      error: error.message 
    });
  }
};

/**
 * Get user's listings and bids 
 */
export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get user's listings
    const listings = await db.query.secondaryListings.findMany({
      where: eq(secondaryListings.createdBy, userId),
      with: {
        investment: {
          with: {
            property: {
              columns: {
                id: true,
                name: true,
                type: true,
                imageUrl: true,
              }
            }
          }
        }
      },
      orderBy: (listings, { desc }) => [desc(listings.createdAt)],
    });
    
    // Get user's bids
    const bids = await db.query.secondaryBids.findMany({
      where: eq(secondaryBids.bidderId, userId),
      with: {
        listing: {
          with: {
            investment: {
              with: {
                property: {
                  columns: {
                    id: true,
                    name: true,
                    type: true,
                    imageUrl: true,
                  }
                }
              }
            }
          }
        }
      },
      orderBy: (bids, { desc }) => [desc(bids.createdAt)],
    });
    
    return res.status(200).json({
      listings,
      bids
    });
  } catch (error: any) {
    console.error('Error retrieving user activity:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve user activity', 
      error: error.message 
    });
  }
};