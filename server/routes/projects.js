const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Property = require('../models/Property');
const { auth, admin, developer } = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Query parameters for filtering
    const { status, type, city, minBudget, maxBudget } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.projectType = type;
    if (city) filter['location.city'] = city;
    
    // Budget range filter
    if (minBudget || maxBudget) {
      filter['financials.totalBudget'] = {};
      if (minBudget) filter['financials.totalBudget'].$gte = Number(minBudget);
      if (maxBudget) filter['financials.totalBudget'].$lte = Number(maxBudget);
    }
    
    const projects = await Project.find(filter).sort({ createdAt: -1 });
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
      return res.status(404).send('Project not found');
    }
    
    res.json(project);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).send('Project not found');
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects
// @desc    Create a project
// @access  Admin or developer
router.post('/', auth, developer, async (req, res) => {
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
      mainImage,
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
      mainImage,
      documents,
      risks,
      createdBy: req.user._id
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
router.put('/:id', auth, developer, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).send('Project not found');
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
      return res.status(404).send('Project not found');
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Admin only
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).send('Project not found');
    }
    
    await project.deleteOne();
    
    res.json({ message: 'Project removed successfully' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).send('Project not found');
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/:id/update
// @desc    Add a project update
// @access  Admin or developer
router.post('/:id/update', auth, developer, async (req, res) => {
  try {
    const { title, content, images } = req.body;
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).send('Project not found');
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

// BULK OPERATIONS

// @route   POST /api/projects/bulk/create
// @desc    Create multiple projects at once
// @access  Admin only
router.post('/bulk/create', auth, admin, async (req, res) => {
  try {
    const { projects } = req.body;
    
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return res.status(400).send('No projects provided');
    }
    
    // Add creator ID to each project
    const projectsWithCreator = projects.map(project => ({
      ...project,
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // Insert many projects at once
    const insertedProjects = await Project.insertMany(projectsWithCreator);
    
    res.status(201).json({
      message: `${insertedProjects.length} projects created successfully`,
      projects: insertedProjects
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/projects/bulk/update
// @desc    Update multiple projects at once
// @access  Admin only
router.put('/bulk/update', auth, admin, async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).send('No updates provided');
    }
    
    const results = {
      success: [],
      failed: []
    };
    
    // Process each update
    for (const update of updates) {
      const { id, ...updateData } = update;
      
      if (!id) {
        results.failed.push({ id, reason: 'Missing project ID' });
        continue;
      }
      
      try {
        // Update project
        const updatedProject = await Project.findByIdAndUpdate(
          id,
          { 
            $set: { 
              ...updateData,
              updatedAt: new Date()
            } 
          },
          { new: true }
        );
        
        if (updatedProject) {
          results.success.push(updatedProject);
        } else {
          results.failed.push({ id, reason: 'Project not found' });
        }
      } catch (error) {
        results.failed.push({ id, reason: error.message });
      }
    }
    
    res.json({
      message: `${results.success.length} projects updated, ${results.failed.length} failed`,
      results
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/projects/bulk/delete
// @desc    Delete multiple projects at once
// @access  Admin only
router.delete('/bulk/delete', auth, admin, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send('No project IDs provided');
    }
    
    const result = await Project.deleteMany({ _id: { $in: ids } });
    
    res.json({
      message: `${result.deletedCount} projects deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/bulk/status
// @desc    Update status of multiple projects at once
// @access  Admin or developer
router.post('/bulk/status', auth, developer, async (req, res) => {
  try {
    const { projectIds, status } = req.body;
    
    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).send('No project IDs provided');
    }
    
    if (!status || !['Planning', 'Funding', 'Under Construction', 'Completed', 'On Hold', 'Cancelled'].includes(status)) {
      return res.status(400).send('Invalid status value');
    }
    
    const result = await Project.updateMany(
      { _id: { $in: projectIds } },
      { 
        $set: { 
          status, 
          updatedAt: new Date() 
        } 
      }
    );
    
    res.json({
      message: `Status updated for ${result.modifiedCount} projects`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/projects/bulk/properties/:projectId
// @desc    Get all properties for a project
// @access  Public
router.get('/bulk/properties/:projectId', async (req, res) => {
  try {
    const properties = await Property.find({ projectId: req.params.projectId });
    
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/projects/clone/:id
// @desc    Clone a project (create a copy)
// @access  Admin or developer
router.post('/clone/:id', auth, developer, async (req, res) => {
  try {
    const { newName, newDescription } = req.body;
    
    if (!newName) {
      return res.status(400).send('New project name is required');
    }
    
    // Find the source project
    const sourceProject = await Project.findById(req.params.id);
    
    if (!sourceProject) {
      return res.status(404).send('Source project not found');
    }
    
    // Create new project based on source
    const sourceObject = sourceProject.toObject();
    
    // Remove _id and update specific fields
    delete sourceObject._id;
    delete sourceObject.__v;
    
    const newProject = new Project({
      ...sourceObject,
      name: newName,
      description: newDescription || sourceObject.description,
      status: 'Planning', // Reset status
      financials: {
        ...sourceObject.financials,
        raisedAmount: 0,
        fundingProgress: 0
      },
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      properties: [], // Reset properties
      updates: [] // Reset updates
    });
    
    const savedProject = await newProject.save();
    
    res.status(201).json({
      message: 'Project cloned successfully',
      project: savedProject
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;