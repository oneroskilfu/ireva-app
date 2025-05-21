/**
 * Tenant Property Service
 * 
 * This service handles property-related operations with tenant isolation.
 */

import { db } from '../db';
import { createTenantDb } from '../lib/tenant-db';
import { tenantProperties } from '@shared/schema-tenant-tables';
import { eq, and, sql, desc } from 'drizzle-orm';
import { TenantProperty, InsertTenantProperty } from '@shared/schema-tenant-tables';
import { z } from 'zod';

/**
 * Get all properties for a tenant
 */
export async function getAllProperties(tenantId: string): Promise<TenantProperty[]> {
  const tenantDb = createTenantDb(tenantId);
  
  try {
    const properties = await db.query.tenantProperties.findMany({
      where: eq(tenantProperties.tenantId, tenantId),
      orderBy: desc(tenantProperties.createdAt)
    });
    
    return properties;
  } catch (error) {
    console.error('Error getting tenant properties:', error);
    throw error;
  }
}

/**
 * Get a property by ID with tenant isolation
 */
export async function getPropertyById(tenantId: string, propertyId: number): Promise<TenantProperty | null> {
  try {
    const [property] = await db.query.tenantProperties.findMany({
      where: and(
        eq(tenantProperties.tenantId, tenantId),
        eq(tenantProperties.id, propertyId)
      ),
      limit: 1
    });
    
    return property || null;
  } catch (error) {
    console.error('Error getting tenant property by ID:', error);
    throw error;
  }
}

/**
 * Create a new property for a tenant
 */
export async function createProperty(
  tenantId: string, 
  propertyData: InsertTenantProperty
): Promise<TenantProperty> {
  try {
    const [property] = await db
      .insert(tenantProperties)
      .values({
        ...propertyData,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return property;
  } catch (error) {
    console.error('Error creating tenant property:', error);
    throw error;
  }
}

/**
 * Update a property with tenant isolation
 */
export async function updateProperty(
  tenantId: string,
  propertyId: number,
  propertyData: Partial<InsertTenantProperty>
): Promise<TenantProperty | null> {
  try {
    // First check if the property belongs to this tenant
    const existingProperty = await getPropertyById(tenantId, propertyId);
    if (!existingProperty) {
      return null;
    }
    
    // Update the property
    const [updatedProperty] = await db
      .update(tenantProperties)
      .set({
        ...propertyData,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(tenantProperties.tenantId, tenantId),
          eq(tenantProperties.id, propertyId)
        )
      )
      .returning();
    
    return updatedProperty || null;
  } catch (error) {
    console.error('Error updating tenant property:', error);
    throw error;
  }
}

/**
 * Delete a property with tenant isolation
 */
export async function deleteProperty(
  tenantId: string,
  propertyId: number
): Promise<boolean> {
  try {
    // First check if the property belongs to this tenant
    const existingProperty = await getPropertyById(tenantId, propertyId);
    if (!existingProperty) {
      return false;
    }
    
    // Delete the property
    await db
      .delete(tenantProperties)
      .where(
        and(
          eq(tenantProperties.tenantId, tenantId),
          eq(tenantProperties.id, propertyId)
        )
      );
    
    return true;
  } catch (error) {
    console.error('Error deleting tenant property:', error);
    throw error;
  }
}

/**
 * Search properties with tenant isolation
 */
export async function searchProperties(
  tenantId: string,
  searchParams: {
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    status?: string;
  }
): Promise<TenantProperty[]> {
  try {
    let query = db
      .select()
      .from(tenantProperties)
      .where(eq(tenantProperties.tenantId, tenantId));
    
    // Apply filters
    if (searchParams.propertyType) {
      query = query.where(eq(tenantProperties.propertyType, searchParams.propertyType));
    }
    
    if (searchParams.status) {
      query = query.where(eq(tenantProperties.status, searchParams.status));
    }
    
    if (searchParams.location) {
      query = query.where(sql`${tenantProperties.location} ILIKE ${`%${searchParams.location}%`}`);
    }
    
    if (searchParams.minPrice !== undefined) {
      query = query.where(sql`${tenantProperties.price} >= ${searchParams.minPrice}`);
    }
    
    if (searchParams.maxPrice !== undefined) {
      query = query.where(sql`${tenantProperties.price} <= ${searchParams.maxPrice}`);
    }
    
    // Execute the query
    const properties = await query.orderBy(desc(tenantProperties.createdAt));
    
    return properties;
  } catch (error) {
    console.error('Error searching tenant properties:', error);
    throw error;
  }
}

/**
 * Update property funding progress
 */
export async function updatePropertyFundingProgress(
  tenantId: string,
  propertyId: number,
  amount: number
): Promise<TenantProperty | null> {
  try {
    // Update the property
    const [updatedProperty] = await db
      .update(tenantProperties)
      .set({
        fundingProgress: sql`${tenantProperties.fundingProgress} + ${amount}`,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(tenantProperties.tenantId, tenantId),
          eq(tenantProperties.id, propertyId)
        )
      )
      .returning();
    
    return updatedProperty || null;
  } catch (error) {
    console.error('Error updating property funding progress:', error);
    throw error;
  }
}