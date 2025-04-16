import { randomBytes } from 'crypto';

/**
 * Generate a unique transaction reference
 * Format: IREVA-YYYYMMDD-RANDOM (e.g., IREVA-20230427-A7F3B2)
 * 
 * @returns A unique transaction reference string
 */
export function generateTransactionReference(): string {
  // Get current date in format YYYYMMDD
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  
  // Generate random hexadecimal string (6 characters)
  const randomStr = randomBytes(3).toString('hex').toUpperCase();
  
  // Combine all parts
  return `IREVA-${dateStr}-${randomStr}`;
}

/**
 * Format currency amount in Naira
 * 
 * @param amount Amount to format
 * @param includeCurrency Whether to include the ₦ symbol
 * @returns Formatted currency string
 */
export function formatNaira(amount: number, includeCurrency = true): string {
  const formatter = new Intl.NumberFormat('en-NG', {
    style: includeCurrency ? 'currency' : 'decimal',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(amount);
}

/**
 * Calculate percentage change between two numbers
 * 
 * @param oldValue The original value
 * @param newValue The new value
 * @returns Percentage change (positive or negative)
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0; // Avoid division by zero
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Format a date in a user-friendly way
 * 
 * @param date Date to format
 * @param includeTime Whether to include time
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, includeTime = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  return dateObj.toLocaleDateString('en-NG', options);
}

/**
 * Generate a friendly investment ID
 * 
 * @param id Numeric ID
 * @param prefix Prefix to use (default: INV)
 * @returns Formatted ID string (e.g., INV-00042)
 */
export function generateFriendlyId(id: number, prefix = 'INV'): string {
  return `${prefix}-${id.toString().padStart(5, '0')}`;
}

/**
 * Truncate text to a specified length
 * 
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @param addEllipsis Whether to add ellipsis at the end
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength = 100, addEllipsis = true): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + (addEllipsis ? '...' : '');
}

/**
 * Slugify a string (convert to URL-friendly format)
 * 
 * @param text Text to slugify
 * @returns Slugified string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

/**
 * Generate a random alphanumeric code of specified length
 * 
 * @param length Length of code
 * @returns Random alphanumeric code
 */
export function generateRandomCode(length = 6): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .substring(0, length)
    .toUpperCase();
}

/**
 * Check if a string is a valid email address
 * 
 * @param email Email to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid Nigerian phone number
 * 
 * @param phone Phone number to validate
 * @returns Boolean indicating if phone is valid
 */
export function isValidNigerianPhone(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Check if it starts with +234 or 0
  const validStart = cleanPhone.startsWith('+234') || cleanPhone.startsWith('0');
  
  // Check length (should be 11 digits for formats starting with 0, or 13-14 digits for +234)
  const validLength = 
    (cleanPhone.startsWith('0') && cleanPhone.length === 11) || 
    (cleanPhone.startsWith('+234') && (cleanPhone.length === 14 || cleanPhone.length === 13));
  
  return validStart && validLength;
}

/**
 * Generate random password with specified complexity
 * 
 * @param length Password length
 * @returns Random password
 */
export function generateRandomPassword(length = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_-+=<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one of each type
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}