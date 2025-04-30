// Simple logger utility
export const logger = {
  info: (message: string, options?: any) => {
    console.log(`[INFO] ${message}`, options || '');
  },
  warn: (message: string, options?: any) => {
    console.warn(`[WARN] ${message}`, options || '');
  },
  error: (message: string, options?: any) => {
    console.error(`[ERROR] ${message}`, options || '');
  },
  debug: (message: string, options?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, options || '');
    }
  }
};