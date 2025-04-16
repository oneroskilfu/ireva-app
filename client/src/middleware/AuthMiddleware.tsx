import { useEffect, useState, ReactNode } from 'react';
import { Redirect, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { hasRole, UserRole } from '@/shared/guards';
import { Loader2 } from 'lucide-react';

interface AuthMiddlewareProps {
  children: ReactNode;
  requiredRoles: UserRole | UserRole[];
  redirectTo?: string;
}

/**
 * Component to protect routes based on user roles
 * If the user is not logged in or doesn't have the required role, they are redirected
 */
const AuthMiddleware = ({
  children,
  requiredRoles,
  redirectTo = '/auth',
}: AuthMiddlewareProps) => {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    // Wait for auth to initialize
    if (!isLoading) {
      if (!user) {
        console.log('No authenticated user found. Redirecting to login...');
        setLocation(redirectTo);
      } else {
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        
        if (!hasRole(user, roles)) {
          console.log('User does not have required role. Current role:', user.role);
          console.log('Required roles:', roles);
          // Redirect to dashboard or another appropriate page based on their actual role
          if (user.role === 'admin' || user.role === 'super_admin') {
            setLocation('/admin');
          } else {
            setLocation('/dashboard');
          }
        }
      }
      setChecking(false);
    }
  }, [user, isLoading, requiredRoles, redirectTo, setLocation]);

  // Show loading state
  if (isLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If we're still here and user has the required role, render children
  if (user && hasRole(user, requiredRoles)) {
    return <>{children}</>;
  }

  // Default fallback - shouldn't reach here due to redirects in useEffect
  return <Redirect to={redirectTo} />;
};

export default AuthMiddleware;