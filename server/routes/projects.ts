import { Router, Request, Response } from 'express';
import { db } from '../db';
import { properties, insertPropertySchema, insertProjectSchema } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken, authMiddleware, ensureAdmin } from '../auth-jwt';
import { ZodError } from 'zod';
import AdminLogger from '../services/adminLogger';

const projectsRouter = Router();

/**
 * @route GET /api/projects
 * @desc Get all projects (public/investor)
 * @access Public
 */
projectsRouter.get('/', async (req: Request, res: Response) => {
  try {
    console.log("API request received: GET /api/projects with query:", req.query);
    
    const type = req.query.type as string | undefined;
    const location = req.query.location as string | undefined;
    const search = req.query.search as string | undefined;
    const tier = req.query.tier as string | undefined;

    // Base query
    let query = db.select().from(properties);

    // Apply filters
    if (type && type !== "all") {
      query = query.where(eq(properties.type, type));
    }
    
    if (location && location !== "all") {
      query = query.where(eq(properties.location, location));
    }
    
    // Execute query
    let projects = await query;

    // Apply search filter (client-side filtering for now)
    if (search) {
      const searchLower = search.toLowerCase();
      projects = projects.filter(project => 
        project.name.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.location.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply tier filter (client-side filtering for now)
    if (tier && tier !== "all") {
      projects = projects.filter(project => project.tier === tier);
    }

    console.log(`Found ${projects.length} projects matching criteria`);
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ 
      message: "Failed to fetch projects", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route GET /api/projects/:id
 * @desc Get a specific project by ID
 * @access Public
 */
projectsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const [project] = await db.select()
      .from(properties)
      .where(eq(properties.id, projectId));
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ 
      message: "Failed to fetch project", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route POST /api/projects
 * @desc Create a new project
 * @access Admin only
 */
projectsRouter.post('/', verifyToken, ensureAdmin, async (req: Request, res: Response) => {
  try {
    console.log("Creating new project with data:", req.body);
    
    // Validate request body against schema
    const validatedData = insertProjectSchema.parse(req.body);
    
    // Insert new project
    const [newProject] = await db.insert(properties)
      .values(validatedData)
      .returning();
    
    // Log admin action
    await AdminLogger.logAction(
      req.jwtPayload?.id as number,
      'create_project',
      `Created new project "${newProject.name}"`,
      { projectId: newProject.id, projectData: validatedData },
      req
    );
    
    res.status(201).json({
      message: "Project created successfully",
      project: newProject
    });
  } catch (error) {
    console.error("Error creating project:", error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to create project", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route PUT /api/projects/:id
 * @desc Update a project
 * @access Admin only
 */
projectsRouter.put('/:id', verifyToken, ensureAdmin, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    // Check if project exists
    const [existingProject] = await db.select()
      .from(properties)
      .where(eq(properties.id, projectId));
    
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Validate request body against schema
    const validatedData = insertProjectSchema.partial().parse(req.body);
    
    // Update project
    const [updatedProject] = await db.update(properties)
      .set(validatedData)
      .where(eq(properties.id, projectId))
      .returning();
    
    // Log admin action
    await AdminLogger.logAction(
      req.jwtPayload?.id as number,
      'update_project',
      `Updated project "${updatedProject.name}"`,
      { projectId, updates: validatedData },
      req
    );
    
    res.json({
      message: "Project updated successfully",
      project: updatedProject
    });
  } catch (error) {
    console.error("Error updating project:", error);
    
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to update project", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

/**
 * @route DELETE /api/projects/:id
 * @desc Delete a project
 * @access Admin only
 */
projectsRouter.delete('/:id', verifyToken, ensureAdmin, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    // Check if project exists
    const [existingProject] = await db.select()
      .from(properties)
      .where(eq(properties.id, projectId));
    
    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    // Delete project
    await db.delete(properties)
      .where(eq(properties.id, projectId));
    
    // Log admin action
    await AdminLogger.logAction(
      req.jwtPayload?.id as number,
      'delete_project',
      `Deleted project "${existingProject.name}"`,
      { projectId, projectName: existingProject.name },
      req
    );
    
    res.json({
      message: "Project deleted successfully",
      projectId
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ 
      message: "Failed to delete project", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
});

export default projectsRouter;