import { Request, Response } from 'express';
import { db } from '../db';
import { 
  investments, 
  properties, 
  portfolioExposures, 
  targetAllocations,
  scenarioTests,
  scenarioTemplates,
  users,
  insertPortfolioExposureSchema,
  insertTargetAllocationSchema,
  insertScenarioTestSchema
} from '@shared/schema';
import { eq, and, sql, sum, desc, asc } from 'drizzle-orm';
import { getSocketIo } from '../socketio';

/**
 * Get geographic exposure for a user
 */
export const getGeographicExposure = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Using raw SQL for more complex queries
    const exposure = await db.execute(sql`
      SELECT 
        p.location->>'state' AS state,
        SUM(i.amount::numeric) AS total_amount,
        (SUM(i.amount::numeric) * 100.0 / 
          (SELECT SUM(amount::numeric) FROM ${investments} WHERE user_id = ${userId})
        ) AS percentage
      FROM ${investments} i
      LEFT JOIN ${properties} p ON i.property_id = p.id
      WHERE i.user_id = ${userId}
      GROUP BY p.location->>'state'
      ORDER BY total_amount DESC
    `);
    
    // Store the calculated exposure in the database for historical tracking
    for (const item of exposure) {
      if (item.state && item.percentage) {
        await db.insert(portfolioExposures).values({
          userId,
          exposureType: 'geographic',
          category: item.state,
          value: item.total_amount,
          percentage: item.percentage
        });
      }
    }
    
    return res.status(200).json(exposure);
  } catch (error: any) {
    console.error('Error calculating geographic exposure:', error);
    return res.status(500).json({ 
      message: 'Failed to calculate geographic exposure', 
      error: error.message 
    });
  }
};

/**
 * Get asset class exposure for a user
 */
export const getAssetClassExposure = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Using raw SQL for more complex queries
    const exposure = await db.execute(sql`
      SELECT 
        p.type AS asset_class,
        SUM(i.amount::numeric) AS total_amount,
        (SUM(i.amount::numeric) * 100.0 / 
          (SELECT SUM(amount::numeric) FROM ${investments} WHERE user_id = ${userId})
        ) AS percentage
      FROM ${investments} i
      LEFT JOIN ${properties} p ON i.property_id = p.id
      WHERE i.user_id = ${userId}
      GROUP BY p.type
      ORDER BY total_amount DESC
    `);
    
    // Store the calculated exposure in the database for historical tracking
    for (const item of exposure) {
      if (item.asset_class && item.percentage) {
        await db.insert(portfolioExposures).values({
          userId,
          exposureType: 'asset_class',
          category: item.asset_class,
          value: item.total_amount,
          percentage: item.percentage
        });
      }
    }
    
    return res.status(200).json(exposure);
  } catch (error: any) {
    console.error('Error calculating asset class exposure:', error);
    return res.status(500).json({ 
      message: 'Failed to calculate asset class exposure', 
      error: error.message 
    });
  }
};

/**
 * Get development stage exposure for a user
 */
export const getDevelopmentStageExposure = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Using raw SQL for more complex queries
    const exposure = await db.execute(sql`
      SELECT 
        p.development_stage AS stage,
        SUM(i.amount::numeric) AS total_amount,
        (SUM(i.amount::numeric) * 100.0 / 
          (SELECT SUM(amount::numeric) FROM ${investments} WHERE user_id = ${userId})
        ) AS percentage
      FROM ${investments} i
      LEFT JOIN ${properties} p ON i.property_id = p.id
      WHERE i.user_id = ${userId}
      GROUP BY p.development_stage
      ORDER BY total_amount DESC
    `);
    
    // Store the calculated exposure in the database for historical tracking
    for (const item of exposure) {
      if (item.stage && item.percentage) {
        await db.insert(portfolioExposures).values({
          userId,
          exposureType: 'development_stage',
          category: item.stage,
          value: item.total_amount,
          percentage: item.percentage
        });
      }
    }
    
    return res.status(200).json(exposure);
  } catch (error: any) {
    console.error('Error calculating development stage exposure:', error);
    return res.status(500).json({ 
      message: 'Failed to calculate development stage exposure', 
      error: error.message 
    });
  }
};

/**
 * Set target allocations for a user
 */
export const setTargetAllocations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { allocations } = req.body;
    
    if (!Array.isArray(allocations)) {
      return res.status(400).json({ message: 'Allocations must be an array' });
    }
    
    // Validate total percentages don't exceed 100% for each allocation type
    const totals: Record<string, number> = {};
    for (const allocation of allocations) {
      totals[allocation.allocationType] = (totals[allocation.allocationType] || 0) + parseFloat(allocation.targetPercentage);
    }
    
    for (const [type, total] of Object.entries(totals)) {
      if (total > 100) {
        return res.status(400).json({ 
          message: `Total target percentages for ${type} exceed 100%` 
        });
      }
    }
    
    // Delete existing allocations for this user
    await db.delete(targetAllocations).where(eq(targetAllocations.userId, userId));
    
    // Insert new allocations
    const results = [];
    for (const allocation of allocations) {
      const data = {
        userId,
        allocationType: allocation.allocationType,
        category: allocation.category,
        targetPercentage: allocation.targetPercentage,
        updatedAt: new Date()
      };
      
      const [result] = await db.insert(targetAllocations).values(data).returning();
      results.push(result);
    }
    
    return res.status(200).json(results);
  } catch (error: any) {
    console.error('Error setting target allocations:', error);
    return res.status(500).json({ 
      message: 'Failed to set target allocations', 
      error: error.message 
    });
  }
};

/**
 * Get target allocations for a user
 */
export const getTargetAllocations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const allocations = await db.query.targetAllocations.findMany({
      where: eq(targetAllocations.userId, userId),
      orderBy: [asc(targetAllocations.allocationType), desc(targetAllocations.targetPercentage)]
    });
    
    return res.status(200).json(allocations);
  } catch (error: any) {
    console.error('Error getting target allocations:', error);
    return res.status(500).json({ 
      message: 'Failed to get target allocations', 
      error: error.message 
    });
  }
};

/**
 * Get portfolio balance summary (comparing actual vs target allocations)
 */
export const getPortfolioBalance = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get target allocations
    const targets = await db.query.targetAllocations.findMany({
      where: eq(targetAllocations.userId, userId)
    });
    
    // Get current allocations
    const currentByType: Record<string, Record<string, { value: number, percentage: number }>> = {};
    
    // Asset Class Allocations
    const assetClassExposure = await db.execute(sql`
      SELECT 
        p.type AS category,
        SUM(i.amount::numeric) AS total_amount,
        (SUM(i.amount::numeric) * 100.0 / 
          (SELECT SUM(amount::numeric) FROM ${investments} WHERE user_id = ${userId})
        ) AS percentage
      FROM ${investments} i
      LEFT JOIN ${properties} p ON i.property_id = p.id
      WHERE i.user_id = ${userId}
      GROUP BY p.type
    `);
    
    currentByType['property_type'] = {};
    for (const item of assetClassExposure) {
      if (item.category) {
        currentByType['property_type'][item.category] = {
          value: parseFloat(item.total_amount),
          percentage: parseFloat(item.percentage)
        };
      }
    }
    
    // Development Stage Allocations
    const stageExposure = await db.execute(sql`
      SELECT 
        p.development_stage AS category,
        SUM(i.amount::numeric) AS total_amount,
        (SUM(i.amount::numeric) * 100.0 / 
          (SELECT SUM(amount::numeric) FROM ${investments} WHERE user_id = ${userId})
        ) AS percentage
      FROM ${investments} i
      LEFT JOIN ${properties} p ON i.property_id = p.id
      WHERE i.user_id = ${userId}
      GROUP BY p.development_stage
    `);
    
    currentByType['development_stage'] = {};
    for (const item of stageExposure) {
      if (item.category) {
        currentByType['development_stage'][item.category] = {
          value: parseFloat(item.total_amount),
          percentage: parseFloat(item.percentage)
        };
      }
    }
    
    // Combine targets with current allocations
    const summary = [];
    for (const target of targets) {
      const current = currentByType[target.allocationType]?.[target.category];
      
      summary.push({
        allocationType: target.allocationType,
        category: target.category,
        targetPercentage: parseFloat(target.targetPercentage.toString()),
        currentPercentage: current?.percentage || 0,
        difference: (current?.percentage || 0) - parseFloat(target.targetPercentage.toString()),
        currentValue: current?.value || 0
      });
    }
    
    // Update current percentages in target allocations
    for (const item of summary) {
      await db.update(targetAllocations)
        .set({ 
          currentPercentage: item.currentPercentage,
          updatedAt: new Date()
        })
        .where(and(
          eq(targetAllocations.userId, userId),
          eq(targetAllocations.allocationType, item.allocationType),
          eq(targetAllocations.category, item.category)
        ));
    }
    
    return res.status(200).json({
      summary,
      balanceScore: calculateBalanceScore(summary)
    });
  } catch (error: any) {
    console.error('Error getting portfolio balance:', error);
    return res.status(500).json({ 
      message: 'Failed to get portfolio balance', 
      error: error.message 
    });
  }
};

/**
 * Calculate a score based on how well the portfolio matches the target allocations
 */
function calculateBalanceScore(summary: any[]): number {
  if (summary.length === 0) return 0;
  
  let totalDifference = 0;
  for (const item of summary) {
    totalDifference += Math.abs(item.difference);
  }
  
  // Perfect score is 100, worst score approaches 0
  // A total difference of 0 means perfect match, 200 would mean complete mismatch
  return Math.max(0, 100 - (totalDifference / 2));
}

/**
 * Run a market downturn scenario test
 */
export const runMarketDownturnScenario = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { parameters } = req.body;
    
    if (!parameters || typeof parameters !== 'object') {
      return res.status(400).json({ message: 'Parameters object is required' });
    }
    
    if (!parameters.impactByPropertyType || !Array.isArray(parameters.impactByPropertyType)) {
      return res.status(400).json({ message: 'impactByPropertyType array is required' });
    }
    
    // Get baseline portfolio value
    const [baselineResult] = await db.select({
      value: sum(investments.amount)
    })
    .from(investments)
    .where(eq(investments.userId, userId));
    
    const baseline = parseFloat(baselineResult?.value?.toString() || '0');
    
    // Calculate downturn impact
    const propertyImpacts = parameters.impactByPropertyType.reduce((map: Record<string, number>, item: any) => {
      map[item.propertyType] = item.downturnImpact;
      return map;
    }, {});
    
    // Get portfolio with property details
    const portfolio = await db.select({
      investment: investments,
      property: properties
    })
    .from(investments)
    .leftJoin(properties, eq(investments.propertyId, properties.id))
    .where(eq(investments.userId, userId));
    
    let adjustedValue = 0;
    const impactDetails = [];
    
    for (const item of portfolio) {
      const propertyType = item.property.type;
      const amount = parseFloat(item.investment.amount.toString());
      const impactPercentage = propertyImpacts[propertyType || 'default'] || parameters.defaultImpact || 0.2;
      const adjustedAmount = amount * (1 - impactPercentage);
      
      adjustedValue += adjustedAmount;
      
      impactDetails.push({
        propertyId: item.property.id,
        propertyName: item.property.name,
        propertyType,
        originalValue: amount,
        adjustedValue: adjustedAmount,
        impactPercentage: impactPercentage * 100,
        impactAmount: amount - adjustedAmount
      });
    }
    
    const dropPercentage = baseline > 0 ? ((baseline - adjustedValue) / baseline) * 100 : 0;
    
    // Prepare result
    const result = {
      userId,
      scenarioName: 'Market Downturn Scenario',
      baseline,
      adjustedValue,
      dropAmount: baseline - adjustedValue,
      dropPercentage,
      impactDetails,
      runDate: new Date()
    };
    
    // Store scenario test results
    const [scenarioTest] = await db.insert(scenarioTests).values({
      name: 'Market Downturn Scenario',
      description: 'Simulates the impact of a market downturn on the portfolio',
      userId,
      parameters: parameters,
      results: result,
      ranAt: new Date(),
      portfolioSnapshot: portfolio
    }).returning();
    
    return res.status(200).json({
      result,
      scenarioTestId: scenarioTest.id
    });
  } catch (error: any) {
    console.error('Error running market downturn scenario:', error);
    return res.status(500).json({ 
      message: 'Failed to run market downturn scenario', 
      error: error.message 
    });
  }
};

/**
 * Get scenario templates
 */
export const getScenarioTemplates = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Get both public templates and templates created by this user
    const templates = await db.select()
      .from(scenarioTemplates)
      .where(
        sql`${scenarioTemplates.isPublic} = true OR ${scenarioTemplates.createdBy} = ${userId}`
      );
    
    return res.status(200).json(templates);
  } catch (error: any) {
    console.error('Error getting scenario templates:', error);
    return res.status(500).json({ 
      message: 'Failed to get scenario templates', 
      error: error.message 
    });
  }
};

/**
 * Create a new scenario template
 */
export const createScenarioTemplate = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { name, description, parameters, defaultValues, isPublic } = req.body;
    
    if (!name || !parameters) {
      return res.status(400).json({ message: 'Name and parameters are required' });
    }
    
    const [template] = await db.insert(scenarioTemplates).values({
      name,
      description,
      parameters,
      defaultValues,
      createdBy: userId,
      isPublic: isPublic || false
    }).returning();
    
    return res.status(201).json(template);
  } catch (error: any) {
    console.error('Error creating scenario template:', error);
    return res.status(500).json({ 
      message: 'Failed to create scenario template', 
      error: error.message 
    });
  }
};

/**
 * Get previous scenario test results for a user
 */
export const getScenarioTestHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const tests = await db.query.scenarioTests.findMany({
      where: eq(scenarioTests.userId, userId),
      orderBy: [desc(scenarioTests.ranAt)]
    });
    
    return res.status(200).json(tests);
  } catch (error: any) {
    console.error('Error getting scenario test history:', error);
    return res.status(500).json({ 
      message: 'Failed to get scenario test history', 
      error: error.message 
    });
  }
};

/**
 * Get detailed results for a specific scenario test
 */
export const getScenarioTestDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const test = await db.query.scenarioTests.findFirst({
      where: and(
        eq(scenarioTests.id, id),
        eq(scenarioTests.userId, userId)
      )
    });
    
    if (!test) {
      return res.status(404).json({ message: 'Scenario test not found' });
    }
    
    return res.status(200).json(test);
  } catch (error: any) {
    console.error('Error getting scenario test details:', error);
    return res.status(500).json({ 
      message: 'Failed to get scenario test details', 
      error: error.message 
    });
  }
};