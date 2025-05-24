import express from 'express';
import { ensureAdmin } from '../auth-jwt';
import {
  getAllSegments,
  getSegmentById,
  createSegment,
  updateSegment,
  deleteSegment,
  getUsersForSegment,
  getAllCommunications,
  getCommunicationById,
  createCommunication,
  updateCommunication,
  deleteCommunication,
  sendCommunicationHandler,
  getCommunicationLogs
} from '../controllers/crmController';

const router = express.Router();

// Ensure all CRM routes are protected by admin authentication
router.use(ensureAdmin);

// User Segments Routes
router.get('/segments', getAllSegments);
router.get('/segments/:id', getSegmentById);
router.post('/segments', createSegment);
router.put('/segments/:id', updateSegment);
router.delete('/segments/:id', deleteSegment);
router.get('/segments/:id/users', getUsersForSegment);

// Communications Routes
router.get('/communications', getAllCommunications);
router.get('/communications/:id', getCommunicationById);
router.post('/communications', createCommunication);
router.put('/communications/:id', updateCommunication);
router.delete('/communications/:id', deleteCommunication);
router.post('/communications/:id/send', sendCommunicationHandler);
router.get('/communications/:id/logs', getCommunicationLogs);

export const crmRouter = router;
export default router;