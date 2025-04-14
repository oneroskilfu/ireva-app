import { useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useLocation } from 'wouter';

/**
 * Hook to check if the current user is an admin, and redirect if not
 * Returns true if admin, otherwise redirects to unauthorized page
 */
export function useAdminCheck() {
  const { role } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (role !== 'admin') {
      setLocation('/unauthorized');
    }
  }, [role, setLocation]);

  return role === 'admin';
}