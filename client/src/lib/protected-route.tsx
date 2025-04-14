import React from "react";
import { useLocation, Route, Redirect } from "wouter";
import { useAuth } from "../contexts/auth-context";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  component: React.ComponentType;
  path: string;
}

/**
 * A route component that protects content from unauthenticated users
 * If user is not authenticated (no token), they will be redirected to the login page
 * Works with Wouter for routing
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  path,
  ...rest
}) => {
  const { token, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate checking authentication status
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

  return (
    <Route
      path={path}
      {...rest}
    >
      {isAuthenticated ? (
        <Component />
      ) : (
        <Redirect to="/login" />
      )}
    </Route>
  );
};