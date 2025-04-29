import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a basic fallback theme
const fallbackTheme = createTheme();

const SafeThemeProvider = ({ children }) => {
  try {
    if (!fallbackTheme) throw new Error('Theme missing');
    return <ThemeProvider theme={fallbackTheme}>{children}</ThemeProvider>;
  } catch (error) {
    console.error('ThemeProvider error:', error.message);
    return <>{children}</>; // Render children even without a theme
  }
};

export default SafeThemeProvider;