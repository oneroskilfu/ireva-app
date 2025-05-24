import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project, { IProject } from '../models/Project';
import Investment from '../models/Investment';

// Get all projects
export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const query: any = {};
    
    // Apply filters if provided
    if (req.query.type && req.query.type !== 'all') {
      query.type = req.query.type;
    }
    
    if (req.query.location && req.query.location !== 'all') {
      query.location = req.query.location;
    }
    
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }
    
    // Search term
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { location: searchRegex }
      ];
    }
    
    // Accreditation check
    if (req.query.accredited === 'false') {
      query.accreditedOnly = false;
    }
    
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .limit(req.query.limit ? parseInt(req.query.limit as string) : 50);
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ 
      message: 'Failed to fetch projects',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get a single project by ID
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'investments',
        select: 'amount status earnings createdAt -property'
      });
    
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ 
      message: 'Failed to fetch project',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Create a new project (admin only)
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add current user as creator
    const projectData: Partial<IProject> = {
      ...req.body,
      createdBy: new mongoose.Types.ObjectId(req.user?.id)
    };
    
    const project = await Project.create(projectData);
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({
      message: 'Failed to create project',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Update a project (admin only)
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({
      message: 'Failed to update project',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Delete a project (admin only)
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if there are any active investments
    const activeInvestments = await Investment.countDocuments({
      property: new mongoose.Types.ObjectId(req.params.id),
      status: { $in: ['pending', 'active'] }
    });
    
    if (activeInvestments > 0) {
      res.status(400).json({
        message: 'Cannot delete project with active investments'
      });
      return;
    }
    
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({
      message: 'Failed to delete project',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Update project ROI (admin only)
export const updateProjectROI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roiPercentage, notes } = req.body;
    
    if (!roiPercentage) {
      res.status(400).json({ message: 'ROI percentage is required' });
      return;
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    
    // Update the project's target return
    project.targetReturn = roiPercentage.toString();
    
    // Add construction update if notes are provided
    if (notes) {
      if (!project.constructionUpdates) {
        project.constructionUpdates = [];
      }
      
      project.constructionUpdates.push({
        date: new Date(),
        title: 'ROI Update',
        description: notes,
        images: []
      });
    }
    
    await project.save();
    
    // Find all active investments for this project
    const investments = await Investment.find({
      property: project._id,
      status: 'active'
    });
    
    // Update the ROI for all active investments
    const updatePromises = investments.map(investment => {
      investment.roi = parseFloat(roiPercentage);
      return investment.save();
    });
    
    await Promise.all(updatePromises);
    
    res.json({
      message: 'ROI updated successfully',
      project,
      investmentsUpdated: investments.length
    });
  } catch (error) {
    console.error('Error updating project ROI:', error);
    res.status(500).json({
      message: 'Failed to update project ROI',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get project investments (admin only)
export const getProjectInvestments = async (req: Request, res: Response): Promise<void> => {
  try {
    const investments = await Investment.find({
      property: new mongoose.Types.ObjectId(req.params.id)
    }).populate('investor', 'username email firstName lastName');
    
    res.json(investments);
  } catch (error) {
    console.error('Error fetching project investments:', error);
    res.status(500).json({
      message: 'Failed to fetch project investments',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};