import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different document types
const kycDir = path.join(uploadsDir, 'kyc');
if (!fs.existsSync(kycDir)) {
  fs.mkdirSync(kycDir, { recursive: true });
}

const propertyDir = path.join(uploadsDir, 'properties');
if (!fs.existsSync(propertyDir)) {
  fs.mkdirSync(propertyDir, { recursive: true });
}

// Define storage strategy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the correct upload directory based on file type
    let uploadPath = uploadsDir;
    
    if (file.fieldname === 'idCard' || file.fieldname === 'addressProof' || file.fieldname === 'selfie') {
      uploadPath = kycDir;
    } else if (file.fieldname === 'propertyImage' || file.fieldname === 'floorPlan' || file.fieldname === 'document') {
      uploadPath = propertyDir;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with original extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileExt = path.extname(file.originalname);
    const userId = req.user?.id || 'anonymous';
    
    cb(null, `${userId}-${file.fieldname}-${uniqueSuffix}${fileExt}`);
  }
});

// Create file filter to allow only certain file types
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed file types based on upload type
  const documentTypes = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
  const imageTypes = ['.png', '.jpg', '.jpeg', '.webp'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Filter based on field name
  if (file.fieldname === 'idCard' || file.fieldname === 'addressProof') {
    // Only allow document formats for identification
    if (documentTypes.includes(ext)) {
      return cb(null, true);
    }
  } else if (file.fieldname === 'selfie') {
    // Only allow image formats for selfie
    if (imageTypes.includes(ext)) {
      return cb(null, true);
    }
  } else if (file.fieldname === 'propertyImage' || file.fieldname === 'floorPlan') {
    // Only allow image formats for property related images
    if (imageTypes.includes(ext)) {
      return cb(null, true);
    }
  } else if (file.fieldname === 'document') {
    // Only allow document formats for documents
    if (documentTypes.includes(ext)) {
      return cb(null, true);
    }
  }
  
  // Reject file if it doesn't match any of the conditions
  cb(null, false);
  return cb(new Error(`Only ${documentTypes.join(', ')} file formats are allowed`));
};

// Create multer upload instance with size limits
const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5 // Maximum 5 files per request
  }
});

export default upload;