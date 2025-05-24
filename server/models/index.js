const { db } = require('../db');
const {
  users,
  properties,
  investments,
  kycDocuments,
  notifications,
  directMessages,
  educationalResources,
  paymentTransactions,
  forumThreads,
  forumComments,
  userBadges
} = require('../../shared/schema');

// Export all database models for easy access in controllers
module.exports = {
  db,
  // Tables
  users,
  properties,
  investments,
  kycDocuments,
  notifications,
  directMessages,
  educationalResources,
  paymentTransactions,
  forumThreads,
  forumComments,
  userBadges
};