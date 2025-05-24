/**
 * Audit Trail Routes Module
 * 
 * Defines all API endpoints related to audit trail and change history:
 * - Viewing entity change history
 * - Viewing detailed change records
 * - Rolling back changes
 * - Viewing admin action history
 */

const express = require('express');
const auditController = require('../controllers/audit-controller');
const securityMiddleware = require('../middleware/security-middleware');

const router = express.Router();

// Apply authentication middleware to all audit routes
router.use(securityMiddleware.verifyToken);

// Get entity change history - accessible to admins and managers
router.get(
  '/history/:entityType/:entityId',
  securityMiddleware.checkPermission('audit', 'read'),
  auditController.getEntityHistory
);

// Get detailed change record - accessible to admins and managers
router.get(
  '/history/detail/:historyId',
  securityMiddleware.checkPermission('audit', 'read'),
  auditController.getHistoryDetail
);

// Roll back changes - admin only
router.post(
  '/rollback/:historyId',
  securityMiddleware.checkPermission('audit', 'update'),
  auditController.rollbackChanges
);

// Get admin action history - admin only
router.get(
  '/admin-actions',
  securityMiddleware.checkPermission('audit', 'read'),
  auditController.getAdminActionHistory
);

// Get admin action detail - admin only
router.get(
  '/admin-actions/:actionId',
  securityMiddleware.checkPermission('audit', 'read'),
  auditController.getAdminActionDetail
);

module.exports = router;