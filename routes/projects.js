const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// GET all projects
router.get('/', projectController.getProjects);

// POST create new project
router.post('/', projectController.createProject);

module.exports = router;