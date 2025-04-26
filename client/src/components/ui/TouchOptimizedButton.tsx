import React from 'react';
import { Button, ButtonProps } from '@mui/material';

// Extend the standard Button props
interface TouchOptimizedButtonProps extends ButtonProps {
  mobilePadding?: string;
  mobileFontSize?: string;
}

export default function TouchOptimizedButton({
  children,
  mobilePadding = '14px 24px', // Default larger padding for touch targets
  mobileFontSize = '16px',      // Default larger font size for readability
  size = 'large',               // Default to large size
  fullWidth = true,             // Default to full width on mobile
  variant = 'contained',        // Default to filled button
  sx,                           // Allow extending styles
  ...rest                       // Pass through all other props
}: TouchOptimizedButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      sx={{
        padding: mobilePadding,
        fontSize: mobileFontSize,
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 'bold',
        minHeight: '48px', // Ensure minimum touch target height
        ...sx
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}

// Example usage:
// <TouchOptimizedButton onClick={handleSubmit}>
//   Submit Investment
// </TouchOptimizedButton>