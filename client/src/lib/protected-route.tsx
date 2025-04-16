import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Redirect, Route, useLocation } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: "admin" | "super_admin" | "user";
}

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Using a more reliable approach with useEffect for redirection
  useEffect(() => {
    if (!isLoading) {
      // Redirect to auth if no user
      if (!user) {
        console.log("User not authenticated, redirecting to auth page");
        navigate("/auth");
      } 
      // If role requirement specified, check if user has the required role
      else if (requiredRole && user.role !== requiredRole) {
        console.log(`Access denied. Required role: ${requiredRole}, user role: ${user.role}`);
        // Redirect to a more appropriate location based on user's role
        if (user.role === "admin" || user.role === "super_admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    }
  }, [user, isLoading, navigate, requiredRole]);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <p>Please log in to access this page. Redirecting...</p>
        </div>
      </Route>
    );
  }

  // Role check failed
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <p>You don't have permission to access this page. Redirecting...</p>
        </div>
      </Route>
    );
  }

  // All checks passed
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}
