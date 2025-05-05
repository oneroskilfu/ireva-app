import { Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
  requiredRole?: "admin" | "investor" | "super_admin" | null;
};

/**
 * A route that requires authentication
 * If not authenticated, redirects to /auth
 * If authenticated but without the required role, redirects to /unauthorized
 */
export function ProtectedRoute({ 
  path, 
  component: Component,
  requiredRole = null 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        if (requiredRole && user.role !== requiredRole) {
          return <Redirect to="/unauthorized" />;
        }

        return <Component />;
      }}
    </Route>
  );
}

/**
 * A route that requires admin authentication
 * Shorthand for ProtectedRoute with requiredRole="admin"
 */
export function AdminRoute({ path, component }: Omit<ProtectedRouteProps, "requiredRole">) {
  return <ProtectedRoute path={path} component={component} requiredRole="admin" />;
}

/**
 * A route that requires investor authentication 
 * Shorthand for ProtectedRoute with requiredRole="investor"
 */
export function InvestorRoute({ path, component }: Omit<ProtectedRouteProps, "requiredRole">) {
  return <ProtectedRoute path={path} component={component} requiredRole="investor" />;
}

/**
 * A route that requires super admin authentication
 * Shorthand for ProtectedRoute with requiredRole="super_admin"
 */
export function SuperAdminRoute({ path, component }: Omit<ProtectedRouteProps, "requiredRole">) {
  return <ProtectedRoute path={path} component={component} requiredRole="super_admin" />;
}