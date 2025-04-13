import { useAuth } from "@/hooks/use-auth";
import { Redirect, Route } from "wouter";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { usePageTransition } from "@/contexts/page-transition-context";
import { useEffect } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading: authLoading } = useAuth();
  const { startLoading, stopLoading } = usePageTransition();

  useEffect(() => {
    if (authLoading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [authLoading, startLoading, stopLoading]);

  if (authLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingIndicator size="md" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />
}
