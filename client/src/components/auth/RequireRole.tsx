import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface RequireRoleProps {
  role: 'admin' | 'investor' | string[];
  children: React.ReactNode;
  redirectTo?: string;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ 
  role, 
  children, 
  redirectTo = '/login' 
}) => {
  const { user, isLoading, isRefreshing } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect once loading is complete
    if (!isLoading && !isRefreshing) {
      // If user is not authenticated, redirect to login
      if (!user) {
        // Store the attempted URL for redirect after login
        sessionStorage.setItem('redirectAfterLogin', location);
        setLocation(redirectTo);
      } 
      // If role is an array, check if user has any of the specified roles
      else if (Array.isArray(role) && !role.includes(user.role)) {
        setLocation('/unauthorized');
      }
      // If role is a string, check if user has that specific role
      else if (typeof role === 'string' && user.role !== role) {
        setLocation('/unauthorized');
      }
    }
  }, [user, isLoading, isRefreshing, role, location, setLocation, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading || isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only render children if user exists and has correct role
  if (!user) return null;
  
  // Check role access
  if (Array.isArray(role) && !role.includes(user.role)) return null;
  if (typeof role === 'string' && user.role !== role) return null;

  // User has the required role, render children
  return <>{children}</>;
};

// Standalone component that protects a route without wrapping children
export const ProtectedRoute = ({ 
  component: Component, 
  role = ['admin', 'investor'],
  ...rest 
}: {
  component: React.ComponentType;
  role?: 'admin' | 'investor' | string[];
  path?: string;
}) => {
  return (
    <RequireRole role={role} {...rest}>
      <Component />
    </RequireRole>
  );
};

export default RequireRole;