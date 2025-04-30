/**
 * Shared interfaces for iREVA platform
 * Contains TypeScript interfaces used across both frontend and backend
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