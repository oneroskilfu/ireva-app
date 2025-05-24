const express = require('express');
const { getEscrowProjects, getEscrowWalletBalance } = require('../controllers/adminController');
const { authMiddleware, ensureAdmin } = require('../auth-jwt');

const router = express.Router();

// Get all escrow projects
router.get('/escrow-projects', authMiddleware, ensureAdmin, getEscrowProjects);

// Get escrow wallet balance
router.get('/escrow-wallet-balance', authMiddleware, ensureAdmin, getEscrowWalletBalance);

module.exports = router;