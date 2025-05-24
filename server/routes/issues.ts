import { Router, Request, Response } from 'express';
import { db } from '../db';
import { verifyToken } from '../auth-jwt';
import { 
  issues, 
  issueComments, 
  insertIssueSchema, 
  insertIssueCommentSchema, 
  users,
  adminLogs
} from '@shared/schema';
import { z } from 'zod';
import { eq, desc, and, sql } from 'drizzle-orm';

const router = Router();

// Request validation schema for creating an issue
const createIssueSchema = z.object({
  title: z.string().min(3, "Title is required and must be at least 3 characters"),
  description: z.string().min(10, "Description is required and must be at least 10 characters"),
  category: z.string().optional(),
  priority: z.string().optional(),
});

// Request validation schema for updating an issue
const updateIssueSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  priority: z.string().optional(),
  assignedTo: z.number().optional().nullable(),
  category: z.string().optional()
});

// Request validation schema for adding a comment
const addCommentSchema = z.object({
  comment: z.string().min(1, "Comment text is required"),
  isInternal: z.boolean().optional().default(false)
});

// Create a new issue
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.jwtPayload?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate request data
    const validatedData = createIssueSchema.parse(req.body);
    
    // Create the issue
    const [issue] = await db.insert(issues)
      .values({
        title: validatedData.title,
        description: validatedData.description,
        userId: req.jwtPayload.id,
        status: "open",
        priority: validatedData.priority || "medium",
        category: validatedData.category || "general",
        createdAt: new Date()
      })
      .returning();
    
    // Log an admin action if the user is an admin
    if (req.jwtPayload.role === 'admin' || req.jwtPayload.role === 'super_admin') {
      try {
        await db.insert(adminLogs)
          .values({
            adminId: req.jwtPayload.id,
            action: "create",
            targetType: "issue",
            targetId: issue.id,
            description: `Created issue: ${issue.title}`,
            timestamp: new Date()
          });
      } catch (logError) {
        console.error('Error logging admin action:', logError);
        // Continue anyway as this is just logging
      }
    }
    
    res.status(201).json({ 
      message: 'Issue created successfully',
      issue
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid issue data', 
        errors: error.errors 
      });
    }
    
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Failed to create issue' });
  }
});

// Get all issues (admin-only endpoint)
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    // Check admin permissions for viewing all issues
    const isAdmin = req.jwtPayload?.role === 'admin' || req.jwtPayload?.role === 'super_admin';
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Query parameters
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;
    const priority = req.query.priority as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Basic query
    let query = db.select({
      issue: issues,
      reporter: {
        id: users.id,
        username: users.username,
      }
    })
    .from(issues)
    .leftJoin(users, eq(issues.userId, users.id))
    .orderBy(desc(issues.createdAt))
    .limit(limit);
    
    // Apply filters
    const conditions = [];
    
    // Non-admins can only see their own issues
    if (!isAdmin) {
      conditions.push(eq(issues.userId, userId));
    }
    
    if (status) {
      conditions.push(eq(issues.status, status));
    }
    
    if (category) {
      conditions.push(eq(issues.category, category));
    }
    
    if (priority) {
      conditions.push(eq(issues.priority, priority));
    }
    
    // Apply where clause if we have conditions
    if (conditions.length > 0) {
      if (conditions.length === 1) {
        query = query.where(conditions[0]);
      } else {
        query = query.where(and(...conditions));
      }
    }
    
    const result = await query;
    
    const issuesWithCommentCount = await Promise.all(
      result.map(async (item) => {
        const commentCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(issueComments)
          .where(eq(issueComments.issueId, item.issue.id));
        
        return {
          ...item.issue,
          reporter: item.reporter,
          commentCount: commentCount[0]?.count || 0
        };
      })
    );
    
    res.json(issuesWithCommentCount);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
});

// Get a specific issue by ID
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const isAdmin = req.jwtPayload?.role === 'admin' || req.jwtPayload?.role === 'super_admin';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const issueId = parseInt(req.params.id);
    
    // Get the issue with reporter info
    const issueResult = await db
      .select({
        issue: issues,
        reporter: {
          id: users.id,
          username: users.username,
        }
      })
      .from(issues)
      .leftJoin(users, eq(issues.userId, users.id))
      .where(eq(issues.id, issueId));
    
    if (!issueResult.length) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    const issue = issueResult[0].issue;
    const reporter = issueResult[0].reporter;
    
    // Check if user has access to this issue (admins or issue owner)
    if (!isAdmin && issue.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get the comments for this issue
    const commentsResult = await db
      .select({
        comment: issueComments,
        commenter: {
          id: users.id,
          username: users.username,
        }
      })
      .from(issueComments)
      .leftJoin(users, eq(issueComments.userId, users.id))
      .where(eq(issueComments.issueId, issueId))
      .orderBy(issueComments.createdAt);
    
    // Filter internal comments for non-admins
    const comments = commentsResult.map(item => ({
      ...item.comment,
      commenter: item.commenter
    })).filter(comment => isAdmin || !comment.isInternal);
    
    // Get assignee info if assigned
    let assignee = null;
    if (issue.assignedTo) {
      const assigneeResult = await db
        .select({
          id: users.id,
          username: users.username,
        })
        .from(users)
        .where(eq(users.id, issue.assignedTo));
        
      if (assigneeResult.length) {
        assignee = assigneeResult[0];
      }
    }
    
    res.json({
      ...issue,
      reporter,
      assignee,
      comments
    });
    
  } catch (error) {
    console.error('Error fetching issue details:', error);
    res.status(500).json({ message: 'Failed to fetch issue details' });
  }
});

// Update an issue
router.patch('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const isAdmin = req.jwtPayload?.role === 'admin' || req.jwtPayload?.role === 'super_admin';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const issueId = parseInt(req.params.id);
    
    // Get the issue first to check permissions
    const [issue] = await db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId));
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    // Only admins can update status, assignment, etc.
    // Regular users who created the issue can only update if it's still open
    if (!isAdmin && (issue.userId !== userId || issue.status !== 'open')) {
      return res.status(403).json({ 
        message: 'Only admins can update issues that are in progress or closed, or issues created by other users' 
      });
    }
    
    // Validate update data
    const validatedData = updateIssueSchema.parse(req.body);
    
    // Regular users can't assign issues
    if (!isAdmin && validatedData.assignedTo !== undefined) {
      return res.status(403).json({ message: 'Only admins can assign issues' });
    }
    
    // Update the issue
    const [updatedIssue] = await db
      .update(issues)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(issues.id, issueId))
      .returning();
    
    // Log admin action
    if (isAdmin) {
      try {
        const changes = Object.entries(validatedData)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
          
        await db.insert(adminLogs)
          .values({
            adminId: userId,
            action: "update",
            targetType: "issue",
            targetId: issueId,
            description: `Updated issue #${issueId}: ${changes}`,
            timestamp: new Date()
          });
      } catch (logError) {
        console.error('Error logging admin action:', logError);
        // Continue anyway as this is just logging
      }
    }
    
    // If the status has changed, automatically add a comment
    if (validatedData.status && validatedData.status !== issue.status) {
      try {
        await db.insert(issueComments)
          .values({
            issueId,
            userId,
            comment: `Status changed from ${issue.status} to ${validatedData.status}`,
            createdAt: new Date(),
            isInternal: false
          });
      } catch (commentError) {
        console.error('Error adding automatic status change comment:', commentError);
        // Continue anyway as this is just a convenience feature
      }
    }
    
    res.json({
      message: 'Issue updated successfully',
      issue: updatedIssue
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid update data', 
        errors: error.errors 
      });
    }
    
    console.error('Error updating issue:', error);
    res.status(500).json({ message: 'Failed to update issue' });
  }
});

// Add a comment to an issue
router.post('/:id/comments', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    const isAdmin = req.jwtPayload?.role === 'admin' || req.jwtPayload?.role === 'super_admin';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const issueId = parseInt(req.params.id);
    
    // Get the issue first to check permissions
    const [issue] = await db
      .select()
      .from(issues)
      .where(eq(issues.id, issueId));
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    // Only allow the reporter or admins to comment
    if (!isAdmin && issue.userId !== userId) {
      return res.status(403).json({ message: 'Only the reporter or admins can comment on this issue' });
    }
    
    // Validate comment data
    const validatedData = addCommentSchema.parse(req.body);
    
    // Only admins can add internal comments
    if (validatedData.isInternal && !isAdmin) {
      return res.status(403).json({ message: 'Only admins can add internal comments' });
    }
    
    // Add the comment
    const [comment] = await db.insert(issueComments)
      .values({
        issueId,
        userId,
        comment: validatedData.comment,
        createdAt: new Date(),
        isInternal: validatedData.isInternal || false
      })
      .returning();
    
    // Get commenter info for the response
    const [commenter] = await db
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, userId));
    
    // If this is an admin comment and the issue isn't in progress, update it
    if (isAdmin && issue.status === 'open' && !validatedData.isInternal) {
      await db.update(issues)
        .set({
          status: 'in_progress',
          updatedAt: new Date()
        })
        .where(eq(issues.id, issueId));
    }
    
    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        ...comment,
        commenter
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid comment data', 
        errors: error.errors 
      });
    }
    
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

export default router;