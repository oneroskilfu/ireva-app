import { createRoot } from "react-dom/client";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme.basic';
import "./index.css";
import BasicApp from "./BasicApp";

// Create a clean, simple initialization with proper ThemeProvider
createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BasicApp />
  </ThemeProvider>
);