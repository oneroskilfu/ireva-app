import express from 'express';
import { milestoneEscrowController } from '../controllers/milestone-escrow-controller';
import { authMiddleware, ensureAdmin } from '../auth-jwt';

const router = express.Router();

/**
 * @route GET /api/milestone-escrow/networks
 * @desc Get supported networks
 * @access Public
 */
router.get('/networks', milestoneEscrowController.getSupportedNetworks);

/**
 * @route GET /api/milestone-escrow/:escrowId/:network
 * @desc Get details of an escrow
 * @access Public
 */
router.get('/:escrowId/:network', milestoneEscrowController.getEscrowDetails);

/**
 * @route GET /api/milestone-escrow/readiness/:escrowId/:milestoneIndex/:network
 * @desc Check if a milestone is ready for release
 * @access Public
 */
router.get('/readiness/:escrowId/:milestoneIndex/:network', milestoneEscrowController.checkMilestoneReadiness);

/**
 * User authenticated routes
 */

/**
 * @route POST /api/milestone-escrow/create
 * @desc Create a new milestone escrow
 * @access Private
 */
router.post('/create', authMiddleware, milestoneEscrowController.createMilestoneEscrow);

/**
 * @route GET /api/milestone-escrow/user
 * @desc Get all milestones for a user
 * @access Private
 */
router.get('/user', authMiddleware, milestoneEscrowController.getUserMilestones);

/**
 * Admin only routes
 */

/**
 * @route POST /api/milestone-escrow/release
 * @desc Release funds for a completed milestone
 * @access Admin only
 */
router.post('/release', ensureAdmin, milestoneEscrowController.releaseMilestone);

export default router;