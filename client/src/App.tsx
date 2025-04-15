import React from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import PropertyPage from "@/pages/property-page";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/AdminDashboard";
import Dashboard from "@/pages/Dashboard";
import UnauthorizedPage from "@/pages/unauthorized-page";
import LoginPage from "@/pages/login-page";
import TestAuth from "@/pages/test-auth";
import PrivateRoute from "@/components/PrivateRoute";

// Admin Components
import PropertyManagement from "@/pages/Admin/PropertyManagement";
import RoiTracker from "@/pages/Admin/RoiTracker";

function App() {
  return (
    <div>
      <div className="app-container">
        <Switch>
          {/* Public routes */}
          <Route path="/" component={HomePage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/test-auth" component={TestAuth} />
          <Route path="/unauthorized" component={UnauthorizedPage} />
          <Route path="/properties/:id" component={PropertyPage} />
          
          {/* Protected routes */}
          <Route path="/dashboard">
            <PrivateRoute role="investor">
              <Dashboard />
            </PrivateRoute>
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin">
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          </Route>
          
          <Route path="/admin/properties">
            <PrivateRoute role="admin">
              <PropertyManagement />
            </PrivateRoute>
          </Route>
          
          <Route path="/admin/roi-tracker">
            <PrivateRoute role="admin">
              <RoiTracker />
            </PrivateRoute>
          </Route>
          
          <Route component={NotFound} />
        </Switch>
        <Toaster />
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </div>
  );
}

export default App;
