const express = require('express');
const Project = require('../models/Project');
const verifyToken = require('../middleware/authMiddleware');
const { verifyAdmin, verifyRole, verifyAnyOf } = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * @route GET /api/projects
 * @desc Get all projects
 * @access Public (for browsing) or Private (for detailed info)
 */
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/projects/:id
 * @desc Get project by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/projects
 * @desc Create a new project
 * @access Admin only
 */
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/projects/:id
 * @desc Update a project
 * @access Admin only
 */
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/projects/:id
 * @desc Delete a project
 * @access Admin only
 */
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/projects/featured
 * @desc Get featured projects
 * @access Public
 */
router.get('/featured', async (req, res) => {
  try {
    const featuredProjects = await Project.find({ featured: true }).limit(3);
    res.json(featuredProjects);
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;