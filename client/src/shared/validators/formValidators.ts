import { z } from 'zod';

/**
 * Collection of form validators for consistent validation across the application
 */

// Basic user information validators
export const usernameValidator = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters');

export const emailValidator = z
  .string()
  .email('Please enter a valid email address');

export const passwordValidator = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

export const confirmPasswordValidator = (passwordField: string) =>
  z
    .string()
    .min(1, 'Please confirm your password')
    .refine((val) => val === passwordField, {
      message: 'Passwords do not match',
    });

// Nigerian phone number validator
export const phoneNumberValidator = z
  .string()
  .regex(/^(\+234|0)[0-9]{10}$/, 'Please enter a valid Nigerian phone number');

// OTP validator
export const otpValidator = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must contain only numbers');

// User profile validators
export const nameValidator = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

export const addressValidator = z
  .string()
  .min(5, 'Address must be at least 5 characters')
  .max(200, 'Address must be less than 200 characters');

// Investment validators
export const investmentAmountValidator = (minAmount: number) =>
  z
    .number()
    .min(minAmount, `Investment must be at least ₦${minAmount.toLocaleString()}`)
    .or(z.string().regex(/^\d+$/).transform(Number));

// Property validators
export const propertyNameValidator = z
  .string()
  .min(3, 'Property name must be at least 3 characters')
  .max(100, 'Property name must be less than 100 characters');

export const propertyDescriptionValidator = z
  .string()
  .min(20, 'Description must be at least 20 characters')
  .max(2000, 'Description must be less than 2000 characters');

export const propertyLocationValidator = z
  .string()
  .min(3, 'Location must be at least 3 characters')
  .max(100, 'Location must be less than 100 characters');

export const propertyPriceValidator = z
  .number()
  .positive('Price must be a positive number')
  .or(z.string().regex(/^\d+$/).transform(Number));

export const propertyReturnValidator = z
  .number()
  .min(0, 'Return percentage cannot be negative')
  .max(100, 'Return percentage cannot exceed 100%')
  .or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number));

export const propertyImageValidator = z
  .string()
  .url('Image URL must be a valid URL')
  .or(z.instanceof(File));

// KYC validators
export const idTypeValidator = z.enum(['nationalId', 'passport', 'driversLicense'], {
  errorMap: () => ({ message: 'Please select a valid ID type' }),
});

export const idNumberValidator = z
  .string()
  .min(5, 'ID number must be at least 5 characters')
  .max(20, 'ID number must be less than 20 characters');

// Message validators
export const messageValidator = z
  .string()
  .min(1, 'Message cannot be empty')
  .max(1000, 'Message must be less than 1000 characters');

// Common form schemas
export const loginFormSchema = z.object({
  username: usernameValidator,
  password: z.string().min(1, 'Password is required'),
});

export const registerFormSchema = z.object({
  username: usernameValidator,
  email: emailValidator,
  password: passwordValidator,
  confirmPassword: z.string(),
  phoneNumber: phoneNumberValidator,
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const profileUpdateFormSchema = z.object({
  firstName: nameValidator.optional(),
  lastName: nameValidator.optional(),
  phoneNumber: phoneNumberValidator.optional(),
  email: emailValidator.optional(),
  address: addressValidator.optional(),
});

export const passwordChangeFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordValidator,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const kycSubmissionFormSchema = z.object({
  idType: idTypeValidator,
  idNumber: idNumberValidator,
  frontImage: propertyImageValidator,
  backImage: propertyImageValidator.optional(),
  selfieImage: propertyImageValidator,
});

export const investmentFormSchema = (minAmount: number) => z.object({
  propertyId: z.number().positive('Please select a property'),
  amount: investmentAmountValidator(minAmount),
  paymentMethod: z.enum(['wallet', 'card', 'bank'], {
    errorMap: () => ({ message: 'Please select a valid payment method' }),
  }),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the investment terms',
  }),
});