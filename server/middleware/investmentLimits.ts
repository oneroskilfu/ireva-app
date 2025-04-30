import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, properties, accreditationLevelEnum, investmentTierEnum } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Investment tier limits in USD
const INVESTMENT_LIMITS = {
  non_accredited: {
    starter: 2500,
    growth: 10000,
    premium: 25000,
    elite: 0 // Not allowed
  },
  accredited: {
    starter: 25000,
    growth: 100000,
    premium: 250000,
    elite: 500000
  },
  qualified_purchaser: {
    starter: 100000, 
    growth: 500000,
    premium: 1000000,
    elite: Infinity // No limit
  }
};

// Middleware to check investment limits based on user accreditation and investment tier
export const investmentLimitCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Return early if not authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const { amount, propertyId } = req.body;
    
    if (!amount || !propertyId) {
      return res.status(400).json({ error: 'Missing required fields: amount and propertyId' });
    }

    // Get investor details
    const [investor] = await db
      .select({
        accreditationLevel: users.accreditationLevel,
        kycStatus: users.kycStatus,
        kycTier: users.kycTier
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // If KYC is not approved, don't allow investments
    if (investor.kycStatus !== 'approved') {
      return res.status(403).json({ 
        error: 'KYC approval required',
        details: 'You must complete KYC verification before investing'
      });
    }

    // Get property details to check the investment tier
    const [property] = await db
      .select({
        tier: properties.tier,
        minimumInvestment: properties.minimumInvestment,
        accreditedOnly: properties.accreditedOnly
      })
      .from(properties)
      .where(eq(properties.id, propertyId));

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if property requires accreditation
    if (property.accreditedOnly && investor.accreditationLevel === 'non_accredited') {
      return res.status(403).json({ 
        error: 'Accreditation required',
        details: 'This investment opportunity is only available to accredited investors'
      });
    }

    // Check minimum investment
    if (amount < property.minimumInvestment) {
      return res.status(400).json({ 
        error: 'Minimum investment not met',
        details: `Minimum investment for this property is $${property.minimumInvestment}`
      });
    }

    // Determine investment tier and accreditation level for limit check
    const accredLevel = investor.accreditationLevel || 'non_accredited';
    const investmentTier = property.tier || 'starter';
    
    // Get the limit based on investor accreditation and property tier
    const limit = INVESTMENT_LIMITS[accredLevel][investmentTier];
    
    // If no limit found or amount exceeds limit
    if (limit === undefined || amount > limit) {
      return res.status(403).json({
        error: 'Investment limit exceeded',
        details: `Your investment limit for ${investmentTier} tier properties is $${limit}`,
        tier: investmentTier,
        accreditationLevel: accredLevel
      });
    }

    // Investment is within limits, proceed to next middleware
    next();
  } catch (error) {
    console.error('Error in investment limit check:', error);
    res.status(500).json({ error: 'Internal server error during investment limit check' });
  }
};

// Add KYC tier check middleware
export const kycTierCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const { propertyId } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ error: 'Missing required field: propertyId' });
    }

    // Get investor KYC tier
    const [investor] = await db
      .select({
        kycTier: users.kycTier
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // Get property details to check the required KYC tier
    const [property] = await db
      .select({
        requiredKycTier: properties.requiredKycTier
      })
      .from(properties)
      .where(eq(properties.id, propertyId));

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // If property has no specific KYC tier requirement or user meets it
    if (!property.requiredKycTier || 
        property.requiredKycTier === 'basic' || 
        investor.kycTier === property.requiredKycTier ||
        (property.requiredKycTier === 'enhanced' && investor.kycTier === 'institutional') ||
        investor.kycTier === 'institutional') {
      next();
    } else {
      return res.status(403).json({
        error: 'KYC tier requirement not met',
        details: `This investment requires ${property.requiredKycTier} KYC verification`,
        currentTier: investor.kycTier,
        requiredTier: property.requiredKycTier
      });
    }
  } catch (error) {
    console.error('Error in KYC tier check:', error);
    res.status(500).json({ error: 'Internal server error during KYC tier check' });
  }
};