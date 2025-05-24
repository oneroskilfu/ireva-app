import { Request, Response } from 'express';
import { db } from '../db';
import { faqs, insertFaqSchema } from '../../shared/schema';
import { eq, asc, desc, and, like } from 'drizzle-orm';
import { z } from 'zod';
import AdminLogger from '../services/adminLogger';

/**
 * Get all FAQs with optional filtering by category
 */
export async function getAllFaqs(req: Request, res: Response) {
  try {
    const { category, active } = req.query;
    
    let query = db.select().from(faqs);
    
    // Apply category filter if specified
    if (category && typeof category === 'string') {
      query = query.where(eq(faqs.category, category));
    }
    
    // Apply active filter if specified
    if (active === 'true') {
      query = query.where(eq(faqs.isActive, true));
    } else if (active === 'false') {
      query = query.where(eq(faqs.isActive, false));
    }
    
    // Order by order field and then by id
    const results = await query.orderBy(asc(faqs.order), asc(faqs.id));
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return res.status(500).json({ message: 'Error fetching FAQs' });
  }
}

/**
 * Get a specific FAQ by ID
 */
export async function getFaqById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const faqId = parseInt(id);
    
    if (isNaN(faqId)) {
      return res.status(400).json({ message: 'Invalid FAQ ID' });
    }
    
    const [faq] = await db.select().from(faqs).where(eq(faqs.id, faqId));
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    return res.status(200).json(faq);
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return res.status(500).json({ message: 'Error fetching FAQ' });
  }
}

/**
 * Create a new FAQ (admin only)
 */
export async function createFaq(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
    
    // Parse and validate input
    const faqData = insertFaqSchema.parse({
      ...req.body,
      createdBy: req.user.id
    });
    
    // Create FAQ
    const [newFaq] = await db.insert(faqs)
      .values(faqData)
      .returning();
    
    // Log admin action
    await AdminLogger.log(
      req.user.id,
      'create',
      'educational_resource',
      newFaq.id,
      `Admin ${req.user.id} created FAQ: ${newFaq.question.substring(0, 30)}...`,
      { question: newFaq.question, category: newFaq.category },
      req
    );
    
    return res.status(201).json({
      message: 'FAQ created successfully',
      faq: newFaq
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid FAQ data', errors: error.errors });
    }
    
    console.error('Error creating FAQ:', error);
    return res.status(500).json({ message: 'Error creating FAQ' });
  }
}

/**
 * Update an existing FAQ (admin only)
 */
export async function updateFaq(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
    
    const { id } = req.params;
    const faqId = parseInt(id);
    
    if (isNaN(faqId)) {
      return res.status(400).json({ message: 'Invalid FAQ ID' });
    }
    
    // Check if FAQ exists
    const [existingFaq] = await db.select().from(faqs).where(eq(faqs.id, faqId));
    
    if (!existingFaq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    // Validate update data
    const updateSchema = insertFaqSchema.partial();
    const updateData = updateSchema.parse({
      ...req.body,
      updatedBy: req.user.id,
      updatedAt: new Date()
    });
    
    // Update FAQ
    const [updatedFaq] = await db.update(faqs)
      .set(updateData)
      .where(eq(faqs.id, faqId))
      .returning();
    
    // Log admin action
    await AdminLogger.log(
      req.user.id,
      'update',
      'educational_resource',
      faqId,
      `Admin ${req.user.id} updated FAQ: ${updatedFaq.question.substring(0, 30)}...`,
      { 
        previousQuestion: existingFaq.question,
        newQuestion: updatedFaq.question,
        category: updatedFaq.category
      },
      req
    );
    
    return res.status(200).json({
      message: 'FAQ updated successfully',
      faq: updatedFaq
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid FAQ data', errors: error.errors });
    }
    
    console.error('Error updating FAQ:', error);
    return res.status(500).json({ message: 'Error updating FAQ' });
  }
}

/**
 * Delete a FAQ (admin only)
 */
export async function deleteFaq(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
    
    const { id } = req.params;
    const faqId = parseInt(id);
    
    if (isNaN(faqId)) {
      return res.status(400).json({ message: 'Invalid FAQ ID' });
    }
    
    // Check if FAQ exists
    const [existingFaq] = await db.select().from(faqs).where(eq(faqs.id, faqId));
    
    if (!existingFaq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    // Delete FAQ
    await db.delete(faqs).where(eq(faqs.id, faqId));
    
    // Log admin action
    await AdminLogger.log(
      req.user.id,
      'delete',
      'educational_resource',
      faqId,
      `Admin ${req.user.id} deleted FAQ: ${existingFaq.question.substring(0, 30)}...`,
      { 
        question: existingFaq.question,
        category: existingFaq.category
      },
      req
    );
    
    return res.status(200).json({
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return res.status(500).json({ message: 'Error deleting FAQ' });
  }
}

/**
 * Reorder FAQs (admin only)
 */
export async function reorderFaqs(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
    
    // Validate order data
    const orderSchema = z.array(
      z.object({
        id: z.number(),
        order: z.number()
      })
    );
    
    const orderData = orderSchema.parse(req.body);
    
    // Update orders in a transaction
    await db.transaction(async (tx) => {
      for (const item of orderData) {
        await tx.update(faqs)
          .set({ order: item.order, updatedBy: req.user!.id, updatedAt: new Date() })
          .where(eq(faqs.id, item.id));
      }
    });
    
    // Log admin action
    await AdminLogger.log(
      req.user.id,
      'update',
      'educational_resource',
      0,
      `Admin ${req.user.id} reordered FAQs`,
      { orderUpdates: orderData.length },
      req
    );
    
    return res.status(200).json({
      message: 'FAQs reordered successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid order data', errors: error.errors });
    }
    
    console.error('Error reordering FAQs:', error);
    return res.status(500).json({ message: 'Error reordering FAQs' });
  }
}

/**
 * Search FAQs by question or answer
 */
export async function searchFaqs(req: Request, res: Response) {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const searchTerm = `%${query}%`;
    
    const results = await db.select()
      .from(faqs)
      .where(
        and(
          eq(faqs.isActive, true),
          or(
            like(faqs.question, searchTerm),
            like(faqs.answer, searchTerm)
          )
        )
      )
      .orderBy(asc(faqs.order), asc(faqs.id));
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching FAQs:', error);
    return res.status(500).json({ message: 'Error searching FAQs' });
  }
}

// Helper function for OR condition
function or(...conditions: any[]) {
  return {
    type: 'or',
    condition: conditions,
  } as any;
}