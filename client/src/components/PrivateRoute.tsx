import React, { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: ReactNode;
  role?: string; // Optional role requirement
}

/**
 * Private route component for authenticated access
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
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLocation('/login');
          return;
        }
        
        // Check for user data
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setLocation('/login');
          return;
        }
        
        const user = JSON.parse(userStr);
        
        // If a specific role is required, check for it
        if (role && user.role !== role) {
          console.log(`Role check failed: User role is ${user.role}, required ${role}`);
          setLocation('/unauthorized');
          return;
        }
        
        // User is authorized
        setIsAuthorized(true);
      } catch (error) {
        console.error('Authentication check error:', error);
        setLocation('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, [setLocation, role]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return isAuthorized ? <>{children}</> : null;
};

export default PrivateRoute;