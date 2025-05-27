import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ResponsiveHome from "./ResponsiveHome";

// Responsive iREVA homepage with no overlapping sections and proper footer
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ResponsiveHome />
  </React.StrictMode>
);
