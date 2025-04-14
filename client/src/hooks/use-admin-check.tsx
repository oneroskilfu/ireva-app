import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/auth-context';

/**
 * A hook that redirects to the unauthorized page if the user is not an admin
 * @returns {boolean} True if the user is an admin, false otherwise
 */
export function useAdminCheck(): boolean {
  const { role, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If the user is not authenticated or not an admin, redirect to the unauthorized page
    if (!isAuthenticated || role !== 'admin') {
      setLocation('/unauthorized');
    }
  }, [isAuthenticated, role, setLocation]);

  return role === 'admin';
}

/**
 * A simpler version of useAdminCheck that doesn't redirect, just returns whether the user is an admin
 */
export function useIsAdmin(): boolean {
  const { role } = useAuth();
  return role === 'admin';
}