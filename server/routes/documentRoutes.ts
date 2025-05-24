import express from 'express';
import { 
  getAllDocuments, 
  getDocumentById, 
  uploadDocument, 
  updateDocument, 
  deleteDocument,
  signDocument,
  upload
} from '../controllers/documentController';
import { ensureAuthenticated } from '../middlewares/auth';

const router = express.Router();

// In development, we'll skip strict authentication
if (process.env.NODE_ENV === 'production') {
  // Apply authentication to all document routes in production
  router.use(ensureAuthenticated);
}

// Get all documents
router.get('/', getAllDocuments);

// Get document by ID
router.get('/:id', getDocumentById);

// Upload a new document
router.post('/upload', upload.single('file'), uploadDocument);

// Update document
router.put('/:id', updateDocument);

// Delete document
router.delete('/:id', deleteDocument);

// Sign document
router.post('/:id/sign', signDocument);

export default router;