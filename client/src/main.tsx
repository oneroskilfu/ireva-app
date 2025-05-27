import React from "react";
import { createRoot } from "react-dom/client";
import { Route, Switch } from 'wouter';
import "./index.css";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import PropertyListPage from "./pages/PropertyListPage";

// iREVA application with complete routing
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/properties" component={PropertyListPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  </React.StrictMode>
);
