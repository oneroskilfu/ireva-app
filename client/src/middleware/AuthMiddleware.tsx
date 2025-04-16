import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useRouter } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user, isLoading, checkAuth } = useAuth();
  const [, navigate] = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsChecking(true);
      
      if (isLoading) {
        return; // Wait for initial auth check to complete
      }
      
      try {
        // If no user is logged in, try to authenticate
        if (!user) {
          await checkAuth();
        }
        
        // Check if user is authenticated
        if (!user) {
          // Redirect to login page
          navigate('/auth');
          return;
        }
        
        // If roles are specified, check if user has required role
        if (requiredRoles.length > 0) {
          const hasRequiredRole = requiredRoles.includes(user.role);
          
          if (!hasRequiredRole) {
            // Redirect based on role
            switch (user.role) {
              case 'admin':
              case 'super_admin':
                navigate('/admin');
                break;
              case 'user':
                navigate('/investor');
                break;
              default:
                navigate('/');
                break;
            }
            return;
          }
        }
        
        // User is authorized
        setIsAuthorized(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        navigate('/auth');
      } finally {
        setIsChecking(false);
      }
    };
    
    verifyAuth();
  }, [user, isLoading, checkAuth, navigate, requiredRoles]);
  
  // Show loading state while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying your access...</p>
        </div>
      </div>
    );
  }
  
  // Render children if authorized
  return isAuthorized ? <>{children}</> : null;
};

export default AuthMiddleware;