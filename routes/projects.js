const express = require('express');
const Project = require('../models/Project');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});

router.post('/', verifyToken, async (req, res) => {
  const project = new Project(req.body);
  await project.save();
  res.json(project);
});

module.exports = router;