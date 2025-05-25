import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import FastHome from "./FastHome";

// Direct FastHome component to minimize dependencies
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FastHome />
  </React.StrictMode>
);
