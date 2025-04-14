import React from "react";
import { useLocation, Route, Redirect } from "wouter";
import { AuthContext } from "../App";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  component: React.ComponentType;
  path: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  path,
  ...rest
}) => {
  const { token } = React.useContext(AuthContext);
  const [location] = useLocation();

  return (
    <Route
      path={path}
      {...rest}
    >
      {token ? (
        <Component />
      ) : (
        <Redirect to="/auth" />
      )}
    </Route>
  );
};