// src/components/PrivateRoute.js
import React from 'react';
import { useLocation } from 'wouter';
import { getToken } from '../utils/auth';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const [, setLocation] = useLocation();
  const isAuthenticated = !!getToken();
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    React.useEffect(() => {
      setLocation('/auth');
    }, [setLocation]);
    return null;
  }
  
  // Render the protected component if authenticated
  return <Component {...rest} />;
};

export default PrivateRoute;