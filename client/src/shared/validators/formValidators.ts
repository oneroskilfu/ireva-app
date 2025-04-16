import { z } from "zod";

/**
 * Common form validation schemas
 */

// Phone number validation for Nigerian format (e.g., 08012345678, +2348012345678)
export const phoneNumberSchema = z
  .string()
  .min(11, "Phone number must be at least 11 digits")
  .max(14, "Phone number cannot exceed 14 digits")
  .regex(
    /^(\+?234|0)[789][01]\d{8}$/,
    "Please enter a valid Nigerian phone number (e.g., 08012345678 or +2348012345678)"
  );

// Email validation with custom message
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email is required");

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Name validation
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name cannot exceed 50 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, apostrophes, and hyphens");

// Amount validation for Nigerian Naira
export const amountSchema = z
  .number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  })
  .positive("Amount must be greater than 0")
  .min(100, "Minimum amount is ₦100");

// ID validation
export const idSchema = z.number().int().positive("ID must be a positive integer");

// Date validation
export const dateSchema = z.date({
  required_error: "Date is required",
  invalid_type_error: "Invalid date format",
});

// Utility function to create a custom validation schema with optional fields
export function createOptionalSchema<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional();
}

// Commonly used validation utility functions
export const validateNigerianNIN = (nin: string): boolean => {
  return /^\d{11}$/.test(nin);
};

export const validateBVN = (bvn: string): boolean => {
  return /^\d{11}$/.test(bvn);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Type-safe utility for creating form schemas
export function createFormSchema<T extends Record<string, z.ZodTypeAny>>(schema: T) {
  return z.object(schema);
}