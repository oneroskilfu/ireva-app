/**
 * Generate a unique reference ID for transactions
 * @param {string} prefix - Prefix for the reference (e.g., 'INV', 'TXN', 'ROI')
 * @returns {string} - A unique reference ID
 */
export function generateReference(prefix = 'TXN') {
  // Get current date components
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Generate 6 random alphanumeric characters
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Combine all parts to create a unique reference
  return `${prefix}-${year}${month}${day}-${hours}${minutes}${seconds}-${randomChars}`;
}

// For backward compatibility with JS controller
export const generateInvestmentReference = (prefix = 'INV') => generateReference(prefix);