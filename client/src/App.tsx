import React from "react";
import { Switch, Route, Router } from "wouter";
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
import TestNavigation from "@/components/TestNavigation";

// A custom hook that builds on useLocation to parse the query string
function useHashLocation(): [string, (to: string) => void] {
  const [location, setLocation] = React.useState<string>(
    window.location.hash.replace("#", "") || "/"
  );

  React.useEffect(() => {
    // Handle hash change and initial hash
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") || "/";
      setLocation(hash);
    };

    window.addEventListener("hashchange", handleHashChange);
    
    // Handle initial hash on load
    if (!window.location.hash && window.location.pathname !== "/") {
      // If no hash but a path exists, convert to hash
      window.location.hash = window.location.pathname;
    } else {
      // Otherwise just ensure we have the right initial state
      handleHashChange();
    }

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // To change the location, we need to update the hash
  const setHashLocation = (to: string) => {
    window.location.hash = to;
  };

  return [location, setHashLocation];
}

function App() {
  return (
    <Router hook={useHashLocation}>
      <div>
        <TestNavigation />
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
          
          <Route path="/admin">
            <PrivateRoute role="admin">
              <AdminDashboard />
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
    </Router>
  );
}

export default App;
