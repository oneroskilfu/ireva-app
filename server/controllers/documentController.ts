import { Request, Response } from 'express';
import { db } from '../db';
import { documents, documentVersions, insertDocumentSchema } from '../../shared/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, desc } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

// Configure storage for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename to prevent collisions
    const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    const allowedFileTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG and PNG files are allowed.'));
    }
  }
});

// Get all documents
export async function getAllDocuments(req: Request, res: Response) {
  try {
    const documents = await db.query.documents.findMany({
      orderBy: (documents) => [documents.createdAt.desc()]
    });
    
    return res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ message: 'Failed to fetch documents' });
  }
}

// Get document by ID
export async function getDocumentById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const document = await db.query.documents.findFirst({
      where: eq(documents.id, id),
      with: {
        versions: true
      }
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    return res.status(200).json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    return res.status(500).json({ message: 'Failed to fetch document' });
  }
}

// Upload a new document
export async function uploadDocument(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get form data
    const { title, type } = req.body;
    
    if (!title || !type) {
      return res.status(400).json({ message: 'Title and type are required' });
    }
    
    // Create file URL (relative to server)
    const fileUrl = `/uploads/documents/${req.file.filename}`;
    
    // Compute file hash for version control
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Validate using zod schema
    const newDocument = insertDocumentSchema.parse({
      title,
      type,
      fileUrl,
      uploadedBy: req.user?.id, // From auth middleware
      status: 'pending',
    });
    
    // Insert document
    const [document] = await db.insert(documents).values(newDocument).returning();
    
    // Insert initial version
    await db.insert(documentVersions).values({
      documentId: document.id,
      version: 1,
      hash
    });
    
    return res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    return res.status(500).json({ message: 'Failed to upload document' });
  }
}

// Update document
export async function updateDocument(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, status, metadata } = req.body;
    
    // Find document
    const existingDocument = await db.query.documents.findFirst({
      where: eq(documents.id, id)
    });
    
    if (!existingDocument) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Update document
    const [updatedDocument] = await db
      .update(documents)
      .set({
        title: title || existingDocument.title,
        status: status || existingDocument.status,
        updatedAt: new Date()
      })
      .where(eq(documents.id, id))
      .returning();
    
    return res.status(200).json(updatedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    return res.status(500).json({ message: 'Failed to update document' });
  }
}

// Delete document
export async function deleteDocument(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Find document to get file path
    const document = await db.query.documents.findFirst({
      where: eq(documents.id, id)
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Delete file from disk
    const filePath = path.join(__dirname, '../../', document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete document versions first (due to foreign key constraint)
    await db.delete(documentVersions).where(eq(documentVersions.documentId, id));
    
    // Delete document
    await db.delete(documents).where(eq(documents.id, id));
    
    return res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ message: 'Failed to delete document' });
  }
}

// Add signature to document
export async function signDocument(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Find document
    const document = await db.query.documents.findFirst({
      where: eq(documents.id, id)
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Update metadata to add signature
    const metadata = document.metadata || {};
    const signatures = metadata.signatures || [];
    
    // Check if user already signed
    const alreadySigned = signatures.some(sig => sig.userId === userId);
    if (alreadySigned) {
      return res.status(400).json({ message: 'Document already signed by this user' });
    }
    
    // Add signature
    signatures.push({
      userId,
      signedAt: new Date()
    });
    
    // Update document with signature and change status to signed
    const [updatedDocument] = await db
      .update(documents)
      .set({
        metadata: {
          ...metadata,
          signatures
        },
        status: 'signed',
        updatedAt: new Date()
      })
      .where(eq(documents.id, id))
      .returning();
    
    return res.status(200).json(updatedDocument);
  } catch (error) {
    console.error('Error signing document:', error);
    return res.status(500).json({ message: 'Failed to sign document' });
  }
}