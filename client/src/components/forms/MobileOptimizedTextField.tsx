import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

/**
 * MobileOptimizedTextField component that wraps Material-UI's TextField
 * with optimizations for touch interfaces
 */
export default function MobileOptimizedTextField({
  label,
  fullWidth = true,
  margin = "normal",
  sx,
  InputProps,
  ...props
}: TextFieldProps) {
  return (
    <TextField
      label={label}
      fullWidth={fullWidth}
      margin={margin}
      InputProps={{
        sx: { 
          fontSize: '16px',   // Larger text for readability
          height: '56px',     // Taller height for better touch targets
          '& .MuiOutlinedInput-input': {
            padding: '14px 16px', // Larger padding
          },
          ...InputProps?.sx
        },
        ...InputProps
      }}
      // Larger label for readability
      InputLabelProps={{
        sx: { 
          fontSize: '16px',
          ...props.InputLabelProps?.sx
        },
        ...props.InputLabelProps
      }}
      // Custom styling for the component
      sx={{
        mb: 2,   // Add bottom margin
        '& .MuiFormHelperText-root': {
          fontSize: '14px',  // Larger helper text
        },
        ...sx
      }}
      {...props}
    />
  );
}

// Example usage:
// <MobileOptimizedTextField 
//   label="Amount to Invest" 
//   name="amount"
//   type="number"
//   required
//   error={!!errors.amount}
//   helperText={errors.amount?.message}
// />