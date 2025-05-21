/**
 * AI Insights Routes Module
 * 
 * Defines API endpoints for the AI-Powered Insight Engine:
 * - ROI trend predictions
 * - Market dynamics analysis
 * - Investor churn risk prediction
 * - Anomaly detection
 * - Personalized investment recommendations
 */

const express = require('express');
const aiInsightEngine = require('../services/ai-insight-engine');
const securityMiddleware = require('../middleware/security-middleware');

const router = express.Router();

// Apply authentication to all insights routes
router.use(securityMiddleware.verifyToken);

// Get ROI trend predictions
router.get(
  '/roi-trends',
  async (req, res) => {
    try {
      const { propertyId, months } = req.query;
      
      const result = await aiInsightEngine.predictROITrends(
        propertyId ? parseInt(propertyId) : null,
        months ? parseInt(months) : 6
      );
      
      res.status(200).json({
        status: result.success ? 'success' : 'error',
        data: result
      });
    } catch (error) {
      console.error('Error getting ROI trends:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Get market dynamics analysis
router.get(
  '/market-dynamics',
  async (req, res) => {
    try {
      const { timeframe, propertyType, minInvestors } = req.query;
      
      const result = await aiInsightEngine.analyzeMarketDynamics({
        timeframe,
        propertyType,
        minInvestors: minInvestors ? parseInt(minInvestors) : 5
      });
      
      res.status(200).json({
        status: result.success ? 'success' : 'error',
        data: result
      });
    } catch (error) {
      console.error('Error getting market dynamics:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Get investor churn risk (admin only)
router.get(
  '/investor-churn',
  securityMiddleware.checkPermission('admin', 'read'),
  async (req, res) => {
    try {
      const { thresholdDays, minInvestments, limit } = req.query;
      
      const result = await aiInsightEngine.predictInvestorChurn({
        thresholdDays: thresholdDays ? parseInt(thresholdDays) : 90,
        minInvestments: minInvestments ? parseInt(minInvestments) : 1,
        limit: limit ? parseInt(limit) : 100
      });
      
      res.status(200).json({
        status: result.success ? 'success' : 'error',
        data: result
      });
    } catch (error) {
      console.error('Error predicting investor churn:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Get anomaly detection (admin only)
router.get(
  '/anomalies',
  securityMiddleware.checkPermission('admin', 'read'),
  async (req, res) => {
    try {
      const { lookbackDays, confidenceThreshold, significanceLevel } = req.query;
      
      const result = await aiInsightEngine.detectAnomalies({
        lookbackDays: lookbackDays ? parseInt(lookbackDays) : 90,
        confidenceThreshold: confidenceThreshold ? parseFloat(confidenceThreshold) : 0.9,
        significanceLevel: significanceLevel ? parseFloat(significanceLevel) : 3
      });
      
      res.status(200).json({
        status: result.success ? 'success' : 'error',
        data: result
      });
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Get investment recommendations for a user
router.get(
  '/recommendations',
  async (req, res) => {
    try {
      const { limit, includeReasons } = req.query;
      const userId = req.user.id;
      
      const result = await aiInsightEngine.generateRecommendations(userId, {
        limit: limit ? parseInt(limit) : 5,
        includeReasons: includeReasons !== 'false'
      });
      
      res.status(200).json({
        status: result.success ? 'success' : 'error',
        data: result
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Get AI-powered investment insights (admin + investor)
router.post(
  '/analysis',
  async (req, res) => {
    try {
      const { question } = req.body;
      
      const result = await aiInsightEngine.generateAIInsights({
        question
      });
      
      res.status(200).json({
        status: result.success ? 'success' : 'error',
        data: result
      });
    } catch (error) {
      console.error('Error generating AI insights:', error);
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

module.exports = router;