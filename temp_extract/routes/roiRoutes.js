const express = require('express');
const router = express.Router();
const roiController = require('../controllers/roiController');
const authMiddleware = require('../middleware/auth');

router.get('/summary', authMiddleware, roiController.getRoiSummary);
router.post('/:userId', authMiddleware, roiController.updateUserRoi);

module.exports = router;
