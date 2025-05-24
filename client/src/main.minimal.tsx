import { createRoot } from "react-dom/client";
import MinimalApp from "./MinimalApp";
import "./index.css";

// Completely isolated, minimal renderer
// No additional providers, authentication, or theme wrappers
createRoot(document.getElementById("root")!).render(
  <MinimalApp />
);