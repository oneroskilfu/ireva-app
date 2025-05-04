import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth, UserRole } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole | UserRole[];
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = "/auth",
}: ProtectedRouteProps) {
  const { user, isLoading, hasRole } = useAuth();

  // Show loading state while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect to={fallbackPath} />;
  }

  // If roles are specified, check if user has the required role
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Redirect to="/unauthorized" />;
  }

  // User is authenticated and has the required role (if specified)
  return <>{children}</>;
}

interface RequireRoleProps {
  children: ReactNode;
  role: UserRole | UserRole[];
  fallbackElement?: ReactNode;
}

export function RequireRole({
  children,
  role,
  fallbackElement,
}: RequireRoleProps) {
  const { hasRole } = useAuth();

  if (!hasRole(role)) {
    return fallbackElement ? <>{fallbackElement}</> : null;
  }

  return <>{children}</>;
}