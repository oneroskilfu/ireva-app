import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import TestHome from "./TestHome";

// Direct TestHome component with beautiful Nigerian real estate design
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <TestHome />
  </React.StrictMode>
);
