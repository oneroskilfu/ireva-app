import { v4 as uuidv4 } from 'uuid';

// KYC status types
export enum KycStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

// KYC levels for different investment tiers
export enum KycLevel {
  BASIC = 'basic', // Email + phone verification
  INTERMEDIATE = 'intermediate', // Basic + ID verification
  ADVANCED = 'advanced' // Intermediate + address proof + accreditation
}

// KYC document types
export enum KycDocumentType {
  ID_CARD = 'id_card',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
  PROOF_OF_ADDRESS = 'proof_of_address',
  PROOF_OF_INCOME = 'proof_of_income',
  ACCREDITATION_PROOF = 'accreditation_proof',
  SELFIE = 'selfie'
}

// KYC document status
export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// KYC document interface
export interface KycDocument {
  id: string;
  userId: number;
  type: KycDocumentType;
  fileUrl: string;
  status: DocumentStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: number;
}

// User KYC profile
export interface KycProfile {
  userId: number;
  status: KycStatus;
  level: KycLevel;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  idVerified: boolean;
  addressVerified: boolean;
  accredited: boolean;
  createdAt: Date;
  updatedAt: Date;
  documents: KycDocument[];
}

// Store KYC profiles in memory for demo
const kycProfiles = new Map<number, KycProfile>();
const kycDocuments = new Map<string, KycDocument>();

// Add a few sample profiles for testing
const createSampleProfiles = () => {
  const sampleUsers = [1, 2, 3, 4, 5];
  
  for (const userId of sampleUsers) {
    const isVerified = userId % 2 === 0; // Even user IDs are verified
    const docId = uuidv4();
    
    // Create document
    const document: KycDocument = {
      id: docId,
      userId,
      type: KycDocumentType.ID_CARD,
      fileUrl: `https://example.com/kyc/documents/${docId}.jpg`,
      status: isVerified ? DocumentStatus.APPROVED : DocumentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      reviewedAt: isVerified ? new Date() : undefined,
      reviewedBy: isVerified ? 1 : undefined
    };
    
    kycDocuments.set(docId, document);
    
    // Create profile
    const profile: KycProfile = {
      userId,
      status: isVerified ? KycStatus.VERIFIED : KycStatus.PENDING,
      level: isVerified ? KycLevel.ADVANCED : KycLevel.BASIC,
      firstName: `User${userId}`,
      lastName: `Test`,
      dateOfBirth: '1990-01-01',
      nationality: 'Nigeria',
      country: 'Nigeria',
      address: `123 Test Street, Apartment ${userId}`,
      city: 'Lagos',
      postalCode: '100001',
      phoneVerified: true,
      emailVerified: true,
      idVerified: isVerified,
      addressVerified: isVerified,
      accredited: isVerified,
      createdAt: new Date(),
      updatedAt: new Date(),
      documents: [document]
    };
    
    kycProfiles.set(userId, profile);
  }
};

// Initialize sample data
createSampleProfiles();

export class KycVerificationService {
  constructor() {
    console.log('KYC Verification Service initialized');
  }
  
  /**
   * Get a user's KYC profile
   */
  async getUserKycProfile(userId: number): Promise<KycProfile | null> {
    return kycProfiles.get(userId) || null;
  }
  
  /**
   * Check if a user has completed KYC verification
   */
  async isUserKycVerified(userId: number): Promise<boolean> {
    const profile = await this.getUserKycProfile(userId);
    return profile?.status === KycStatus.VERIFIED;
  }
  
  /**
   * Check if a user has completed advanced KYC (required for crypto)
   */
  async isUserCryptoKycVerified(userId: number): Promise<boolean> {
    const profile = await this.getUserKycProfile(userId);
    return profile?.status === KycStatus.VERIFIED && profile?.level === KycLevel.ADVANCED;
  }
  
  /**
   * Submit a new KYC verification request
   */
  async submitKycRequest(userId: number, data: Partial<KycProfile>): Promise<KycProfile> {
    const existingProfile = kycProfiles.get(userId);
    
    const profile: KycProfile = {
      userId,
      status: KycStatus.PENDING,
      level: existingProfile?.level || KycLevel.BASIC,
      firstName: data.firstName || existingProfile?.firstName || '',
      lastName: data.lastName || existingProfile?.lastName || '',
      dateOfBirth: data.dateOfBirth || existingProfile?.dateOfBirth || '',
      nationality: data.nationality || existingProfile?.nationality || '',
      country: data.country || existingProfile?.country || '',
      address: data.address || existingProfile?.address || '',
      city: data.city || existingProfile?.city || '',
      postalCode: data.postalCode || existingProfile?.postalCode || '',
      phoneVerified: data.phoneVerified || existingProfile?.phoneVerified || false,
      emailVerified: data.emailVerified || existingProfile?.emailVerified || false,
      idVerified: data.idVerified || existingProfile?.idVerified || false,
      addressVerified: data.addressVerified || existingProfile?.addressVerified || false,
      accredited: data.accredited || existingProfile?.accredited || false,
      createdAt: existingProfile?.createdAt || new Date(),
      updatedAt: new Date(),
      documents: existingProfile?.documents || []
    };
    
    kycProfiles.set(userId, profile);
    return profile;
  }
  
  /**
   * Upload a document for KYC verification
   */
  async uploadKycDocument(userId: number, type: KycDocumentType, fileUrl: string): Promise<KycDocument> {
    const docId = uuidv4();
    
    const document: KycDocument = {
      id: docId,
      userId,
      type,
      fileUrl,
      status: DocumentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    kycDocuments.set(docId, document);
    
    // Add document to user's profile
    const profile = kycProfiles.get(userId);
    if (profile) {
      profile.documents.push(document);
      profile.updatedAt = new Date();
      kycProfiles.set(userId, profile);
    }
    
    return document;
  }
  
  /**
   * Verify a user's KYC (admin function)
   */
  async verifyUserKyc(userId: number, adminId: number, level: KycLevel = KycLevel.ADVANCED): Promise<KycProfile | null> {
    const profile = kycProfiles.get(userId);
    if (!profile) {
      return null;
    }
    
    profile.status = KycStatus.VERIFIED;
    profile.level = level;
    profile.idVerified = true;
    profile.addressVerified = true;
    profile.updatedAt = new Date();
    
    // Mark all documents as approved
    profile.documents.forEach(doc => {
      doc.status = DocumentStatus.APPROVED;
      doc.reviewedAt = new Date();
      doc.reviewedBy = adminId;
      doc.updatedAt = new Date();
      kycDocuments.set(doc.id, doc);
    });
    
    kycProfiles.set(userId, profile);
    return profile;
  }
  
  /**
   * Reject a user's KYC (admin function)
   */
  async rejectUserKyc(userId: number, adminId: number, reason: string): Promise<KycProfile | null> {
    const profile = kycProfiles.get(userId);
    if (!profile) {
      return null;
    }
    
    profile.status = KycStatus.REJECTED;
    profile.updatedAt = new Date();
    
    // Mark documents as rejected
    profile.documents.forEach(doc => {
      doc.status = DocumentStatus.REJECTED;
      doc.rejectionReason = reason;
      doc.reviewedAt = new Date();
      doc.reviewedBy = adminId;
      doc.updatedAt = new Date();
      kycDocuments.set(doc.id, doc);
    });
    
    kycProfiles.set(userId, profile);
    return profile;
  }
  
  /**
   * Get KYC verification requirements for crypto investing
   */
  getCryptoKycRequirements(): { requiredLevel: KycLevel, requiredDocuments: KycDocumentType[] } {
    return {
      requiredLevel: KycLevel.ADVANCED,
      requiredDocuments: [
        KycDocumentType.ID_CARD,
        KycDocumentType.SELFIE,
        KycDocumentType.PROOF_OF_ADDRESS
      ]
    };
  }
  
  /**
   * Get all pending KYC requests (admin function)
   */
  async getPendingKycRequests(): Promise<KycProfile[]> {
    return Array.from(kycProfiles.values())
      .filter(profile => profile.status === KycStatus.PENDING);
  }
  
  /**
   * Check if a country is restricted for crypto transactions
   */
  isCountryRestricted(countryCode: string): boolean {
    // List of restricted countries (sample list - should be configured based on actual regulations)
    const restrictedCountries = ['US', 'CA', 'JP', 'KR'];
    return restrictedCountries.includes(countryCode.toUpperCase());
  }
}

// Create a singleton instance
export const kycService = new KycVerificationService();