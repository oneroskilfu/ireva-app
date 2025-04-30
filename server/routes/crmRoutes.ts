import express from 'express';
import * as crmController from '../controllers/crmController';
import { adminAuth } from '../middleware/auth';

const router = express.Router();

// Protected routes (admin only)
router.get('/segments', adminAuth, crmController.getUserSegments);
router.post('/segments', adminAuth, crmController.createUserSegment);
router.get('/segments/:segmentId/users', adminAuth, crmController.getUsersBySegment);

router.get('/communications', adminAuth, crmController.getCommunications);
router.post('/communications', adminAuth, crmController.createCommunication);
router.put('/communications/:communicationId', adminAuth, crmController.updateCommunication);
router.post('/communications/:communicationId/send', adminAuth, crmController.sendCommunication);
router.get('/communications/:communicationId/logs', adminAuth, crmController.getCommunicationLogs);
router.get('/communications/search', adminAuth, crmController.searchCommunications);

export default router;