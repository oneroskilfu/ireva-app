declare module '../utils/toastUtil' {
  import { toast as reactToastify } from 'react-toastify';
  
  export const toast: typeof reactToastify;
  
  export function showSuccessToast(message: string): void;
  export function showErrorToast(message: string): void;
  export function showInfoToast(message: string): void;
  export function showWarningToast(message: string): void;
  export function dismissAllToasts(): void;
  export function showLoadingToast(message: string): string | number;
  export function updateToast(toastId: string | number, type: string, message: string): void;
}