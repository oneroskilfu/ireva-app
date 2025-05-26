import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import BrandedHome from "./BrandedHome";

// Official iREVA branded homepage with complete brand guidelines
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrandedHome />
  </React.StrictMode>
);
