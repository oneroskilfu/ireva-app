import { Router } from "express";
import { db } from "../../db";
import { kycSubmissions, kycStatusEnum, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads");
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!') as any);
    }
  }
});

// Get KYC status for current user
router.get("/status", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Find the user to get their KYC status
    const [user] = await db
      .select({
        kycStatus: users.kycStatus,
        kycSubmittedAt: users.kycSubmittedAt,
        kycVerifiedAt: users.kycVerifiedAt,
        kycRejectionReason: users.kycRejectionReason,
        kycDocuments: users.kycDocuments
      })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Format the response
    const response = {
      status: user.kycStatus,
      submittedAt: user.kycSubmittedAt,
      verifiedAt: user.kycVerifiedAt,
      rejectionReason: user.kycRejectionReason,
      documents: user.kycDocuments
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Submit KYC
router.post("/submit", upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 },
  { name: 'selfieImage', maxCount: 1 },
  { name: 'addressProofImage', maxCount: 1 }
]), async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Validate required fields
    if (!req.body.fullName || !req.body.idType || !req.body.idNumber || !files.frontImage || !files.selfieImage) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create paths for uploaded files
    const fileUrls: Record<string, string> = {};
    Object.entries(files).forEach(([fieldName, fileArray]) => {
      if (fileArray && fileArray.length > 0) {
        fileUrls[fieldName] = `/uploads/${path.basename(fileArray[0].path)}`;
      }
    });

    // Create KYC submission
    const [submission] = await db.insert(kycSubmissions).values({
      userId: req.user.id,
      fullName: req.body.fullName,
      idType: req.body.idType,
      idNumber: req.body.idNumber,
      bankName: req.body.bankName,
      accountNumber: req.body.accountNumber,
      address: req.body.address,
      frontImage: fileUrls.frontImage,
      backImage: fileUrls.backImage?.[0],
      selfieImage: fileUrls.selfieImage,
      addressProofImage: fileUrls.addressProofImage?.[0],
      addressProofType: req.body.addressProofType,
      status: 'pending',
      submittedAt: new Date()
    }).returning();

    // Update user KYC status
    await db.update(users)
      .set({ 
        kycStatus: 'pending', 
        kycSubmittedAt: new Date(),
        kycDocuments: {
          idType: req.body.idType,
          idNumber: req.body.idNumber,
          hasFrontImage: !!fileUrls.frontImage,
          hasBackImage: !!fileUrls.backImage,
          hasSelfie: !!fileUrls.selfieImage,
          hasAddressProof: !!fileUrls.addressProofImage
        }
      })
      .where(eq(users.id, req.user.id));

    res.status(201).json(submission);
  } catch (error) {
    console.error("Error submitting KYC:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;