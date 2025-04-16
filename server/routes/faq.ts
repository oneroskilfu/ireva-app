import express from 'express';
import { verifyToken, ensureAdmin } from '../auth-jwt';
import * as faqController from '../controllers/faqController';

const router = express.Router();

/**
 * @route GET /api/faqs
 * @desc Get all FAQs with optional category filtering
 * @access Public
 */
router.get('/', faqController.getAllFaqs);

/**
 * @route GET /api/faqs/:id
 * @desc Get a specific FAQ by ID
 * @access Public
 */
router.get('/:id', faqController.getFaqById);

/**
 * @route POST /api/faqs
 * @desc Create a new FAQ (admin only)
 * @access Admin
 */
router.post('/', verifyToken, ensureAdmin, faqController.createFaq);

/**
 * @route PUT /api/faqs/:id
 * @desc Update an existing FAQ (admin only)
 * @access Admin
 */
router.put('/:id', verifyToken, ensureAdmin, faqController.updateFaq);

/**
 * @route DELETE /api/faqs/:id
 * @desc Delete a FAQ (admin only)
 * @access Admin
 */
router.delete('/:id', verifyToken, ensureAdmin, faqController.deleteFaq);

/**
 * @route POST /api/faqs/reorder
 * @desc Reorder FAQs (admin only)
 * @access Admin
 */
router.post('/reorder', verifyToken, ensureAdmin, faqController.reorderFaqs);

/**
 * @route GET /api/faqs/search
 * @desc Search FAQs by question or answer
 * @access Public
 */
router.get('/search', faqController.searchFaqs);

export default router;