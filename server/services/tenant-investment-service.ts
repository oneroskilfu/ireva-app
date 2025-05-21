/**
 * Tenant Investment Service
 * 
 * This service handles investment-related operations with tenant isolation.
 */

import { db } from '../db';
import { createTenantDb } from '../lib/tenant-db';
import { 
  tenantInvestments, 
  tenantProperties, 
  tenantTransactions 
} from '@shared/schema-tenant-tables';
import { eq, and, sql, desc } from 'drizzle-orm';
import { 
  TenantInvestment, 
  InsertTenantInvestment 
} from '@shared/schema-tenant-tables';
import * as propertyService from './tenant-property-service';

/**
 * Get all investments for a tenant
 */
export async function getAllInvestments(tenantId: string): Promise<TenantInvestment[]> {
  try {
    const investments = await db.query.tenantInvestments.findMany({
      where: eq(tenantInvestments.tenantId, tenantId),
      orderBy: desc(tenantInvestments.createdAt),
      with: {
        property: true
      }
    });
    
    return investments;
  } catch (error) {
    console.error('Error getting tenant investments:', error);
    throw error;
  }
}

/**
 * Get investments for a specific user in a tenant
 */
export async function getUserInvestments(
  tenantId: string,
  userId: number
): Promise<TenantInvestment[]> {
  try {
    const investments = await db.query.tenantInvestments.findMany({
      where: and(
        eq(tenantInvestments.tenantId, tenantId),
        eq(tenantInvestments.userId, userId)
      ),
      orderBy: desc(tenantInvestments.createdAt),
      with: {
        property: true
      }
    });
    
    return investments;
  } catch (error) {
    console.error('Error getting user investments for tenant:', error);
    throw error;
  }
}

/**
 * Get investments for a specific property in a tenant
 */
export async function getPropertyInvestments(
  tenantId: string,
  propertyId: number
): Promise<TenantInvestment[]> {
  try {
    const investments = await db.query.tenantInvestments.findMany({
      where: and(
        eq(tenantInvestments.tenantId, tenantId),
        eq(tenantInvestments.propertyId, propertyId)
      ),
      orderBy: desc(tenantInvestments.createdAt)
    });
    
    return investments;
  } catch (error) {
    console.error('Error getting property investments for tenant:', error);
    throw error;
  }
}

/**
 * Get a specific investment with tenant isolation
 */
export async function getInvestmentById(
  tenantId: string,
  investmentId: number
): Promise<TenantInvestment | null> {
  try {
    const [investment] = await db.query.tenantInvestments.findMany({
      where: and(
        eq(tenantInvestments.tenantId, tenantId),
        eq(tenantInvestments.id, investmentId)
      ),
      with: {
        property: true
      },
      limit: 1
    });
    
    return investment || null;
  } catch (error) {
    console.error('Error getting investment by ID:', error);
    throw error;
  }
}

/**
 * Create a new investment with tenant isolation
 */
export async function createInvestment(
  tenantId: string,
  investmentData: InsertTenantInvestment
): Promise<TenantInvestment> {
  try {
    // Run everything in a transaction
    return await db.transaction(async (tx) => {
      // First, ensure the property exists and belongs to this tenant
      const property = await propertyService.getPropertyById(tenantId, investmentData.propertyId);
      if (!property) {
        throw new Error('Property not found or does not belong to this tenant');
      }
      
      // Check if the property has enough funding left
      const currentFunding = Number(property.fundingProgress) || 0;
      const goalFunding = Number(property.fundingGoal) || 0;
      const investmentAmount = Number(investmentData.amount) || 0;
      
      if (currentFunding + investmentAmount > goalFunding) {
        throw new Error('Investment amount exceeds the remaining funding goal');
      }
      
      // Create the investment
      const [investment] = await tx
        .insert(tenantInvestments)
        .values({
          ...investmentData,
          tenantId,
          investmentDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      // Update the property's funding progress
      await propertyService.updatePropertyFundingProgress(
        tenantId,
        investmentData.propertyId,
        investmentAmount
      );
      
      // Create a transaction record
      await tx
        .insert(tenantTransactions)
        .values({
          tenantId,
          userId: investmentData.userId,
          investmentId: investment.id,
          type: 'investment',
          amount: investmentAmount,
          status: 'completed',
          description: `Investment in ${property.name}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      
      return investment;
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    throw error;
  }
}

/**
 * Update an investment with tenant isolation
 */
export async function updateInvestment(
  tenantId: string,
  investmentId: number,
  updateData: Partial<InsertTenantInvestment> & { status?: string }
): Promise<TenantInvestment | null> {
  try {
    // Ensure the investment exists and belongs to this tenant
    const existingInvestment = await getInvestmentById(tenantId, investmentId);
    if (!existingInvestment) {
      return null;
    }
    
    // Update the investment
    const [updatedInvestment] = await db
      .update(tenantInvestments)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(tenantInvestments.tenantId, tenantId),
          eq(tenantInvestments.id, investmentId)
        )
      )
      .returning();
    
    return updatedInvestment || null;
  } catch (error) {
    console.error('Error updating investment:', error);
    throw error;
  }
}

/**
 * Cancel an investment with tenant isolation
 */
export async function cancelInvestment(
  tenantId: string,
  investmentId: number
): Promise<boolean> {
  try {
    // Run everything in a transaction
    return await db.transaction(async (tx) => {
      // Ensure the investment exists and belongs to this tenant
      const investment = await getInvestmentById(tenantId, investmentId);
      if (!investment || investment.status !== 'pending') {
        return false;
      }
      
      // Update the investment status
      await tx
        .update(tenantInvestments)
        .set({
          status: 'cancelled',
          updatedAt: new Date()
        })
        .where(
          and(
            eq(tenantInvestments.tenantId, tenantId),
            eq(tenantInvestments.id, investmentId)
          )
        );
      
      // If the investment affected the property's funding progress, revert it
      if (investment.status === 'completed') {
        await propertyService.updatePropertyFundingProgress(
          tenantId,
          investment.propertyId,
          -Number(investment.amount)
        );
      }
      
      // Update any related transactions
      await tx
        .update(tenantTransactions)
        .set({
          status: 'cancelled',
          updatedAt: new Date()
        })
        .where(
          and(
            eq(tenantTransactions.tenantId, tenantId),
            eq(tenantTransactions.investmentId, investmentId)
          )
        );
      
      return true;
    });
  } catch (error) {
    console.error('Error cancelling investment:', error);
    throw error;
  }
}

/**
 * Get investment statistics for a tenant
 */
export async function getTenantInvestmentStats(tenantId: string) {
  try {
    // Get total investment amount
    const totalResult = await db
      .select({ 
        total: sql`SUM(${tenantInvestments.amount})`,
        count: sql`COUNT(*)` 
      })
      .from(tenantInvestments)
      .where(
        and(
          eq(tenantInvestments.tenantId, tenantId),
          eq(tenantInvestments.status, 'completed')
        )
      );
    
    // Get investment amounts by property
    const propertyStats = await db
      .select({
        propertyId: tenantInvestments.propertyId,
        propertyName: tenantProperties.name,
        total: sql`SUM(${tenantInvestments.amount})`,
        count: sql`COUNT(*)`
      })
      .from(tenantInvestments)
      .leftJoin(
        tenantProperties, 
        and(
          eq(tenantInvestments.propertyId, tenantProperties.id),
          eq(tenantInvestments.tenantId, tenantProperties.tenantId)
        )
      )
      .where(
        and(
          eq(tenantInvestments.tenantId, tenantId),
          eq(tenantInvestments.status, 'completed')
        )
      )
      .groupBy(tenantInvestments.propertyId, tenantProperties.name);
    
    return {
      totalInvestment: totalResult[0]?.total || 0,
      totalCount: totalResult[0]?.count || 0,
      propertyStats
    };
  } catch (error) {
    console.error('Error getting tenant investment stats:', error);
    throw error;
  }
}