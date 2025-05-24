import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
  requiredRole?: 'admin' | 'investor';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  path,
  requiredRole,
  ...rest
}) => {
  const { user, isLoading } = useAuth();
  
  // Return a Route component that renders conditionally
  return (
    <Route
      path={path}
      {...rest}
    >
      {() => {
        // If authentication is still loading, show a loading indicator
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          );
        }
        
        // If user is not authenticated, redirect to login
        if (!user) {
          return <Redirect to="/auth" />;
        }
        
        // If there's a required role and user doesn't have it, redirect to appropriate dashboard
        if (requiredRole && user.role !== requiredRole) {
          // If an admin tries to access investor pages, redirect to admin dashboard
          if (user.role === 'admin' && requiredRole === 'investor') {
            return <Redirect to="/admin/dashboard" />;
          }
          
          // If an investor tries to access admin pages, redirect to investor dashboard
          if (user.role === 'investor' && requiredRole === 'admin') {
            return <Redirect to="/investor/dashboard" />;
          }
        }
        
        // If authenticated and authorized, render the component
        return <Component />;
      }}
    </Route>
  );
};