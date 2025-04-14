const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');

// Middleware to authenticate JWT token
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'developer') {
    return res.status(403).json({ msg: 'Access denied. Admin or developer only.' });
  }
  next();
};

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects
// @desc    Create a project
// @access  Admin or developer
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      developer,
      location,
      projectType,
      timeline,
      financials,
      images,
      documents,
      risks
    } = req.body;

    const newProject = new Project({
      name,
      description,
      developer,
      location,
      projectType,
      timeline,
      financials,
      images,
      documents,
      risks,
      createdBy: req.user.id
    });

    const project = await newProject.save();
    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Admin or developer
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    // Update fields
    const updateFields = req.body;
    
    // Update project with new fields
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    res.json(updatedProject);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only admin can delete projects
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    await project.remove();
    
    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/:id/update
// @desc    Add a project update
// @access  Admin or developer
router.post('/:id/update', auth, adminAuth, async (req, res) => {
  try {
    const { title, content, images } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    const newUpdate = {
      title,
      content,
      images,
      date: Date.now()
    };
    
    project.updates.unshift(newUpdate);
    
    await project.save();
    
    res.json(project.updates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;