import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import SimpleApp from "./SimpleApp";

// Using simple app to bypass build errors and show StaticHome
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);
