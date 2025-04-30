import express, { Request, Response } from 'express';
import { db } from '../../db';
import { investments, properties, users } from '@shared/schema';
import { eq, and, or, between, like, sql } from 'drizzle-orm';
import { ensureAdmin } from '../../auth-jwt';
import { Parser } from 'json2csv';

const router = express.Router();

function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

router.get('/portfolio/csv', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // Extract filter parameters
    const { 
      status, 
      propertyId, 
      userId, 
      startDate, 
      endDate,
      minAmount,
      maxAmount 
    } = req.query;
    
    // Build base query
    let query = db
      .select({
        id: investments.id,
        status: investments.status,
        amount: investments.amount,
        projectedROI: investments.projectedROI,
        actualROI: investments.actualROI,
        investedAt: investments.investedAt,
        maturityDate: investments.maturityDate,
        withdrawnAt: investments.withdrawnAt,
        userEmail: users.email,
        userName: users.username,
        propertyName: properties.name,
        propertyLocation: properties.location
      })
      .from(investments)
      .leftJoin(users, eq(investments.userId, users.id))
      .leftJoin(properties, eq(properties.id, sql<number>`CAST(${investments.propertyId} AS INTEGER)`));
    
    // Apply filters
    const conditions = [];
    
    if (status) {
      conditions.push(eq(investments.status, status as string));
    }
    
    if (propertyId) {
      conditions.push(eq(investments.propertyId, propertyId as string));
    }
    
    if (userId) {
      conditions.push(eq(investments.userId, userId as string));
    }
    
    if (startDate && endDate) {
      conditions.push(
        between(
          investments.investedAt, 
          new Date(startDate as string), 
          new Date(endDate as string)
        )
      );
    } else if (startDate) {
      conditions.push(sql`${investments.investedAt} >= ${new Date(startDate as string)}`);
    } else if (endDate) {
      conditions.push(sql`${investments.investedAt} <= ${new Date(endDate as string)}`);
    }
    
    if (minAmount) {
      conditions.push(
        sql`CAST(${investments.amount} AS DECIMAL) >= ${parseFloat(minAmount as string)}`
      );
    }
    
    if (maxAmount) {
      conditions.push(
        sql`CAST(${investments.amount} AS DECIMAL) <= ${parseFloat(maxAmount as string)}`
      );
    }
    
    // Apply conditions if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Execute query
    const investmentData = await query;
    
    // Transform data for CSV export
    const formattedData = investmentData.map(investment => ({
      ID: investment.id,
      Status: investment.status,
      Amount: investment.amount,
      'Projected ROI': investment.projectedROI,
      'Actual ROI': investment.actualROI || 'N/A',
      'Investor Email': investment.userEmail,
      'Investor Name': investment.userName,
      'Property Name': investment.propertyName,
      'Property Location': investment.propertyLocation,
      'Investment Date': formatDate(investment.investedAt),
      'Maturity Date': formatDate(investment.maturityDate),
      'Withdrawn Date': formatDate(investment.withdrawnAt)
    }));
    
    // Generate CSV
    const fields = [
      'ID', 
      'Status', 
      'Amount', 
      'Projected ROI', 
      'Actual ROI', 
      'Investor Email', 
      'Investor Name', 
      'Property Name', 
      'Property Location', 
      'Investment Date', 
      'Maturity Date', 
      'Withdrawn Date'
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(formattedData);
    
    // Set headers for CSV download
    res.setHeader('Content-Disposition', 'attachment; filename=portfolio-export.csv');
    res.setHeader('Content-Type', 'text/csv');
    
    // Send the CSV
    res.send(csv);
  } catch (error) {
    console.error('Error exporting portfolio data to CSV:', error);
    res.status(500).json({ error: 'Failed to export portfolio data' });
  }
});

router.get('/portfolio/json', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // Extract filter parameters (same as CSV endpoint)
    const { 
      status, 
      propertyId, 
      userId, 
      startDate, 
      endDate,
      minAmount,
      maxAmount 
    } = req.query;
    
    // Build base query (same as CSV endpoint)
    let query = db
      .select({
        id: investments.id,
        status: investments.status,
        amount: investments.amount,
        projectedROI: investments.projectedROI,
        actualROI: investments.actualROI,
        investedAt: investments.investedAt,
        maturityDate: investments.maturityDate,
        withdrawnAt: investments.withdrawnAt,
        userEmail: users.email,
        userName: users.username,
        propertyName: properties.name,
        propertyLocation: properties.location
      })
      .from(investments)
      .leftJoin(users, eq(investments.userId, users.id))
      .leftJoin(properties, eq(properties.id, sql<number>`CAST(${investments.propertyId} AS INTEGER)`));
    
    // Apply filters (same as CSV endpoint)
    const conditions = [];
    
    if (status) {
      conditions.push(eq(investments.status, status as string));
    }
    
    if (propertyId) {
      conditions.push(eq(investments.propertyId, propertyId as string));
    }
    
    if (userId) {
      conditions.push(eq(investments.userId, userId as string));
    }
    
    if (startDate && endDate) {
      conditions.push(
        between(
          investments.investedAt, 
          new Date(startDate as string), 
          new Date(endDate as string)
        )
      );
    } else if (startDate) {
      conditions.push(sql`${investments.investedAt} >= ${new Date(startDate as string)}`);
    } else if (endDate) {
      conditions.push(sql`${investments.investedAt} <= ${new Date(endDate as string)}`);
    }
    
    if (minAmount) {
      conditions.push(
        sql`CAST(${investments.amount} AS DECIMAL) >= ${parseFloat(minAmount as string)}`
      );
    }
    
    if (maxAmount) {
      conditions.push(
        sql`CAST(${investments.amount} AS DECIMAL) <= ${parseFloat(maxAmount as string)}`
      );
    }
    
    // Apply conditions if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Execute query
    const investmentData = await query;
    
    // For JSON, we don't need to transform the date fields - just send as is
    res.json({
      count: investmentData.length,
      data: investmentData
    });
  } catch (error) {
    console.error('Error exporting portfolio data to JSON:', error);
    res.status(500).json({ error: 'Failed to export portfolio data' });
  }
});

export default router;