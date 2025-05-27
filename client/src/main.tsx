import React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from 'wouter';
import "./index.css";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";

// iREVA application with proper routing
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Switch>
      <Route path="/register" component={RegisterPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  </React.StrictMode>
);
