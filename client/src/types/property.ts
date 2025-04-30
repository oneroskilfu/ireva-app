/**
 * Frontend type definitions for Property Management
 */

/**
 * Property interface - Defines the structure for real estate properties
 */
export interface Property {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  images: string[];
  fundingGoal: number;
  currentFunding: number;
  backers: number;
  status: 'active' | 'archived' | 'funded';
  investmentTenor: number; // in months
  roiPercentage: number;
  documents: string[];
  milestones: Milestone[];
  createdAt: Date;
}

/**
 * Milestone interface - Defines the structure for property development milestones
 */
export interface Milestone {
  id: string;
  title: string;
  description: string;
  completionDate: Date;
  status: 'planned' | 'in-progress' | 'completed';
  progress: number; // 0-100
}

/**
 * New Property form data - For creating new properties
 */
export interface NewPropertyFormData {
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  fundingGoal: number;
  investmentTenor: number;
  roiPercentage: number;
  images?: File[];
}

/**
 * New Milestone form data - For creating property milestones
 */
export interface NewMilestoneFormData {
  title: string;
  description: string;
  completionDate: Date;
}