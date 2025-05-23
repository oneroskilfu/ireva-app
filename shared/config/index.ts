// iREVA Platform - Shared Configuration
// Constants and configuration values used across frontend and backend

// Investment Configuration
export const INVESTMENT = {
  MIN_AMOUNT_NGN: 100000, // ₦100,000
  MIN_AMOUNT_USD: 100, // $100
  MIN_AMOUNT_BTC: 0.001, // 0.001 BTC
  MIN_AMOUNT_USDT: 100, // 100 USDT
  DEFAULT_SHARES: 1000,
  MIN_ROI: 5, // 5%
  MAX_ROI: 50, // 50%
} as const;

// Currency Configuration
export const CURRENCIES = {
  FIAT: ['NGN', 'USD'] as const,
  CRYPTO: ['BTC', 'USDT', 'ETH'] as const,
  ALL: ['NGN', 'USD', 'BTC', 'USDT', 'ETH'] as const,
} as const;

export const CURRENCY_SYMBOLS = {
  NGN: '₦',
  USD: '$',
  BTC: '₿',
  USDT: '₮',
  ETH: 'Ξ',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  INVESTOR: 'investor',
  TENANT: 'tenant',
} as const;

// KYC Configuration
export const KYC = {
  DOCUMENT_TYPES: [
    'passport',
    'drivers_license',
    'national_id',
    'utility_bill',
  ] as const,
  STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  } as const,
} as const;

// Property Configuration
export const PROPERTY = {
  STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  } as const,
  LOCATIONS: [
    'Lagos',
    'Abuja',
    'Port Harcourt',
    'Kano',
    'Ibadan',
    'Benin City',
  ] as const,
} as const;

// Validation Patterns
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE_NG: /^(\+234|234|0)?[789][01]\d{8}$/,
  BTC_ADDRESS: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
  ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
} as const;