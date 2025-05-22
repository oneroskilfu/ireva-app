/**
 * Audit Trail Controller
 * 
 * Handles operations related to auditing and change history:
 * - Recording entity changes
 * - Retrieving change history
 * - Rolling back changes
 * - Managing admin actions
 */

const { eq, and, desc, asc, sql } = require('drizzle-orm');
const { db } = require('../db.cjs');
const { 
  entityHistory,
  fieldChangeHistory,
  adminActionHistory 
} = require('../../shared/schema-history');
const { users } = require('../../shared/schema');
const securityMiddleware = require('../middleware/security-middleware');

/**
 * Record entity change
 * 
 * Records a change to an entity in the system. This function is called
 * internally by other controllers when they modify data.
 * 
 * @param {string} entityType - Type of entity being changed
 * @param {number} entityId - ID of the entity being changed
 * @param {string} changeType - Type of change: 'create', 'update', 'delete'
 * @param {object} previousState - State of entity before change (null for create)
 * @param {object} newState - State of entity after change (null for delete)
 * @param {number} userId - ID of user making the change
 * @param {string} reason - Optional reason for the change
 * @param {object} req - Express request object for metadata
 * @returns {Promise<object>} The created entity history record
 */
async function recordEntityChange(
  entityType,
  entityId,
  changeType,
  previousState,
  newState,
  userId,
  reason,
  req
) {
  try {
    // Create entity history record
    const [historyRecord] = await db.insert(entityHistory)
      .values({
        entityType,
        entityId,
        changeType,
        previousState: previousState ? JSON.stringify(previousState) : null,
        newState: newState ? JSON.stringify(newState) : null,
        changedBy: userId,
        changedAt: new Date(),
        reason: reason || null,
        ipAddress: req?.ip || null,
        userAgent: req?.headers?.['user-agent'] || null,
        additionalInfo: req?.body ? JSON.stringify({
          referrer: req.headers.referer,
          path: req.path,
          method: req.method
        }) : null
      })
      .returning();
    
    // If it's an update, record field-level changes
    if (changeType === 'update' && previousState && newState) {
      await recordFieldChanges(historyRecord.id, previousState, newState);
    }
    
    return historyRecord;
  } catch (error) {
    console.error('Error recording entity change:', error);
    // Don't throw - we don't want audit failures to break core functionality
    return null;
  }
}

/**
 * Record field-level changes between states
 * 
 * @param {number} entityHistoryId - ID of the entity history record
 * @param {object} previousState - State before changes
 * @param {object} newState - State after changes
 */
async function recordFieldChanges(entityHistoryId, previousState, newState) {
  try {
    // Find all changed fields
    const changedFields = [];
    
    // Check all fields in new state
    for (const [key, newValue] of Object.entries(newState)) {
      const previousValue = previousState[key];
      
      // Skip if values are the same or both undefined/null
      if (JSON.stringify(newValue) === JSON.stringify(previousValue)) {
        continue;
      }
      
      changedFields.push({
        entityHistoryId,
        fieldName: key,
        previousValue: previousValue !== undefined ? JSON.stringify(previousValue) : null,
        newValue: newValue !== undefined ? JSON.stringify(newValue) : null
      });
    }
    
    // Check for fields that were removed
    for (const key of Object.keys(previousState)) {
      if (newState[key] === undefined && previousState[key] !== undefined) {
        changedFields.push({
          entityHistoryId,
          fieldName: key,
          previousValue: JSON.stringify(previousState[key]),
          newValue: null
        });
      }
    }
    
    // Insert field changes if any
    if (changedFields.length > 0) {
      await db.insert(fieldChangeHistory)
        .values(changedFields);
    }
  } catch (error) {
    console.error('Error recording field changes:', error);
    // Again, don't throw to avoid breaking core functionality
  }
}

/**
 * Record admin action
 * 
 * Records an administrative action for auditing.
 * 
 * @param {number} adminId - ID of the admin performing the action
 * @param {string} actionType - Type of action performed
 * @param {object} details - Details of the action
 * @param {object} options - Additional options (entityType, entityId, affectedUserIds)
 * @param {object} req - Express request object for metadata
 * @returns {Promise<object>} The created admin action record
 */
async function recordAdminAction(
  adminId,
  actionType,
  details,
  options = {},
  req
) {
  try {
    const { entityType, entityId, affectedUserIds, success = true } = options;
    
    const [actionRecord] = await db.insert(adminActionHistory)
      .values({
        adminId,
        actionType,
        entityType: entityType || null,
        entityId: entityId || null,
        details: details ? JSON.stringify(details) : null,
        performedAt: new Date(),
        ipAddress: req?.ip || null,
        success,
        affectedUserIds: affectedUserIds || null
      })
      .returning();
    
    return actionRecord;
  } catch (error) {
    console.error('Error recording admin action:', error);
    return null;
  }
}

/**
 * Get entity change history
 * 
 * Retrieves the change history for a specific entity.
 */
exports.getEntityHistory = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Validate required params
    if (!entityType || !entityId) {
      return res.status(400).json({
        status: 'error',
        message: 'Entity type and ID are required'
      });
    }
    
    // Convert to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Get history records
    const history = await db.select({
      h: entityHistory,
      u: users
    })
    .from(entityHistory)
    .leftJoin(users, eq(entityHistory.changedBy, users.id))
    .where(and(
      eq(entityHistory.entityType, entityType),
      eq(entityHistory.entityId, entityId)
    ))
    .orderBy(desc(entityHistory.changedAt))
    .limit(limitNum)
    .offset(offset);
    
    // Format the response
    const formattedHistory = history.map(record => ({
      id: record.h.id,
      changeType: record.h.changeType,
      changedAt: record.h.changedAt,
      reason: record.h.reason,
      changedBy: record.u ? {
        id: record.u.id,
        name: record.u.name,
        email: record.u.email,
        role: record.u.role
      } : null,
      ipAddress: record.h.ipAddress,
      // Don't include full states in the list view to reduce payload size
      hasFieldChanges: true
    }));
    
    // Get total count for pagination
    const [{ count }] = await db.select({
      count: db.fn.count()
    })
    .from(entityHistory)
    .where(and(
      eq(entityHistory.entityType, entityType),
      eq(entityHistory.entityId, entityId)
    ));
    
    const totalItems = Number(count);
    const totalPages = Math.ceil(totalItems / limitNum);
    
    res.status(200).json({
      status: 'success',
      data: {
        history: formattedHistory,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error getting entity history:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving entity history'
    });
  }
};

/**
 * Get history details
 * 
 * Retrieves detailed information about a specific change, including field-level changes.
 */
exports.getHistoryDetail = async (req, res) => {
  try {
    const { historyId } = req.params;
    
    // Get history record
    const [record] = await db.select({
      h: entityHistory,
      u: users
    })
    .from(entityHistory)
    .leftJoin(users, eq(entityHistory.changedBy, users.id))
    .where(eq(entityHistory.id, historyId))
    .limit(1);
    
    if (!record) {
      return res.status(404).json({
        status: 'error',
        message: 'History record not found'
      });
    }
    
    // Get field changes
    const fieldChanges = await db.select()
      .from(fieldChangeHistory)
      .where(eq(fieldChangeHistory.entityHistoryId, historyId))
      .orderBy(asc(fieldChangeHistory.fieldName));
    
    // Format field changes
    const formattedFieldChanges = fieldChanges.map(change => ({
      field: change.fieldName,
      previousValue: change.previousValue ? JSON.parse(change.previousValue) : null,
      newValue: change.newValue ? JSON.parse(change.newValue) : null
    }));
    
    // Format response
    const formattedRecord = {
      id: record.h.id,
      entityType: record.h.entityType,
      entityId: record.h.entityId,
      changeType: record.h.changeType,
      previousState: record.h.previousState ? JSON.parse(record.h.previousState) : null,
      newState: record.h.newState ? JSON.parse(record.h.newState) : null,
      changedAt: record.h.changedAt,
      reason: record.h.reason,
      changedBy: record.u ? {
        id: record.u.id,
        name: record.u.name,
        email: record.u.email,
        role: record.u.role
      } : null,
      ipAddress: record.h.ipAddress,
      userAgent: record.h.userAgent,
      additionalInfo: record.h.additionalInfo ? JSON.parse(record.h.additionalInfo) : null,
      fieldChanges: formattedFieldChanges
    };
    
    res.status(200).json({
      status: 'success',
      data: { record: formattedRecord }
    });
  } catch (error) {
    console.error('Error getting history detail:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving history detail'
    });
  }
};

/**
 * Roll back changes
 * 
 * Rolls back an entity to a previous state based on the history record.
 * This is a potentially destructive action, so it's restricted to admins.
 */
exports.rollbackChanges = async (req, res) => {
  try {
    const { historyId } = req.params;
    const { reason } = req.body;
    
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Admin access required for rollback operations'
      });
    }
    
    // Get history record
    const [record] = await db.select()
      .from(entityHistory)
      .where(eq(entityHistory.id, historyId))
      .limit(1);
    
    if (!record) {
      return res.status(404).json({
        status: 'error',
        message: 'History record not found'
      });
    }
    
    // Make sure we have a state to roll back to
    if (!record.previousState && record.changeType !== 'delete') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot roll back: No previous state available'
      });
    }
    
    // Determine the table based on entity type
    const tableName = getTableNameFromEntityType(record.entityType);
    if (!tableName) {
      return res.status(400).json({
        status: 'error',
        message: `Unsupported entity type: ${record.entityType}`
      });
    }
    
    // Generate SQL for the rollback
    let rollbackResult;
    
    // For rollback success tracking
    let success = true;
    
    try {
      if (record.changeType === 'create') {
        // Rollback a creation by deleting the entity
        await db.execute(sql`DELETE FROM ${sql.identifier(tableName)} WHERE id = ${record.entityId}`);
      } else if (record.changeType === 'update') {
        // Rollback an update by restoring the previous state
        const previousState = JSON.parse(record.previousState);
        
        // Convert the state to SQL-friendly format and filter out non-columns
        const columns = await getTableColumns(tableName);
        const updateValues = [];
        const updateColumns = [];
        
        for (const [key, value] of Object.entries(previousState)) {
          if (columns.includes(key)) {
            updateColumns.push(key);
            updateValues.push(value);
          }
        }
        
        // Generate the SQL update statement using Drizzle's safe query builder
        const tableIdentifier = sql.identifier(tableName);
        const columnIdentifiers = updateColumns.map(col => sql.identifier(col));
        const valuePlaceholders = updateValues.map((_, index) => sql.placeholder(`param${index + 1}`));
        
        const updateQuery = sql`UPDATE ${tableIdentifier} SET ${sql.join(
          columnIdentifiers.map((col, index) => sql`${col} = ${valuePlaceholders[index]}`),
          sql.raw(', ')
        )} WHERE id = ${record.entityId}`;
        
        await db.execute(updateQuery, Object.fromEntries(
          updateValues.map((value, index) => [`param${index + 1}`, value])
        ));
      } else if (record.changeType === 'delete') {
        // Rollback a deletion by recreating the entity
        const newState = JSON.parse(record.newState);
        
        // Convert the state to SQL-friendly format and filter out non-columns
        const columns = await getTableColumns(tableName);
        const insertValues = [];
        const insertColumns = [];
        
        for (const [key, value] of Object.entries(newState)) {
          if (columns.includes(key)) {
            insertColumns.push(key);
            insertValues.push(value);
          }
        }
        
        // Generate the SQL insert statement using Drizzle's safe query builder
        const tableIdentifier = sql.identifier(tableName);
        const columnIdentifiers = insertColumns.map(col => sql.identifier(col));
        const valuePlaceholders = insertValues.map((_, index) => sql.placeholder(`param${index + 1}`));
        
        const insertQuery = sql`INSERT INTO ${tableIdentifier} (${sql.join(columnIdentifiers, sql.raw(', '))}) VALUES (${sql.join(valuePlaceholders, sql.raw(', '))}) RETURNING *`;
        
        rollbackResult = await db.execute(insertQuery, Object.fromEntries(
          insertValues.map((value, index) => [`param${index + 1}`, value])
        ));
      }
    } catch (error) {
      console.error('Error during rollback operation:', error);
      success = false;
      
      return res.status(500).json({
        status: 'error',
        message: 'Rollback operation failed: Database error',
        details: error.message
      });
    }
    
    // Record the rollback as an admin action
    await recordAdminAction(
      req.user.id,
      'ROLLBACK',
      {
        historyId,
        entityType: record.entityType,
        entityId: record.entityId,
        rollbackFrom: record.changeType,
        reason: reason || 'Manual rollback'
      },
      {
        entityType: record.entityType,
        entityId: record.entityId,
        success
      },
      req
    );
    
    // Record this rollback in the entity history
    if (success) {
      let newHistoryRecord;
      
      if (record.changeType === 'create') {
        // We've deleted the entity that was created
        newHistoryRecord = await recordEntityChange(
          record.entityType,
          record.entityId,
          'delete',
          JSON.parse(record.newState),
          null,
          req.user.id,
          `Rollback of creation (History ID: ${record.id})`,
          req
        );
      } else if (record.changeType === 'update') {
        // We've restored the entity to its previous state
        newHistoryRecord = await recordEntityChange(
          record.entityType,
          record.entityId,
          'update',
          JSON.parse(record.newState), // Current state becomes the previous state
          JSON.parse(record.previousState), // Previous state becomes the new state
          req.user.id,
          `Rollback of update (History ID: ${record.id})`,
          req
        );
      } else if (record.changeType === 'delete') {
        // We've recreated the deleted entity
        newHistoryRecord = await recordEntityChange(
          record.entityType,
          record.entityId,
          'create',
          null,
          JSON.parse(record.newState),
          req.user.id,
          `Rollback of deletion (History ID: ${record.id})`,
          req
        );
      }
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Rollback completed successfully',
      data: {
        entityType: record.entityType,
        entityId: record.entityId,
        result: rollbackResult || null
      }
    });
  } catch (error) {
    console.error('Error rolling back changes:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during rollback operation'
    });
  }
};

/**
 * Get admin action history
 * 
 * Retrieves a list of administrative actions for auditing.
 */
exports.getAdminActionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, adminId, actionType } = req.query;
    
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Admin access required to view admin action history'
      });
    }
    
    // Convert to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Build query
    let query = db.select({
      a: adminActionHistory,
      u: users
    })
    .from(adminActionHistory)
    .leftJoin(users, eq(adminActionHistory.adminId, users.id))
    .orderBy(desc(adminActionHistory.performedAt));
    
    // Add filters
    if (adminId) {
      query = query.where(eq(adminActionHistory.adminId, adminId));
    }
    
    if (actionType) {
      query = query.where(eq(adminActionHistory.actionType, actionType));
    }
    
    // Execute query with pagination
    const actions = await query.limit(limitNum).offset(offset);
    
    // Format results
    const formattedActions = actions.map(action => ({
      id: action.a.id,
      actionType: action.a.actionType,
      entityType: action.a.entityType,
      entityId: action.a.entityId,
      performedAt: action.a.performedAt,
      ipAddress: action.a.ipAddress,
      success: action.a.success,
      admin: action.u ? {
        id: action.u.id,
        name: action.u.name,
        email: action.u.email
      } : null,
      // Include brief details but not the full details to reduce payload size
      briefDetails: action.a.details ? JSON.stringify(action.a.details).substring(0, 100) + '...' : null
    }));
    
    // Get total count for pagination
    let countQuery = db.select({
      count: db.fn.count()
    })
    .from(adminActionHistory);
    
    // Apply the same filters to the count query
    if (adminId) {
      countQuery = countQuery.where(eq(adminActionHistory.adminId, adminId));
    }
    
    if (actionType) {
      countQuery = countQuery.where(eq(adminActionHistory.actionType, actionType));
    }
    
    const [{ count }] = await countQuery;
    
    const totalItems = Number(count);
    const totalPages = Math.ceil(totalItems / limitNum);
    
    res.status(200).json({
      status: 'success',
      data: {
        actions: formattedActions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error getting admin action history:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving admin action history'
    });
  }
};

/**
 * Get a specific admin action
 * 
 * Retrieves details about a specific administrative action.
 */
exports.getAdminActionDetail = async (req, res) => {
  try {
    const { actionId } = req.params;
    
    // Ensure user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Admin access required to view admin action details'
      });
    }
    
    // Get action
    const [action] = await db.select({
      a: adminActionHistory,
      u: users
    })
    .from(adminActionHistory)
    .leftJoin(users, eq(adminActionHistory.adminId, users.id))
    .where(eq(adminActionHistory.id, actionId))
    .limit(1);
    
    if (!action) {
      return res.status(404).json({
        status: 'error',
        message: 'Admin action not found'
      });
    }
    
    // If there are affected users, get their info
    let affectedUsers = [];
    if (action.a.affectedUserIds && action.a.affectedUserIds.length > 0) {
      affectedUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email
      })
      .from(users)
      .where(sql`id = ANY(${action.a.affectedUserIds})`);
    }
    
    // Format the response
    const formattedAction = {
      id: action.a.id,
      actionType: action.a.actionType,
      entityType: action.a.entityType,
      entityId: action.a.entityId,
      details: action.a.details ? JSON.parse(action.a.details) : null,
      performedAt: action.a.performedAt,
      ipAddress: action.a.ipAddress,
      success: action.a.success,
      admin: action.u ? {
        id: action.u.id,
        name: action.u.name,
        email: action.u.email,
        role: action.u.role
      } : null,
      affectedUsers
    };
    
    res.status(200).json({
      status: 'success',
      data: { action: formattedAction }
    });
  } catch (error) {
    console.error('Error getting admin action detail:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving admin action detail'
    });
  }
};

// Export utility functions for use by other controllers
exports.recordEntityChange = recordEntityChange;
exports.recordAdminAction = recordAdminAction;

/**
 * Helper function to get table name from entity type
 */
function getTableNameFromEntityType(entityType) {
  const tableMap = {
    'user': 'users',
    'property': 'properties',
    'investment': 'investments',
    'transaction': 'transactions',
    'kyc': 'kyc',
    'document': 'documents',
    'property_update': 'property_updates',
    'roi_payment': 'roi_payments',
    'wallet': 'wallets'
  };
  
  return tableMap[entityType] || null;
}

/**
 * Helper function to get table columns
 */
async function getTableColumns(tableName) {
  // This is PostgreSQL-specific
  const result = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = ${tableName}
  `);
  
  return result.rows.map(row => row.column_name);
}