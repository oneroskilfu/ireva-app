/**
 * Format a currency amount with the appropriate symbol and precision
 * @param amount The numeric amount to format
 * @param currency The currency code (e.g., 'USD', 'BTC', 'ETH')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string): string {
  // Currency formatting options
  const currencyFormatMap: Record<string, { symbol: string, precision: number, position: 'prefix' | 'suffix' }> = {
    // Fiat currencies
    'NGN': { symbol: '₦', precision: 2, position: 'prefix' },
    'USD': { symbol: '$', precision: 2, position: 'prefix' },
    'EUR': { symbol: '€', precision: 2, position: 'prefix' },
    'GBP': { symbol: '£', precision: 2, position: 'prefix' },
    
    // Cryptocurrencies
    'BTC': { symbol: 'BTC', precision: 8, position: 'suffix' },
    'ETH': { symbol: 'ETH', precision: 6, position: 'suffix' },
    'USDT': { symbol: 'USDT', precision: 2, position: 'suffix' },
    'USDC': { symbol: 'USDC', precision: 2, position: 'suffix' },
    'BNB': { symbol: 'BNB', precision: 4, position: 'suffix' },
    'XRP': { symbol: 'XRP', precision: 4, position: 'suffix' },
    'ADA': { symbol: 'ADA', precision: 4, position: 'suffix' },
    'SOL': { symbol: 'SOL', precision: 4, position: 'suffix' },
    'MATIC': { symbol: 'MATIC', precision: 4, position: 'suffix' }
  };
  
  // Default formatting if currency not in map
  const formatConfig = currencyFormatMap[currency.toUpperCase()] || { 
    symbol: currency.toUpperCase(), 
    precision: 2,
    position: 'suffix'
  };
  
  // Format the number with the appropriate precision
  const formattedNumber = amount.toLocaleString('en-US', {
    minimumFractionDigits: formatConfig.precision,
    maximumFractionDigits: formatConfig.precision,
  });
  
  // Apply symbol according to position preference
  if (formatConfig.position === 'prefix') {
    return `${formatConfig.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${formatConfig.symbol}`;
  }
}

/**
 * Formats a date string into a readable format
 * @param dateString Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Truncates a wallet address or transaction hash for display
 * @param address The full address/hash to truncate
 * @param startChars Number of characters to show at the start
 * @param endChars Number of characters to show at the end
 * @returns Truncated address with ellipsis
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return '';
  
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format a file size in bytes to a human-readable format
 * @param bytes Size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}