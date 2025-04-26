import React from 'react';
import { Button, ButtonProps, useTheme } from '@mui/material';

interface TouchOptimizedButtonProps extends ButtonProps {
  elevation?: number;
  fullWidth?: boolean;
  borderRadius?: number;
}

/**
 * TouchOptimizedButton is designed specifically for mobile interfaces with
 * larger touch targets and visual feedback optimized for touch interactions.
 * It extends the standard MUI Button with mobile-first enhancements.
 */
const TouchOptimizedButton: React.FC<TouchOptimizedButtonProps> = ({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'large',
  elevation = 1,
  fullWidth = false,
  borderRadius = 4,
  sx,
  ...props
}) => {
  const theme = useTheme();
  
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      sx={{
        // Increase touch target size
        minHeight: size === 'small' ? 40 : size === 'medium' ? 48 : 56,
        
        // Enhance visual feedback
        position: 'relative',
        overflow: 'hidden',
        borderRadius: borderRadius,
        textTransform: 'none',
        fontWeight: 'medium',
        fontSize: size === 'small' ? 14 : 16,
        boxShadow: elevation ? theme.shadows[elevation] : 'none',
        
        // Active state feedback (press effect)
        '&:active': {
          transform: 'scale(0.98)',
          boxShadow: elevation ? theme.shadows[elevation - 1 < 0 ? 0 : elevation - 1] : 'none',
        },
        
        // Ripple effect enhancement
        '& .MuiTouchRipple-root': {
          opacity: 0.5,
        },
        
        // Increase spacing for better readability and touch targets
        px: size === 'small' ? 2 : size === 'medium' ? 3 : 4,
        
        ...sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default TouchOptimizedButton;