import { Route, useLocation } from 'wouter';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Loader2 } from 'lucide-react';

type Props = {
  path: string;
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
};

export const ProtectedRoute = ({ 
  path, 
  children, 
  allowedRoles,
  redirectTo = '/auth'
}: Props) => {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Store the attempted URL for redirect after login
        sessionStorage.setItem('redirectAfterLogin', location);
        setLocation(redirectTo);
      } else if (!hasRole(allowedRoles)) {
        setLocation('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, hasRole, allowedRoles, location, redirectTo, setLocation]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render route if not authenticated or unauthorized
  if (!isAuthenticated || !hasRole(allowedRoles)) {
    return null;
  }

  // User is authenticated and authorized
  return <Route path={path}>{children}</Route>;
};

export default ProtectedRoute;