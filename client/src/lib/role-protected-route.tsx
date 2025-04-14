import React from "react";
import { Route, Redirect } from "wouter";
import { useAuth } from "../contexts/auth-context";
import { Loader2 } from "lucide-react";

interface RoleProtectedRouteProps {
  component: React.ComponentType;
  path: string;
  allowedRoles: string[];
}

/**
 * A route component that protects content based on user roles
 * Only allows access if the user is authenticated AND has one of the allowed roles
 * Redirects to login page if not authenticated or displays unauthorized message if authenticated but wrong role
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  component: Component,
  path,
  allowedRoles,
  ...rest
}) => {
  const { isAuthenticated, role, user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate checking authentication and role status
    const checkAuth = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(checkAuth);
  }, []);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <Route path={path}>
        <Redirect to="/login" />
      </Route>
    );
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(role);

  return (
    <Route
      path={path}
      {...rest}
    >
      {hasRequiredRole ? (
        <Component />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-2">
            You don't have permission to access this page.
          </p>
          <p className="text-gray-600 mb-6">
            Current role: {role || "none"} | Required roles: {allowedRoles.join(", ")}
          </p>
          <a 
            href="/"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </a>
        </div>
      )}
    </Route>
  );
};