import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import StaticHome from "./pages/StaticHome";

// Direct StaticHome component with beautiful Nigerian real estate design
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StaticHome />
  </React.StrictMode>
);
