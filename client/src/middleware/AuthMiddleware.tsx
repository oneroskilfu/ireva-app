import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

/**
 * Component to protect routes based on authentication and role
 */
export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    console.log("Protected route check - User:", user, "Required roles:", requiredRoles);
    
    if (!isLoading) {
      // Not authenticated
      if (!user) {
        console.log("User not authenticated, redirecting to login");
        setAuthorized(false);
        return;
      }
      
      // No specific roles required or user has required role
      if (requiredRoles.length === 0 || (user && user.role && requiredRoles.includes(user.role))) {
        console.log("User authorized");
        setAuthorized(true);
        return;
      }
      
      // User doesn't have required role
      console.log("User doesn't have required role, redirecting");
      setAuthorized(false);
    }
  }, [user, isLoading, requiredRoles, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authorized === false) {
    return <Redirect to={user ? "/" : "/auth"} />;
  }

  if (authorized === true) {
    return <>{children}</>;
  }

  // Still determining authorization state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default ProtectedRoute;