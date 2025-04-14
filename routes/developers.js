const express = require('express');
const router = express.Router();
const developerController = require('../controllers/developerController');

// GET all developers
router.get('/', developerController.getDevelopers);

// POST create new developer
router.post('/', developerController.createDeveloper);

module.exports = router;