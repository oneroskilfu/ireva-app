import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../hooks/use-auth';

interface RequireRoleProps {
  role: 'admin' | 'investor';
  children: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ role, children }) => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // If user is not authenticated, redirect to login
  if (!user) {
    // In wouter, we use setLocation to navigate
    setLocation('/login');
    return null;
  }

  // If user doesn't have the required role, redirect to unauthorized
  if (user.role !== role) {
    setLocation('/unauthorized');
    return null;
  }

  // User has the required role, render children
  return <>{children}</>;
};

export default RequireRole;