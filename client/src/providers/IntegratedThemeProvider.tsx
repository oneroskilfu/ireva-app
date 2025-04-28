import React, { ReactNode } from 'react';
import { MuiThemeProvider } from './MuiThemeProvider';
import { ThemeProvider as ShadcnThemeProvider } from '@/hooks/use-theme';

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
    <MuiThemeProvider>
      <ShadcnThemeProvider>
        {children}
      </ShadcnThemeProvider>
    </MuiThemeProvider>
  );
};

export default IntegratedThemeProvider;