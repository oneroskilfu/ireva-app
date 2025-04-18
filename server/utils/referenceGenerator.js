/**
 * Generates a unique reference number for investments
 * Format: INV-{timestamp}-{random}
 */
const generateInvestmentReference = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${timestamp}-${random}`;
};

/**
 * Generates a unique reference number for deposits
 * Format: DEP-{timestamp}-{random}
 */
const generateDepositReference = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DEP-${timestamp}-${random}`;
};

/**
 * Generates a unique reference number for withdrawals
 * Format: WIT-{timestamp}-{random}
 */
const generateWithdrawalReference = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WIT-${timestamp}-${random}`;
};

/**
 * Generates a unique reference number for returns (ROI payments)
 * Format: RET-{timestamp}-{random}
 */
const generateReturnReference = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RET-${timestamp}-${random}`;
};

/**
 * Generates a unique reference number for general transactions
 * Format: TRX-{timestamp}-{random}
 */
const generateTransactionReference = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TRX-${timestamp}-${random}`;
};

module.exports = {
  generateInvestmentReference,
  generateDepositReference,
  generateWithdrawalReference,
  generateReturnReference,
  generateTransactionReference
};