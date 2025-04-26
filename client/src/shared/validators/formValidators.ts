/**
 * Form validation utilities for consistent validation across the application
 */
import { z } from 'zod';

// Email validation
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email cannot exceed 255 characters');

// Password validation - require at least 8 chars, 1 uppercase, 1 lowercase, 1 number
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password cannot exceed 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

// Username validation - alphanumeric with underscore and dash
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username cannot exceed 50 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, underscores, and dashes'
  );

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Nigerian phone number validation (e.g., +234 or 0 prefix)
export const phoneNumberSchema = z
  .string()
  .refine(
    (value) => {
      // Remove spaces, dashes, parentheses
      const cleanedValue = value.replace(/[\s\-()]/g, '');
      
      // Match Nigerian format: +234XXXXXXXXXX, 234XXXXXXXXXX, or 0XXXXXXXXXX
      const nigerianPhoneRegex = /^(?:\+?234|0)[789]\d{9}$/;
      return nigerianPhoneRegex.test(cleanedValue);
    },
    {
      message: 'Please enter a valid Nigerian phone number (e.g., +234 XXX XXX XXXX or 080 XXX XXX XX)',
    }
  );

// Amount validation (for investments)
export const amountSchema = z
  .number()
  .or(z.string().regex(/^\d+$/).transform(Number))
  .refine((val) => val > 0, 'Amount must be greater than 0')
  .refine((val) => val <= 1000000000, 'Amount cannot exceed 1,000,000,000');

// Currency schema (limited to supported currencies)
export const currencySchema = z.enum(['NGN', 'USD', 'GHS', 'KES']);

// Date validation (must be a valid date, not in the past for future dates)
export const futureDateSchema = z
  .date()
  .refine((date) => date > new Date(), 'Date must be in the future');

// OTP validation (6 digits)
export const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d+$/, 'OTP must contain only digits');

// KYC Document schema
export const kycDocumentSchema = z.object({
  idType: z.enum(['national_id', 'drivers_license', 'passport', 'voters_card'], {
    invalid_type_error: 'Please select a valid ID type',
  }),
  idNumber: z.string().min(3, 'ID number must be at least 3 characters'),
  expiryDate: z.date().optional(),
  frontImage: z.string().min(1, 'Front image is required'),
  backImage: z.string().optional(),
  selfieImage: z.string().min(1, 'Selfie image is required'),
});

// Property search filters schema
export const propertyFilterSchema = z.object({
  location: z.string().optional(),
  type: z
    .enum(['residential', 'commercial', 'industrial', 'mixed-use', 'land'])
    .optional(),
  minInvestment: z
    .number()
    .or(z.string().regex(/^\d+$/).transform(Number))
    .optional(),
  maxInvestment: z
    .number()
    .or(z.string().regex(/^\d+$/).transform(Number))
    .optional(),
  targetReturn: z
    .number()
    .or(z.string().regex(/^\d+$/).transform(Number))
    .optional(),
  term: z
    .number()
    .or(z.string().regex(/^\d+$/).transform(Number))
    .optional(),
});

// Login form schema
export const loginFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Referral code validation - Format IRV-XXXXX where X is alphanumeric
export const referralCodeSchema = z
  .string()
  .regex(/^IRV-[A-Z0-9]{5}$/, 'Referral code must be in the format IRV-XXXXX')
  .optional()
  .transform((val) => val || null);

// Registration form schema
export const registrationFormSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phoneNumber: phoneNumberSchema.optional(),
  referredBy: referralCodeSchema,
  agreeToTerms: z.boolean().refine((val) => val === true, 'You must agree to the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Investment form schema
export const investmentFormSchema = z.object({
  propertyId: z.number().positive('Please select a valid property'),
  amount: amountSchema,
  reinvestmentOption: z.boolean().optional(),
  paymentMethod: z.enum(['bank_transfer', 'credit_card', 'debit_card', 'paystack', 'flutterwave', 'wallet']),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the investment terms'),
});

// KYC submission form schema
export const kycSubmissionFormSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  dateOfBirth: z.date({
    required_error: 'Date of birth is required',
    invalid_type_error: 'Please enter a valid date',
  }),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
  postalCode: z.string().optional(),
  idDocument: kycDocumentSchema,
});

// Profile update form schema
export const profileUpdateFormSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  phoneNumber: phoneNumberSchema.optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  notificationPreferences: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional(),
  }).optional(),
  directMessageEnabled: z.boolean().optional(),
});

// Password change form schema
export const passwordChangeFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword'],
});

// Property search form schema
export const propertySearchFormSchema = z.object({
  query: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(['residential', 'commercial', 'industrial', 'mixed-use', 'land']).optional(),
  minInvestment: z
    .number()
    .or(z.string().regex(/^\d+$/).transform(Number))
    .optional(),
  maxInvestment: z
    .number()
    .or(z.string().regex(/^\d+$/).transform(Number))
    .optional(),
  targetReturn: z
    .number()
    .or(z.string().regex(/^\d+$/).transform(Number))
    .optional(),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phoneNumber: phoneNumberSchema.optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(100, 'Subject cannot exceed 100 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(1000, 'Message cannot exceed 1000 characters'),
});

// Direct message form schema
export const directMessageFormSchema = z.object({
  recipientId: z.number().positive('Please select a valid recipient'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message cannot exceed 1000 characters'),
  attachments: z.array(z.string()).optional(),
});

// Form error helpers
export const getFormFieldError = (errors: any, field: string): string | undefined => {
  return errors[field]?.message;
};

// Utility to check if an object has any errors
export const hasErrors = (errors: any): boolean => {
  return Object.keys(errors).length > 0;
};

// Format a value as Nigerian Naira
export const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format a value as US Dollar
export const formatUSD = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format a value as percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};