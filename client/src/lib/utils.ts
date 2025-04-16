import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined) return "₦0";
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'text-yellow-500';
    case 'completed':
    case 'approved':
    case 'verified':
    case 'active':
      return 'text-green-500';
    case 'rejected':
    case 'failed':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

export function getStatusBadgeVariant(status: string): "default" | "destructive" | "outline" | "secondary" {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'secondary';
    case 'completed':
    case 'approved':
    case 'verified':
    case 'active':
      return 'default';
    case 'rejected':
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
}