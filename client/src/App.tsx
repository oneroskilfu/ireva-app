import React from "react";
import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import PropertyPage from "@/pages/property-page";
import AuthPage from "@/pages/auth-page";
// Import from JSX file directly for the updated admin dashboard
import AdminDashboard from "@/pages/AdminDashboard.jsx";
import AdminKYCPage from "@/pages/AdminKYCPage.jsx";
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
          <Route path="/properties">
            {() => <div className="container p-8">
              <h1 className="text-3xl font-bold mb-6">Property Listings</h1>
              <p className="mb-4">This is a placeholder for the PropertyListing page which requires React Router DOM. 
              You previously worked on this page in client/src/pages/PropertyListing.jsx.</p>
              <p className="text-red-600">Note: There's a routing inconsistency - App.tsx uses Wouter but PropertyListing.jsx uses React Router DOM.</p>
              <div className="mt-6">
                <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Back to Home</a>
              </div>
            </div>}
          </Route>
          
          {/* Protected routes */}
          <Route path="/dashboard">
            <PrivateRoute role="investor">
              <Dashboard />
            </PrivateRoute>
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin/dashboard">
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          </Route>
          
          {/* Redirect /admin to /admin/dashboard */}
          <Route path="/admin">
            <Redirect to="/admin/dashboard" />
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
          
          <Route path="/admin/kyc">
            <PrivateRoute role="admin">
              <AdminKYCPage />
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
