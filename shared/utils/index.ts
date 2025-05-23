// iREVA Platform - Shared Utilities
// Common utility functions used across frontend and backend

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// UI Utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency Utilities
export const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
  const formatters = {
    NGN: new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }),
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    BTC: new Intl.NumberFormat('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 }),
    USDT: new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
  };

  const formatter = formatters[currency as keyof typeof formatters];
  if (!formatter) return `${amount} ${currency}`;

  if (currency === 'BTC') return `${formatter.format(amount)} BTC`;
  if (currency === 'USDT') return `${formatter.format(amount)} USDT`;
  
  return formatter.format(amount);
};

// Date Utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const timeAgo = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

// Validation Utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Crypto Utilities
export const formatCryptoAddress = (address: string, length: number = 8): string => {
  if (address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

// File Utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Number Utilities
export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

export const calculateROI = (initial: number, current: number): number => {
  if (initial === 0) return 0;
  return ((current - initial) / initial) * 100;
};