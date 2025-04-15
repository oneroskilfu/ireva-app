// src/components/PrivateRoute.js
import React from 'react';
import { useLocation } from 'wouter';
import { getToken, getUserRole } from '../utils/auth';

const PrivateRoute = ({ component: Component, role, ...rest }) => {
  const [, setLocation] = useLocation();
  const isAuthenticated = !!getToken();
  const userRole = getUserRole();
  
  React.useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      setLocation('/');
    } else if (role && userRole !== role) {
      // Redirect to appropriate dashboard if role doesn't match
      setLocation(userRole === 'admin' ? '/admin' : '/investor');
    }
  }, [isAuthenticated, role, userRole, setLocation]);
  
  // If not authenticated or wrong role, don't render anything
  if (!isAuthenticated || (role && userRole !== role)) {
    return null;
  }
  
  // Render the protected component if authenticated and role matches
  return <Component {...rest} />;
};

export default PrivateRoute;