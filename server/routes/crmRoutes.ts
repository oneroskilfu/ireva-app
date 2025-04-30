import express from 'express';
import { verifyToken, ensureAdmin } from '../auth-jwt';
import * as crmController from '../controllers/crmController';

export const crmRouter = express.Router();

// Middleware
crmRouter.use(verifyToken);
crmRouter.use(ensureAdmin);

/**
 * Segment Routes
 */
// Get all segments
crmRouter.get('/segments', crmController.getAllSegments);

// Get segment by ID
crmRouter.get('/segments/:id', crmController.getSegmentById);

// Create a new segment
crmRouter.post('/segments', crmController.createSegment);

// Update a segment
crmRouter.put('/segments/:id', crmController.updateSegment);

// Delete a segment
crmRouter.delete('/segments/:id', crmController.deleteSegment);

// Get users for a segment
crmRouter.get('/segments/:id/users', crmController.getUsersForSegment);

/**
 * Communication Routes
 */
// Get all communications with optional filters
crmRouter.get('/communications', crmController.getAllCommunications);

// Get communication by ID
crmRouter.get('/communications/:id', crmController.getCommunicationById);

// Create a new communication
crmRouter.post('/communications', crmController.createCommunication);

// Update a communication
crmRouter.put('/communications/:id', crmController.updateCommunication);

// Delete a communication
crmRouter.delete('/communications/:id', crmController.deleteCommunication);

// Send a communication
crmRouter.post('/communications/:id/send', crmController.sendCommunicationHandler);

// Get logs for a communication
crmRouter.get('/communications/:id/logs', crmController.getCommunicationLogs);