import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: ReactNode;
  role?: string; // Optional role requirement
}

/**
 * Simplified Private route component for authenticated access
 * Optionally checks for a specific role if provided
 * Usage:
 * <Route path="/protected-route">
 *   <PrivateRoute role="admin">
 *     <ProtectedComponent />
 *   </PrivateRoute>
 * </Route>
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Short delay to allow rendering
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // If still loading, show a spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    // Not authenticated, redirect to login
    setLocation('/login');
    return null;
  }
  
  // Check role if specified
  if (role) {
    try {
      const user = JSON.parse(userStr);
      if (user.role !== role) {
        console.log(`Role check failed: User role is ${user.role}, required ${role}`);
        setLocation('/unauthorized');
        return null;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      setLocation('/login');
      return null;
    }
  }

  // User is authenticated and has proper role
  return <>{children}</>;
};

export default PrivateRoute;