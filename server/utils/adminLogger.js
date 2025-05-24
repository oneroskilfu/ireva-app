const Log = require('../models/Log');

/**
 * Create a log entry for admin actions
 * @param {string} type - Type of log (ROI, KYC, Project, Investment, User, Wallet, System)
 * @param {string} action - Action performed
 * @param {string} details - Human-readable details
 * @param {Object} adminUser - Admin user object
 * @param {Object} metadata - Additional JSON data to store
 * @returns {Promise<Object>} Created log entry
 */
const logAdminAction = async (type, action, details, adminUser, metadata = {}) => {
  try {
    if (!adminUser || !adminUser._id) {
      console.warn('Cannot log admin action: No admin user provided');
      return null;
    }

    const log = new Log({
      type,
      action,
      details,
      adminId: adminUser._id,
      metadata
    });

    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging admin action:', error);
    return null;
  }
};

/**
 * Get logs for a specific type
 * @param {string} type - Type of log to retrieve
 * @param {number} limit - Maximum number of logs to retrieve
 * @returns {Promise<Array>} Array of log entries
 */
const getLogsByType = async (type, limit = 100) => {
  return await Log.find({ type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('adminId', 'firstName lastName username email')
    .exec();
};

/**
 * Get logs by admin user
 * @param {string} adminId - Admin user ID
 * @param {number} limit - Maximum number of logs to retrieve
 * @returns {Promise<Array>} Array of log entries
 */
const getLogsByAdmin = async (adminId, limit = 100) => {
  return await Log.find({ adminId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

/**
 * Get all recent logs
 * @param {number} limit - Maximum number of logs to retrieve
 * @returns {Promise<Array>} Array of log entries
 */
const getRecentLogs = async (limit = 100) => {
  return await Log.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('adminId', 'firstName lastName username email')
    .exec();
};

module.exports = {
  logAdminAction,
  getLogsByType,
  getLogsByAdmin,
  getRecentLogs
};