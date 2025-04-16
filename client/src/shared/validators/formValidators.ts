import * as z from 'zod';

/**
 * Common form validators for the iREVA application
 */

// Common string validators
export const requiredString = z.string().min(1, 'This field is required');
export const optionalString = z.string().optional();

// User-related validators
export const usernameValidator = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username cannot exceed 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const emailValidator = z.string()
  .email('Please enter a valid email address');

export const passwordValidator = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const nigeriaMobileValidator = z.string()
  .regex(/^(0|\+?234)[789][01]\d{8}$/, 'Please enter a valid Nigerian mobile number');

// Investment-related validators
export const investmentAmountValidator = z.number()
  .min(100000, 'Minimum investment is ₦100,000');

export const propertyNameValidator = z.string()
  .min(5, 'Property name must be at least 5 characters')
  .max(100, 'Property name cannot exceed 100 characters');

export const propertyDescriptionValidator = z.string()
  .min(20, 'Description must be at least 20 characters')
  .max(2000, 'Description cannot exceed 2000 characters');

export const propertyLocationValidator = z.string()
  .min(3, 'Location must be at least 3 characters')
  .max(100, 'Location cannot exceed 100 characters');

export const propertyTypeValidator = z.enum([
  'residential',
  'commercial',
  'industrial',
  'mixed-use',
  'land'
], {
  errorMap: () => ({ message: 'Please select a valid property type' })
});

export const propertyTierValidator = z.enum([
  'standard',
  'premium',
  'exclusive'
], {
  errorMap: () => ({ message: 'Please select a valid property tier' })
});

export const returnRateValidator = z.string()
  .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid return rate (e.g., 12.5)')
  .or(z.number().min(0, 'Return rate must be a positive number'));

export const investmentTermValidator = z.number()
  .int('Term must be a whole number of months')
  .min(12, 'Minimum term is 12 months');

// KYC-related validators
export const kycStatusValidator = z.enum([
  'pending',
  'submitted',
  'verified',
  'rejected'
], {
  errorMap: () => ({ message: 'Invalid KYC status' })
});

export const accreditationLevelValidator = z.enum([
  'basic',
  'intermediate',
  'advanced',
  'professional'
], {
  errorMap: () => ({ message: 'Invalid accreditation level' })
});

// Forum-related validators
export const forumTopicValidator = z.string()
  .min(5, 'Topic must be at least 5 characters')
  .max(100, 'Topic cannot exceed 100 characters');

export const forumPostValidator = z.string()
  .min(10, 'Post must be at least 10 characters')
  .max(5000, 'Post cannot exceed 5000 characters');

// Payment-related validators
export const paymentMethodValidator = z.enum([
  'bank_transfer',
  'card_payment',
  'wallet',
  'ussd',
  'crypto'
], {
  errorMap: () => ({ message: 'Please select a valid payment method' })
});

export const transactionStatusValidator = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded'
], {
  errorMap: () => ({ message: 'Invalid transaction status' })
});

// Schema creator helpers
export function createLoginSchema() {
  return z.object({
    username: usernameValidator,
    password: z.string().min(1, 'Password is required'),
  });
}

export function createRegistrationSchema() {
  return z.object({
    username: usernameValidator,
    email: emailValidator,
    password: passwordValidator,
    confirmPassword: z.string(),
    firstName: requiredString,
    lastName: requiredString,
    phoneNumber: nigeriaMobileValidator,
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions'
    }),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword']
  });
}

export function createProfileUpdateSchema() {
  return z.object({
    firstName: requiredString,
    lastName: requiredString,
    email: emailValidator,
    phoneNumber: nigeriaMobileValidator,
    address: optionalString,
    city: optionalString,
    state: optionalString,
    country: z.string().default('Nigeria'),
    occupation: optionalString,
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  });
}

export function createPropertySchema() {
  return z.object({
    name: propertyNameValidator,
    description: propertyDescriptionValidator,
    location: propertyLocationValidator,
    type: propertyTypeValidator,
    tier: propertyTierValidator,
    targetReturn: returnRateValidator,
    minimumInvestment: z.number().min(10000, 'Minimum investment amount is ₦10,000'),
    term: investmentTermValidator,
    totalFunding: z.number().min(1000000, 'Total funding must be at least ₦1,000,000'),
    amenities: z.array(z.string()).min(1, 'Please add at least one amenity'),
    developer: z.string().min(3, 'Developer name is required'),
    riskLevel: z.enum(['low', 'medium', 'high']),
    accreditedOnly: z.boolean().default(false),
  });
}

export function createInvestmentSchema() {
  return z.object({
    propertyId: z.number().positive('Please select a valid property'),
    amount: investmentAmountValidator,
    paymentMethod: paymentMethodValidator,
    agreementSigned: z.boolean().refine(val => val === true, {
      message: 'You must agree to the investment terms'
    }),
  });
}

export function createKycSubmissionSchema() {
  return z.object({
    idType: z.enum(['national_id', 'drivers_license', 'passport', 'voters_card']),
    idNumber: z.string().min(4, 'ID number is required'),
    addressProofType: z.enum(['utility_bill', 'bank_statement', 'tax_receipt']),
    bvn: z.string().regex(/^\d{11}$/, 'BVN must be 11 digits'),
    nationality: z.string().min(2, 'Nationality is required'),
    dateOfBirth: z.date({
      required_error: 'Date of birth is required',
      invalid_type_error: 'Date of birth must be a valid date',
    }),
  });
}

// Common utility to convert an array to select options
export function toSelectOptions<T extends string>(values: readonly T[]): { label: string; value: T }[] {
  return values.map(value => ({
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
    value
  }));
}

// Property type options
export const PROPERTY_TYPES = ['residential', 'commercial', 'industrial', 'mixed-use', 'land'] as const;
export const propertyTypeOptions = toSelectOptions(PROPERTY_TYPES);

// Property tier options
export const PROPERTY_TIERS = ['standard', 'premium', 'exclusive'] as const;
export const propertyTierOptions = toSelectOptions(PROPERTY_TIERS);

// Payment method options
export const PAYMENT_METHODS = ['bank_transfer', 'card_payment', 'wallet', 'ussd', 'crypto'] as const;
export const paymentMethodOptions = toSelectOptions(PAYMENT_METHODS);

// ID type options
export const ID_TYPES = ['national_id', 'drivers_license', 'passport', 'voters_card'] as const;
export const idTypeOptions = toSelectOptions(ID_TYPES);

// Address proof options
export const ADDRESS_PROOF_TYPES = ['utility_bill', 'bank_statement', 'tax_receipt'] as const;
export const addressProofOptions = toSelectOptions(ADDRESS_PROOF_TYPES);

// Risk level options
export const RISK_LEVELS = ['low', 'medium', 'high'] as const;
export const riskLevelOptions = toSelectOptions(RISK_LEVELS);