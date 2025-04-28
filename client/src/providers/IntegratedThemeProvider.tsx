import React, { ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { theme as muiTheme } from '../theme';
import { ThemeProvider as ShadcnThemeProvider } from '@/hooks/use-theme';
import CssBaseline from '@mui/material/CssBaseline';

interface IntegratedThemeProviderProps {
  children: ReactNode;
}

/**
 * IntegratedThemeProvider combines both Material UI and shadcn theme providers
 * in the correct nesting order to prevent conflicts.
 * 
 * MUI ThemeProvider is the outer provider as it affects global styles,
 * while shadcn ThemeProvider is nested inside to handle its specific context.
 */
export const IntegratedThemeProvider: React.FC<IntegratedThemeProviderProps> = ({ 
  children 
}) => {
  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ShadcnThemeProvider>
        {children}
      </ShadcnThemeProvider>
    </MUIThemeProvider>
  );
};

export default IntegratedThemeProvider;