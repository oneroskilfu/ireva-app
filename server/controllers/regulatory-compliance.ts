import { Request, Response } from 'express';
import { db } from '../db';
import { 
  investorVerifications,
  investorFinancials,
  regulatoryLimits,
  complianceChecks,
  jurisdictionRestrictions,
  complianceExceptions,
  users,
  investments,
  accreditationLevelEnum,
  insertInvestorVerificationSchema,
  insertInvestorFinancialsSchema,
  insertComplianceCheckSchema,
  insertComplianceExceptionSchema
} from '@shared/schema';
import { eq, and, sql, desc, not, inArray, lt, gt, sum, count } from 'drizzle-orm';
import { getSocketIo } from '../socketio';
import { ZodError } from 'zod';

/**
 * Get investor financial information
 */
export const getInvestorFinancials = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check access permission - only allow users to view their own data unless admin
    if (userId !== req.user?.id && !['admin', 'super_admin'].includes(req.user?.role || '')) {
      return res.status(403).json({ message: 'You do not have permission to view this data' });
    }
    
    // Get financial information
    const financials = await db.query.investorFinancials.findFirst({
      where: eq(investorFinancials.userId, userId)
    });
    
    if (!financials) {
      return res.status(404).json({ message: 'Financial information not found' });
    }
    
    // Mask sensitive data for response if not admin
    const maskedFinancials = !['admin', 'super_admin'].includes(req.user?.role || '') 
      ? {
          ...financials,
          verificationDocuments: financials.verificationDocuments 
            ? 'Available, but not displayed for security' 
            : null
        }
      : financials;
    
    return res.status(200).json(maskedFinancials);
  } catch (error: any) {
    console.error('Error getting investor financials:', error);
    return res.status(500).json({ 
      message: 'Failed to get investor financials', 
      error: error.message 
    });
  }
};

/**
 * Update investor financial information
 */
export const updateInvestorFinancials = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check access permission - only allow users to update their own data unless admin
    if (userId !== req.user?.id && !['admin', 'super_admin'].includes(req.user?.role || '')) {
      return res.status(403).json({ message: 'You do not have permission to update this data' });
    }
    
    // Validate data
    const validatedData = insertInvestorFinancialsSchema.parse({
      ...req.body,
      userId
    });
    
    // Check if financial information already exists
    const existing = await db.query.investorFinancials.findFirst({
      where: eq(investorFinancials.userId, userId)
    });
    
    let result;
    
    if (existing) {
      // Update existing record
      const [updated] = await db.update(investorFinancials)
        .set({
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(investorFinancials.id, existing.id))
        .returning();
      
      result = updated;
    } else {
      // Create new record
      const [created] = await db.insert(investorFinancials)
        .values(validatedData)
        .returning();
      
      result = created;
    }
    
    // After updating financials, run accreditation verification
    await verifyAccreditedStatus(userId);
    
    return res.status(200).json(result);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Invalid data provided',
        errors: error.errors 
      });
    }
    
    console.error('Error updating investor financials:', error);
    return res.status(500).json({ 
      message: 'Failed to update investor financials', 
      error: error.message 
    });
  }
};

/**
 * Verify accredited investor status based on SEC Rule 501
 */
export async function verifyAccreditedStatus(userId: string) {
  try {
    // Get user financial information
    const financials = await db.query.investorFinancials.findFirst({
      where: eq(investorFinancials.userId, userId)
    });
    
    if (!financials) {
      console.log(`No financial information available for user ${userId}`);
      // If no financials are available, set as non_accredited to be safe
      await db.update(users)
        .set({ 
          accreditationLevel: 'non_accredited',
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      return false;
    }
    
    // Check SEC Rule 501 criteria
    // - Annual income > $200,000 individually or $300,000 jointly with spouse
    // - Net worth > $1,000,000 excluding primary residence
    const annualIncome = financials.annualIncome ? parseFloat(financials.annualIncome.toString()) : 0;
    const netWorth = financials.netWorth ? parseFloat(financials.netWorth.toString()) : 0;
    
    const isAccredited = annualIncome > 200000 || netWorth > 1000000;
    
    // Check qualified purchaser criteria (higher standard)
    // - Individual or family-owned investments > $5,000,000
    const isQualifiedPurchaser = netWorth > 5000000;
    
    // Update user accreditation level
    let accreditationLevel: 'non_accredited' | 'accredited' | 'qualified_purchaser' = 'non_accredited';
    
    if (isQualifiedPurchaser) {
      accreditationLevel = 'qualified_purchaser';
    } else if (isAccredited) {
      accreditationLevel = 'accredited';
    }
    
    // Update user record
    await db.update(users)
      .set({ 
        accreditationLevel,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // Create compliance check record
    await db.insert(complianceChecks)
      .values({
        userId,
        checkType: 'accreditation',
        status: isAccredited ? 'compliant' : 'non_compliant',
        checkData: {
          annualIncome,
          netWorth,
          criteria: {
            minIncome: 200000,
            minNetWorth: 1000000
          }
        },
        result: {
          accredited: isAccredited,
          qualifiedPurchaser: isQualifiedPurchaser,
          accreditationLevel
        },
        resultDetails: `User is ${accreditationLevel}. Annual income: $${annualIncome}, Net worth: $${netWorth}`,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry
      });
    
    return isAccredited;
  } catch (error) {
    console.error('Error verifying accredited status:', error);
    throw error;
  }
}

/**
 * Check investment compliance with regulatory limits
 */
export const checkInvestmentCompliance = async (req: Request, res: Response) => {
  try {
    const { userId, propertyId, amount } = req.body;
    
    if (!userId || !propertyId || !amount) {
      return res.status(400).json({ 
        message: 'userId, propertyId, and amount are required' 
      });
    }
    
    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user financials
    const financials = await db.query.investorFinancials.findFirst({
      where: eq(investorFinancials.userId, userId)
    });
    
    // Get applicable regulatory limits
    const userLocation = user.location && typeof user.location === 'object' 
      ? (user.location as any).country 
      : 'United States'; // Default to US regulations
      
    const limits = await db.query.regulatoryLimits.findMany({
      where: and(
        eq(regulatoryLimits.jurisdiction, userLocation),
        eq(regulatoryLimits.investorType, user.accreditationLevel || 'non_accredited')
      )
    });
    
    // Check for existing exceptions
    const exceptions = await db.query.complianceExceptions.findMany({
      where: and(
        eq(complianceExceptions.userId, userId),
        eq(complianceExceptions.status, 'active'),
        or(
          gt(complianceExceptions.expiresAt, new Date()),
          sql`${complianceExceptions.expiresAt} IS NULL`
        )
      )
    });
    
    const hasValidException = exceptions.length > 0;
    
    // Calculate total investments by user
    const [investmentTotals] = await db.select({
      total: sum(investments.amount)
    })
    .from(investments)
    .where(eq(investments.userId, userId));
    
    const currentTotalInvested = parseFloat((investmentTotals?.total || '0').toString());
    const proposedTotalInvested = currentTotalInvested + parseFloat(amount);
    
    // Check compliance against limits
    const complianceIssues = [];
    
    for (const limit of limits) {
      // Skip check if there's a valid exception
      if (hasValidException) continue;
      
      // Check absolute amount limit
      if (limit.maxInvestmentAmount) {
        const maxAmount = parseFloat(limit.maxInvestmentAmount.toString());
        if (parseFloat(amount) > maxAmount) {
          complianceIssues.push({
            type: 'max_single_investment',
            limit: maxAmount,
            actual: parseFloat(amount),
            message: `Maximum single investment amount of ${maxAmount} exceeded`
          });
        }
      }
      
      // Check percentage-based limits
      if (limit.maxInvestmentPercentage && financials) {
        const maxPercentage = parseFloat(limit.maxInvestmentPercentage.toString());
        let baseValue = 0;
        
        // Determine calculation base
        if (limit.baseCalculation === 'net_worth' && financials.netWorth) {
          baseValue = parseFloat(financials.netWorth.toString());
        } else if (limit.baseCalculation === 'annual_income' && financials.annualIncome) {
          baseValue = parseFloat(financials.annualIncome.toString());
        } else if (limit.baseCalculation === 'liquid_assets' && financials.liquidAssets) {
          baseValue = parseFloat(financials.liquidAssets.toString());
        }
        
        if (baseValue > 0) {
          const maxAllowedInvestment = baseValue * (maxPercentage / 100);
          
          // Check both single investment and total portfolio
          if (parseFloat(amount) > maxAllowedInvestment) {
            complianceIssues.push({
              type: 'max_percentage_single',
              limit: maxPercentage,
              baseValue,
              maxAmount: maxAllowedInvestment,
              actual: parseFloat(amount),
              message: `Investment exceeds ${maxPercentage}% of ${limit.baseCalculation} (${baseValue})`
            });
          }
          
          if (proposedTotalInvested > maxAllowedInvestment) {
            complianceIssues.push({
              type: 'max_percentage_total',
              limit: maxPercentage,
              baseValue,
              maxAmount: maxAllowedInvestment,
              actual: proposedTotalInvested,
              message: `Total portfolio would exceed ${maxPercentage}% of ${limit.baseCalculation} (${baseValue})`
            });
          }
        }
      }
    }
    
    // Check for geographic restrictions
    if (user.location && typeof user.location === 'object') {
      const userCountry = (user.location as any).country;
      const userState = (user.location as any).state;
      
      const restrictions = await db.query.jurisdictionRestrictions.findMany({
        where: and(
          eq(jurisdictionRestrictions.country, userCountry),
          or(
            sql`${jurisdictionRestrictions.state} IS NULL`,
            eq(jurisdictionRestrictions.state, userState || '')
          ),
          or(
            gt(jurisdictionRestrictions.expirationDate, new Date()),
            sql`${jurisdictionRestrictions.expirationDate} IS NULL`
          )
        )
      });
      
      for (const restriction of restrictions) {
        // Skip check if there's a valid exception
        if (hasValidException) continue;
        
        if (restriction.restrictionType === 'blocked') {
          complianceIssues.push({
            type: 'geographic_restriction',
            restriction: restriction.restrictionType,
            location: `${restriction.state || ''} ${restriction.country}`,
            reference: restriction.regulationReference,
            message: `Investments are blocked for users in this jurisdiction: ${restriction.details}`
          });
        }
        
        if (restriction.restrictionType === 'limited') {
          // Add to issues array so frontend can show warnings/additional requirements
          complianceIssues.push({
            type: 'geographic_limitation',
            restriction: restriction.restrictionType,
            location: `${restriction.state || ''} ${restriction.country}`,
            reference: restriction.regulationReference,
            warning: true,
            message: `Investment limitations apply to this jurisdiction: ${restriction.details}`
          });
        }
      }
    }
    
    // Store compliance check result
    const isCompliant = complianceIssues.length === 0 || hasValidException;
    
    const [complianceCheck] = await db.insert(complianceChecks)
      .values({
        userId,
        investmentId: null, // No investment yet, just a pre-check
        checkType: 'investment_limit',
        status: isCompliant ? 'compliant' : 'non_compliant',
        checkData: {
          propertyId,
          amount: parseFloat(amount),
          currentPortfolioValue: currentTotalInvested,
          userAccreditationLevel: user.accreditationLevel,
          userLocation: user.location
        },
        result: {
          compliant: isCompliant,
          hasException: hasValidException,
          issues: complianceIssues
        },
        resultDetails: isCompliant 
          ? 'Investment complies with all applicable regulatory limits' 
          : `Investment violates regulatory limits: ${complianceIssues.map(i => i.message).join('; ')}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hour expiry
      })
      .returning();
    
    return res.status(200).json({
      compliant: isCompliant,
      checkId: complianceCheck.id,
      hasException: hasValidException,
      issues: complianceIssues,
      user: {
        id: user.id,
        accreditationLevel: user.accreditationLevel,
        location: user.location
      }
    });
  } catch (error: any) {
    console.error('Error checking investment compliance:', error);
    return res.status(500).json({ 
      message: 'Failed to check investment compliance', 
      error: error.message 
    });
  }
};

/**
 * Add investor verification documents
 */
export const addInvestorVerification = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check access permission - only allow users to add their own verification unless admin
    if (userId !== req.user?.id && !['admin', 'super_admin'].includes(req.user?.role || '')) {
      return res.status(403).json({ message: 'You do not have permission to add verification for this user' });
    }
    
    // Validate data
    const validatedData = insertInvestorVerificationSchema.parse({
      ...req.body,
      userId,
      status: 'pending'
    });
    
    // Add verification record
    const [verification] = await db.insert(investorVerifications)
      .values(validatedData)
      .returning();
    
    // If admin is adding this, auto-verify
    if (['admin', 'super_admin'].includes(req.user?.role || '') && req.user?.id !== userId) {
      await db.update(investorVerifications)
        .set({
          status: 'verified',
          verifiedBy: req.user.id,
          verifiedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(investorVerifications.id, verification.id));
      
      // Get updated verification
      const [updatedVerification] = await db.select()
        .from(investorVerifications)
        .where(eq(investorVerifications.id, verification.id));
      
      return res.status(201).json(updatedVerification);
    }
    
    return res.status(201).json(verification);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Invalid data provided',
        errors: error.errors 
      });
    }
    
    console.error('Error adding investor verification:', error);
    return res.status(500).json({ 
      message: 'Failed to add investor verification', 
      error: error.message 
    });
  }
};

/**
 * Approve or reject investor verification
 */
export const reviewInvestorVerification = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (verified, rejected) is required' });
    }
    
    // Check if verification exists
    const verification = await db.query.investorVerifications.findFirst({
      where: eq(investorVerifications.id, id)
    });
    
    if (!verification) {
      return res.status(404).json({ message: 'Verification record not found' });
    }
    
    // Update verification status
    const [updated] = await db.update(investorVerifications)
      .set({
        status,
        notes,
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
        updatedAt: new Date(),
        expiresAt: status === 'verified' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year expiry if verified
          : null
      })
      .where(eq(investorVerifications.id, id))
      .returning();
    
    // If verification type affects accreditation, update user
    if (status === 'verified' && 
        ['income', 'net_worth', 'securities_holdings'].includes(verification.verificationType)) {
      await verifyAccreditedStatus(verification.userId);
    }
    
    return res.status(200).json(updated);
  } catch (error: any) {
    console.error('Error reviewing investor verification:', error);
    return res.status(500).json({ 
      message: 'Failed to review investor verification', 
      error: error.message 
    });
  }
};

/**
 * Create compliance exception for a user
 */
export const createComplianceException = async (req: Request, res: Response) => {
  try {
    if (!req.user?.role || !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Validate data
    const validatedData = insertComplianceExceptionSchema.parse({
      ...req.body,
      approvedBy: req.user.id
    });
    
    // Add exception record
    const [exception] = await db.insert(complianceExceptions)
      .values(validatedData)
      .returning();
    
    return res.status(201).json(exception);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: 'Invalid data provided',
        errors: error.errors 
      });
    }
    
    console.error('Error creating compliance exception:', error);
    return res.status(500).json({ 
      message: 'Failed to create compliance exception', 
      error: error.message 
    });
  }
};

/**
 * Get regulatory limits for a jurisdiction and investor type
 */
export const getRegulatoryLimits = async (req: Request, res: Response) => {
  try {
    const { jurisdiction, investorType } = req.query;
    
    let query = db.select().from(regulatoryLimits);
    
    if (jurisdiction) {
      query = query.where(eq(regulatoryLimits.jurisdiction, jurisdiction as string));
    }
    
    if (investorType) {
      query = query.where(eq(regulatoryLimits.investorType, investorType as string));
    }
    
    const limits = await query.orderBy(desc(regulatoryLimits.effectiveDate));
    
    return res.status(200).json(limits);
  } catch (error: any) {
    console.error('Error getting regulatory limits:', error);
    return res.status(500).json({ 
      message: 'Failed to get regulatory limits', 
      error: error.message 
    });
  }
};

/**
 * Check if user is from a restricted jurisdiction
 */
export const checkJurisdictionRestrictions = async (req: Request, res: Response) => {
  try {
    const { country, state } = req.query;
    
    if (!country) {
      return res.status(400).json({ message: 'Country is required' });
    }
    
    // Find restrictions for this jurisdiction
    const restrictions = await db.query.jurisdictionRestrictions.findMany({
      where: and(
        eq(jurisdictionRestrictions.country, country as string),
        or(
          sql`${jurisdictionRestrictions.state} IS NULL`,
          eq(jurisdictionRestrictions.state, state as string || '')
        ),
        or(
          gt(jurisdictionRestrictions.expirationDate, new Date()),
          sql`${jurisdictionRestrictions.expirationDate} IS NULL`
        )
      )
    });
    
    if (restrictions.length === 0) {
      return res.status(200).json({ 
        restricted: false,
        message: 'No restrictions found for this jurisdiction'
      });
    }
    
    // Check for complete block first
    const blockedRestriction = restrictions.find(r => r.restrictionType === 'blocked');
    if (blockedRestriction) {
      return res.status(200).json({ 
        restricted: true,
        restrictionType: 'blocked',
        details: blockedRestriction.details,
        reference: blockedRestriction.regulationReference,
        message: `Investments are not available in ${state ? state + ', ' : ''}${country} due to regulatory restrictions`
      });
    }
    
    // If not blocked, return other restrictions
    return res.status(200).json({
      restricted: restrictions.length > 0,
      restrictions: restrictions.map(r => ({
        type: r.restrictionType,
        details: r.details,
        reference: r.regulationReference
      })),
      message: 'Regulatory restrictions apply to this jurisdiction'
    });
  } catch (error: any) {
    console.error('Error checking jurisdiction restrictions:', error);
    return res.status(500).json({ 
      message: 'Failed to check jurisdiction restrictions', 
      error: error.message 
    });
  }
};