const express = require('express');
const router = express.Router();
const { getDevelopers, createDeveloper } = require('../controllers/developerController');

router.get('/', getDevelopers);
router.post('/', createDeveloper);

module.exports = router;