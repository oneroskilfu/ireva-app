import { createTheme } from '@mui/material/styles';

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const theme = baseTheme || createTheme(); // fallback theme

export default theme;