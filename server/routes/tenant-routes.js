/**
 * Tenant Routes
 * 
 * API routes for tenant management in the iREVA platform.
 * These routes provide endpoints for creating, managing, and interacting with tenants.
 */

const express = require('express');
const router = express.Router();
const TenantController = require('../controllers/tenant-controller');
const { requireTenant, verifyTenantUser, requireTenantRole } = require('../middleware/tenant-middleware');

// Public routes
router.get('/invitation/:token', TenantController.getInvitationByToken);

// Authenticated routes
router.get('/user', TenantController.getUserTenants);
router.get('/current', TenantController.getCurrentTenant);
router.post('/invitation/:token/accept', TenantController.acceptInvitation);
router.post('/:id/default', TenantController.setDefaultTenant);

// Tenant-specific routes (require tenant context)
router.get('/properties', requireTenant, TenantController.getTenantProperties);

// Admin-only routes
router.post('/', requireTenantRole(['admin']), TenantController.createTenant);
router.get('/', requireTenantRole(['admin']), TenantController.listTenants);
router.get('/:id', requireTenantRole(['admin']), TenantController.getTenant);
router.put('/:id', requireTenantRole(['admin']), TenantController.updateTenant);
router.delete('/:id', requireTenantRole(['admin']), TenantController.deleteTenant);
router.post('/:id/users', requireTenantRole(['admin']), TenantController.addUser);
router.get('/:id/users', requireTenantRole(['admin']), TenantController.getUsers);
router.post('/:id/invitations', requireTenantRole(['admin']), TenantController.createInvitation);

module.exports = router;