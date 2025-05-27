import React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from 'wouter';
import "./index.css";
import ResponsiveHome from "./ResponsiveHome";
import RegisterPage from "./pages/RegisterPage";

// Simple iREVA application with working navigation
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Switch>
      <Route path="/register" component={RegisterPage} />
      <Route path="/" component={ResponsiveHome} />
    </Switch>
  </React.StrictMode>
);
