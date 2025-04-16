const express = require('express');
const { db } = require('../db');
const { 
  users, 
  properties, 
  investments, 
  kycDocuments,
  educationalResources,
  paymentTransactions
} = require('../../shared/schema');
const { eq, desc, asc, and, sql } = require('drizzle-orm');
const { ensureAdmin, ensureSuperAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/admin/dashboard/stats
 * @desc Get admin dashboard statistics
 * @access Admin only
 */
router.get('/dashboard/stats', ensureAdmin, async (req, res) => {
  try {
    // Total users count
    const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
    
    // Total active investments count and value
    const [investmentStats] = await db.select({
      count: sql`count(*)`,
      totalValue: sql`sum(amount)`,
      averageValue: sql`avg(amount)`
    }).from(investments);
    
    // Total properties count and funding stats
    const [propertyStats] = await db.select({
      count: sql`count(*)`,
      totalFunding: sql`sum(total_funding)`,
      currentFunding: sql`sum(current_funding)`,
      fundingPercentage: sql`sum(current_funding) * 100.0 / nullif(sum(total_funding), 0)`
    }).from(properties);
    
    // Pending KYC approvals count
    const [kycPendingCount] = await db.select({ count: sql`count(*)` })
      .from(kycDocuments)
      .where(eq(kycDocuments.status, 'pending'));
    
    res.json({
      userCount: userCount.count,
      investmentCount: investmentStats.count,
      totalInvestmentValue: investmentStats.totalValue || 0,
      averageInvestmentValue: investmentStats.averageValue || 0,
      propertyCount: propertyStats.count,
      totalPropertyFunding: propertyStats.totalFunding || 0,
      currentPropertyFunding: propertyStats.currentFunding || 0,
      fundingPercentage: propertyStats.fundingPercentage || 0,
      pendingKycCount: kycPendingCount.count
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/admin/users
 * @desc Get all users with pagination
 * @access Admin only
 */
router.get('/users', ensureAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query;
    const offset = (page - 1) * limit;
    
    // Determine sort column and order
    const sortColumn = users[sort] || users.createdAt;
    const sortOrder = order === 'asc' ? asc(sortColumn) : desc(sortColumn);
    
    // Query users with pagination
    const usersList = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      phoneNumber: users.phoneNumber,
      createdAt: users.createdAt,
      kycStatus: users.kycStatus
    })
    .from(users)
    .orderBy(sortOrder)
    .limit(limit)
    .offset(offset);
    
    // Get total count for pagination
    const [{ count }] = await db.select({ count: sql`count(*)` }).from(users);
    
    res.json({
      users: usersList,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/admin/users/:id
 * @desc Get single user details with investments
 * @access Admin only
 */
router.get('/users/:id', ensureAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        investments: {
          with: {
            property: true
          }
        },
        kycDocuments: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive data
    delete user.password;
    
    res.json(user);
  } catch (error) {
    console.error('Admin user details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PATCH /api/admin/users/:id/role
 * @desc Update user role
 * @access Super admin only
 */
router.patch('/users/:id/role', ensureSuperAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Update user role
    const [updatedUser] = await db.update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        role: users.role
      });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/admin/kyc/pending
 * @desc Get pending KYC submissions
 * @access Admin only
 */
router.get('/kyc/pending', ensureAdmin, async (req, res) => {
  try {
    const pendingKyc = await db.query.kycDocuments.findMany({
      where: eq(kycDocuments.status, 'pending'),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: desc(kycDocuments.submittedAt)
    });
    
    res.json(pendingKyc);
  } catch (error) {
    console.error('Admin pending KYC error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PATCH /api/admin/kyc/:userId/verify
 * @desc Approve or reject KYC submission
 * @access Admin only
 */
router.patch('/kyc/:userId/verify', ensureAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { status, rejectionReason } = req.body;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Update KYC document status
    const [updatedKyc] = await db.update(kycDocuments)
      .set({ 
        status, 
        verifiedAt: status === 'verified' ? new Date() : null,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
        verifiedBy: req.user.id
      })
      .where(eq(kycDocuments.userId, userId))
      .returning();
    
    if (!updatedKyc) {
      return res.status(404).json({ message: 'KYC document not found' });
    }
    
    // Also update user KYC status
    await db.update(users)
      .set({ kycStatus: status })
      .where(eq(users.id, userId));
    
    res.json(updatedKyc);
  } catch (error) {
    console.error('Admin KYC verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/admin/properties
 * @desc Get all properties with investment stats
 * @access Admin only
 */
router.get('/properties', ensureAdmin, async (req, res) => {
  try {
    // Get all properties with related investments stats
    const propertiesWithStats = await db.query.properties.findMany({
      with: {
        investments: true
      }
    });
    
    // Calculate additional stats
    const enrichedProperties = propertiesWithStats.map(property => {
      const totalInvestors = new Set(property.investments.map(inv => inv.userId)).size;
      const totalInvestment = property.investments.reduce((sum, inv) => sum + inv.amount, 0);
      const fundingPercentage = property.totalFunding > 0 
        ? (totalInvestment / property.totalFunding) * 100 
        : 0;
      
      return {
        ...property,
        stats: {
          totalInvestors,
          totalInvestment,
          fundingPercentage
        }
      };
    });
    
    res.json(enrichedProperties);
  } catch (error) {
    console.error('Admin properties list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// More admin routes would follow...

module.exports = router;