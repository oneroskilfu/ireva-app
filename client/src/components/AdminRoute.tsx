import React, { useEffect, useState } from 'react';
import { Route, useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface AdminRouteProps {
  component: React.ComponentType;
  path: string;
}

interface JwtPayload {
  role?: string;
  [key: string]: any;
}

/**
 * Protected route component for admin-only access
 * Checks if user has a valid token and admin role before allowing access
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ component: Component, path }) => {
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for token and admin role
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLocation('/login');
          return;
        }
        
        // First, decode token to do a quick client-side check
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          if (!decoded || decoded.role !== 'admin') {
            console.log('Client-side token check: Not an admin user');
            setLocation('/unauthorized');
            return;
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          setLocation('/login');
          return;
        }
        
        // Then, verify with the server to ensure the token is valid 
        // and the user is actually an admin
        try {
          // Add the token to request headers
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          };
          
          // Make a request to your auth verification endpoint
          const response = await axios.get('/api/auth/verify', config);
          
          // Check if user exists and has admin role
          if (!response.data || !response.data.user || response.data.user.role !== 'admin') {
            console.log('Server-side check: Not an admin user');
            setLocation('/unauthorized');
            return;
          }
          
          // If we get here, the user is a valid admin
          setIsAdmin(true);
        } catch (error) {
          console.error('Server verification failed:', error);
          setLocation('/login');
          return;
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setLocation('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [setLocation]);
  
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }
  
  return (
    <Route path={path}>
      {isAdmin ? <Component /> : null}
    </Route>
  );
};

export default AdminRoute;