import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

// Simple ROI calculation
export function calculateROI(investmentAmount: number, rate: number, duration: number): number {
  const roi = (investmentAmount * rate * duration) / 100;
  return roi;
}

// Compound interest ROI calculation (monthly compounding)
export function calculateCompoundROI(
  investmentAmount: number, 
  annualRate: number, 
  durationYears: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = durationYears * 12;
  const finalAmount = investmentAmount * Math.pow(1 + monthlyRate, totalMonths);
  return finalAmount - investmentAmount;
}

// Generate monthly returns for an investment
export function generateMonthlyReturns(
  investmentAmount: number,
  annualRate: number,
  durationYears: number
): { month: number; value: number }[] {
  const monthlyReturns = [];
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = durationYears * 12;
  
  let currentValue = investmentAmount;
  
  for (let month = 1; month <= totalMonths; month++) {
    const monthlyEarning = currentValue * monthlyRate;
    currentValue += monthlyEarning;
    monthlyReturns.push({
      month,
      value: currentValue
    });
  }
  
  return monthlyReturns;
}

// Calculate projected returns for a property investment
export async function calculatePropertyROI(req: Request, res: Response) {
  try {
    const schema = z.object({
      propertyId: z.number(),
      investmentAmount: z.number().positive(),
      duration: z.number().positive().default(5), // Default to 5 years if not specified
    });

    const { propertyId, investmentAmount, duration } = schema.parse(req.body);

    // Get property details
    const property = await storage.getProperty(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Parse target return (could be stored as string like "12.5%")
    const targetReturn = parseFloat(property.targetReturn.replace('%', ''));
    
    // Calculate the different ROI metrics
    const simpleROI = calculateROI(investmentAmount, targetReturn, duration);
    const compoundROI = calculateCompoundROI(investmentAmount, targetReturn, duration);
    const monthlyReturns = generateMonthlyReturns(investmentAmount, targetReturn, duration);
    
    // Calculate total earnings
    const totalEarnings = compoundROI;
    const totalValue = investmentAmount + totalEarnings;
    const annualizedReturn = (Math.pow(totalValue / investmentAmount, 1 / duration) - 1) * 100;
    
    // Return the full ROI projection
    return res.status(200).json({
      property: {
        id: property.id,
        name: property.name,
        targetReturn: property.targetReturn,
      },
      investment: {
        amount: investmentAmount,
        duration: duration
      },
      returns: {
        simple: simpleROI,
        compound: compoundROI,
        annualizedReturn,
        totalEarnings,
        totalValue,
        monthlyReturns
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    console.error('Error calculating property ROI:', error);
    return res.status(500).json({ message: 'Error calculating ROI' });
  }
}

// Calculate portfolio ROI
export async function calculatePortfolioROI(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get all user investments
    const investments = await storage.getUserInvestments(req.user.id);
    if (!investments || investments.length === 0) {
      return res.status(404).json({ message: 'No investments found' });
    }

    // Calculate portfolio metrics
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let portfolioReturns = [];
    let propertySummary = [];

    // For each investment, calculate the current value and ROI
    for (const investment of investments) {
      const property = await storage.getProperty(investment.propertyId);
      if (!property) continue;

      const targetReturn = parseFloat(property.targetReturn.replace('%', ''));
      
      // Calculate how long the investment has been active (in years)
      const startDate = investment.date || new Date();
      const currentDate = new Date();
      const durationYears = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      // Calculate current value using compound interest
      const currentValue = investment.amount * Math.pow(1 + (targetReturn / 100 / 12), durationYears * 12);
      
      totalInvested += investment.amount;
      totalCurrentValue += currentValue;
      
      propertySummary.push({
        propertyId: property.id,
        propertyName: property.name,
        investmentId: investment.id,
        investmentAmount: investment.amount,
        currentValue: currentValue,
        roi: ((currentValue - investment.amount) / investment.amount) * 100,
        durationYears
      });
    }

    // Calculate overall portfolio performance
    const portfolioROI = ((totalCurrentValue - totalInvested) / totalInvested) * 100;
    
    return res.status(200).json({
      portfolio: {
        totalInvested,
        totalCurrentValue,
        portfolioROI,
        totalEarnings: totalCurrentValue - totalInvested
      },
      investments: propertySummary
    });
  } catch (error) {
    console.error('Error calculating portfolio ROI:', error);
    return res.status(500).json({ message: 'Error calculating portfolio ROI' });
  }
}

// Compare ROI between properties
export async function comparePropertyROI(req: Request, res: Response) {
  try {
    const schema = z.object({
      propertyIds: z.array(z.number()).min(1),
      investmentAmount: z.number().positive(),
      duration: z.number().positive().default(5) // Default to 5 years if not specified
    });

    const { propertyIds, investmentAmount, duration } = schema.parse(req.body);

    // Get properties and calculate ROI for each
    const propertyROIs = await Promise.all(
      propertyIds.map(async (id) => {
        const property = await storage.getProperty(id);
        if (!property) return null;

        const targetReturn = parseFloat(property.targetReturn.replace('%', ''));
        const simpleROI = calculateROI(investmentAmount, targetReturn, duration);
        const compoundROI = calculateCompoundROI(investmentAmount, targetReturn, duration);

        return {
          propertyId: property.id,
          propertyName: property.name,
          location: property.location,
          targetReturn: property.targetReturn,
          investmentAmount,
          duration,
          simpleROI,
          compoundROI,
          totalReturn: investmentAmount + compoundROI,
          annualizedReturn: (Math.pow((investmentAmount + compoundROI) / investmentAmount, 1 / duration) - 1) * 100
        };
      })
    );

    // Filter out any nulls (properties not found)
    const validPropertyROIs = propertyROIs.filter(roi => roi !== null);

    return res.status(200).json({
      comparison: validPropertyROIs
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    console.error('Error comparing property ROI:', error);
    return res.status(500).json({ message: 'Error comparing property ROI' });
  }
}

// Calculate ROI forecast based on different scenarios
export async function calculateROIForecast(req: Request, res: Response) {
  try {
    const schema = z.object({
      propertyId: z.number(),
      investmentAmount: z.number().positive(),
      duration: z.number().positive(),
      scenarios: z.object({
        pessimistic: z.number().optional(),
        realistic: z.number().optional(),
        optimistic: z.number().optional(),
      }).optional()
    });

    const { propertyId, investmentAmount, duration, scenarios = {} } = schema.parse(req.body);

    // Get property details
    const property = await storage.getProperty(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Parse target return
    const baseReturn = parseFloat(property.targetReturn.replace('%', ''));
    
    // Define scenario returns
    const pessimisticReturn = scenarios.pessimistic || (baseReturn * 0.7); // 30% lower by default
    const realisticReturn = scenarios.realistic || baseReturn; // Target return
    const optimisticReturn = scenarios.optimistic || (baseReturn * 1.3); // 30% higher by default
    
    // Calculate ROI for each scenario
    const pessimisticROI = calculateCompoundROI(investmentAmount, pessimisticReturn, duration);
    const realisticROI = calculateCompoundROI(investmentAmount, realisticReturn, duration);
    const optimisticROI = calculateCompoundROI(investmentAmount, optimisticReturn, duration);
    
    // Calculate monthly returns for realistic scenario
    const monthlyReturns = generateMonthlyReturns(investmentAmount, realisticReturn, duration);
    
    return res.status(200).json({
      property: {
        id: property.id,
        name: property.name,
        targetReturn: property.targetReturn,
      },
      investment: {
        amount: investmentAmount,
        duration: duration
      },
      scenarios: {
        pessimistic: {
          returnRate: pessimisticReturn,
          totalEarnings: pessimisticROI,
          totalValue: investmentAmount + pessimisticROI
        },
        realistic: {
          returnRate: realisticReturn,
          totalEarnings: realisticROI,
          totalValue: investmentAmount + realisticROI,
          monthlyReturns
        },
        optimistic: {
          returnRate: optimisticReturn,
          totalEarnings: optimisticROI,
          totalValue: investmentAmount + optimisticROI
        }
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    console.error('Error calculating ROI forecast:', error);
    return res.status(500).json({ message: 'Error calculating ROI forecast' });
  }
}