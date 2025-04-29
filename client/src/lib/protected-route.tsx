import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Route, useLocation } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: "admin" | "super_admin" | "investor";
  roles?: string[];
}

export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
  roles = [],
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  // Combine requiredRole and roles for easier handling
  const allowedRoles = requiredRole ? [...roles, requiredRole] : roles;

  // Using useEffect for redirection
  useEffect(() => {
    if (!isLoading) {
      // Redirect to auth if no user
      if (!user) {
        console.log("User not authenticated, redirecting to auth page");
        navigate("/auth");
        return;
      } 
      
      // If roles requirement specified, check if user has an allowed role
      if (allowedRoles.length > 0 && user.role && !allowedRoles.includes(user.role)) {
        console.log(`Access denied. Required roles: ${allowedRoles.join(', ')}, user role: ${user.role}`);
        
        // Redirect to a more appropriate location based on user's role
        if (user.role === "admin" || user.role === "super_admin") {
          navigate("/admin");
        } else {
          navigate("/investor/dashboard");
        }
      }
    }
  }, [user, isLoading, navigate, allowedRoles]);

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

  // Role check
  if (allowedRoles.length > 0 && user.role && !allowedRoles.includes(user.role)) {
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
