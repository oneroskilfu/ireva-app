import React, { ReactNode, useState, useEffect, useTransition } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface AuthMiddlewareProps {
  children: ReactNode;
  requiredRoles?: string[];
}

/**
 * Authentication middleware component for protecting routes
 * @param children - Components to render if authentication passes
 * @param requiredRoles - Optional array of roles allowed to access the route
 */
const AuthMiddleware = ({ children, requiredRoles = [] }: AuthMiddlewareProps) => {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isPending, startTransition] = useTransition();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // User is not authenticated
        console.log('User not authenticated, redirecting to auth page');
        startTransition(() => {
          navigate('/auth');
        });
        setIsChecking(false);
        return;
      }

      // If no specific roles are required, all authenticated users are allowed
      if (requiredRoles.length === 0) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Check if user has one of the required roles
      const hasRequiredRole = user.role && requiredRoles.includes(user.role);
      
      if (hasRequiredRole) {
        setIsAuthorized(true);
      } else {
        console.log(`Access denied. Required roles: [${requiredRoles.join(', ')}], user role: ${user.role}`);
        
        // Redirect based on user role - wrapped in startTransition
        startTransition(() => {
          if (user.role === 'admin' || user.role === 'super_admin') {
            navigate('/admin');
          } else {
            navigate('/investor');
          }
        });
      }
      
      setIsChecking(false);
    }
  }, [user, isLoading, navigate, requiredRoles]);

  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
};

export default AuthMiddleware;