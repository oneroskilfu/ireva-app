import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme.basic";
import MinimalApp from "./MinimalApp";
import "./index.css";

// Minimal render with just ThemeProvider and CssBaseline
createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <MinimalApp />
  </ThemeProvider>
);