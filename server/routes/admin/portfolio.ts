import express from 'express';
import { db } from '../../db';
import { 
  and, or, eq, between, ilike, 
  sql, gt, lt, desc 
} from 'drizzle-orm';
import { 
  investments, 
  users, 
  properties 
} from '@shared/schema';
import { ensureAdmin } from '../../auth-jwt';
import { logger } from '../../utils/logger';
import adminLogger from '../../services/adminLogger';

const router = express.Router();

// Helper function to handle server errors
function handleServerError(res: express.Response, error: any, message: string) {
  logger.error(`${message}: ${error?.message}`, {
    error: error?.stack,
    context: 'admin-portfolio-routes'
  });
  res.status(500).json({ error: message });
}

// Helper to pick only allowed fields from an object
function pick(obj: any, allowedFields: string[]) {
  return Object.keys(obj)
    .filter(key => allowedFields.includes(key))
    .reduce((newObj, key) => {
      newObj[key] = obj[key];
      return newObj;
    }, {} as Record<string, any>);
}

// Get filtered investments
router.get('/', ensureAdmin, async (req, res) => {
  const { 
    projectId,
    userId,
    status,
    startDate,
    endDate,
    search
  } = req.query;

  try {
    const query = db
      .select({
        id: investments.id,
        amount: investments.amount,
        status: investments.status,
        projectedROI: investments.projectedROI,
        actualROI: investments.actualROI,
        investedAt: investments.investedAt,
        maturityDate: investments.maturityDate,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName
        },
        property: {
          id: properties.id,
          name: properties.name
        }
      })
      .from(investments)
      .leftJoin(users, eq(investments.userId, users.id))
      .leftJoin(properties, eq(investments.propertyId, properties.id))
      .where(and(
        projectId ? eq(investments.propertyId, projectId as string) : undefined,
        userId ? eq(investments.userId, userId as string) : undefined,
        status ? eq(investments.status, status as any) : undefined,
        startDate && endDate ? 
          between(investments.investedAt, new Date(startDate as string), new Date(endDate as string)) :
          undefined,
        search ? or(
          ilike(users.email, `%${search}%`),
          ilike(properties.name, `%${search}%`)
        ) : undefined
      ))
      .orderBy(desc(investments.investedAt));

    const result = await query;
    res.json(result);
  } catch (error) {
    handleServerError(res, error, 'Failed to fetch investments');
  }
});

// Update investment (manual adjustment)
router.patch('/:id', ensureAdmin, async (req, res) => {
  const allowedFields = ['status', 'actualROI', 'maturityDate'];
  const updates = pick(req.body, allowedFields);

  try {
    const updated = await db
      .update(investments)
      .set(updates)
      .where(eq(investments.id, req.params.id))
      .returning();

    if (req.user) {
      await adminLogger.createAuditLog({
        adminId: req.user.id,
        action: 'INVESTMENT_UPDATE',
        entityType: 'investments',
        targetId: req.params.id,
        metadata: { updates },
        details: `Updated investment ${req.params.id}`
      });
    }

    res.json(updated[0]);
  } catch (error) {
    handleServerError(res, error, 'Failed to update investment');
  }
});

// Performance comparison endpoint
router.get('/performance', ensureAdmin, async (req, res) => {
  try {
    const result = await db
      .select({
        propertyId: investments.propertyId,
        title: properties.name,
        totalInvested: sql<number>`sum(${investments.amount})`,
        avgProjectedROI: sql<number>`avg(${investments.projectedROI})`,
        avgActualROI: sql<number>`avg(${investments.actualROI})`,
        performanceGap: sql<number>`avg(${investments.projectedROI}) - avg(${investments.actualROI})`
      })
      .from(investments)
      .leftJoin(properties, eq(investments.propertyId, properties.id))
      .groupBy(investments.propertyId, properties.name);

    res.json(result);
  } catch (error) {
    handleServerError(res, error, 'Failed to fetch performance data');
  }
});

export default router;