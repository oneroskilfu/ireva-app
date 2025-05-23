// iREVA Platform - Shared Types
// Type-safe definitions used across frontend and backend

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'investor' | 'tenant';
  tenantId?: string;
  isVerified: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  currency: 'NGN' | 'USD' | 'BTC' | 'USDT';
  totalShares: number;
  availableShares: number;
  minimumInvestment: number;
  expectedROI: number;
  status: 'active' | 'completed' | 'draft';
  images: string[];
  documents: string[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Investment {
  id: string;
  userId: string;
  propertyId: string;
  amount: number;
  shares: number;
  currency: 'NGN' | 'USD' | 'BTC' | 'USDT';
  status: 'pending' | 'confirmed' | 'cancelled';
  transactionHash?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KYCDocument {
  id: string;
  userId: string;
  documentType: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ROIDistribution {
  id: string;
  propertyId: string;
  userId: string;
  amount: number;
  currency: 'NGN' | 'USD';
  distributionDate: Date;
  status: 'pending' | 'paid' | 'failed';
  transactionReference: string;
  tenantId: string;
  createdAt: Date;
}

export interface CryptoTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'investment';
  currency: 'BTC' | 'USDT' | 'ETH';
  amount: number;
  address: string;
  transactionHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface InvestmentForm {
  propertyId: string;
  amount: number;
  currency: 'NGN' | 'USD' | 'BTC' | 'USDT';
  paymentMethod: 'bank_transfer' | 'crypto' | 'card';
}

export interface PropertyForm {
  title: string;
  description: string;
  location: string;
  price: number;
  currency: 'NGN' | 'USD';
  totalShares: number;
  minimumInvestment: number;
  expectedROI: number;
  images: File[];
  documents: File[];
}

// Filter Types
export interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: 'NGN' | 'USD';
  status?: 'active' | 'completed';
  sortBy?: 'price' | 'roi' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  role?: 'admin' | 'investor' | 'tenant';
  kycStatus?: 'pending' | 'approved' | 'rejected';
  isVerified?: boolean;
  search?: string;
}

// WebSocket Event Types
export interface SocketEvent<T = any> {
  type: string;
  data: T;
  userId?: string;
  tenantId?: string;
  timestamp: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
  tenantId: string;
  createdAt: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}