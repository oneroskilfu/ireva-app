import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import PropertyPage from "@/pages/property-page";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin-dashboard";
import UnauthorizedPage from "@/pages/unauthorized-page";
import LoginPage from "@/pages/login-page";
import PrivateRoute from "@/components/PrivateRoute";

function App() {
  return (
    <div>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/unauthorized" component={UnauthorizedPage} />
        <Route path="/properties/:id" component={PropertyPage} />
        
        {/* Admin route with role-based access control */}
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
  );
}

export default App;
