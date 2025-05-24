import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#4B3B2A', // Coffee Brown
    },
    secondary: {
      main: '#FFFFFF', // White
    },
    background: {
      default: '#FAFAFA',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});