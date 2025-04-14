import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import PropertyPage from "@/pages/property-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import CommunityPage from "@/pages/community-page";
import MarketTrendsPage from "@/pages/market-trends-page";
import AdminDashboard from "@/pages/admin-dashboard";
import AccountSecurityPage from "@/pages/account-security";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import SupportPage from "@/pages/support-page";
import HowItWorksPage from "@/pages/how-it-works";
import JwtAuthTest from "@/pages/jwt-auth-test";
import { ProtectedRoute } from "./lib/protected-route";
import { PageTransitionProvider } from "./contexts/page-transition-context";
import { PageLoading } from "@/components/ui/page-loading";
import { OnboardingProvider } from "./contexts/onboarding-context";
import OnboardingWrapper from "./components/onboarding/OnboardingWrapper";
import { getToken, setToken as setAuthToken, logout } from "./utils/auth";

// Create a context for auth
import React from "react";
export const AuthContext = React.createContext<{
  token: string | null;
  setToken: (token: string | null) => void;
  handleLogout: () => void;
}>({
  token: null,
  setToken: () => {},
  handleLogout: () => {},
});

function Router() {
  const [, setLocation] = useLocation();
  const { token, handleLogout } = React.useContext(AuthContext);

  return (
    <>
      {token && (
        <div className="fixed top-0 right-0 p-4 z-50">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/properties/:id" component={PropertyPage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/community" component={CommunityPage} />
        <Route path="/market-trends" component={MarketTrendsPage} />
        <ProtectedRoute path="/admin" component={AdminDashboard} />
        <ProtectedRoute path="/account/security" component={AccountSecurityPage} />
        <ProtectedRoute path="/analytics" component={AnalyticsDashboard} />
        <ProtectedRoute path="/projects" component={() => import("./components/Projects").then(module => module.default)} />
        <ProtectedRoute path="/users" component={() => import("./components/Users").then(module => module.default)} />
        <Route path="/support" component={SupportPage} />
        <Route path="/how-it-works" component={HowItWorksPage} />
        <Route path="/jwt-auth-test" component={JwtAuthTest} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [, setLocation] = useLocation();

  const setToken = (newToken: string | null) => {
    if (newToken) {
      setAuthToken(newToken);
    } else {
      logout();
    }
    setTokenState(newToken);
  };

  const handleLogout = () => {
    logout();
    setTokenState(null);
    setLocation('/auth');
  };

  return (
    <AuthContext.Provider value={{ token, setToken, handleLogout }}>
      <PageTransitionProvider>
        <OnboardingProvider>
          <OnboardingWrapper>
            <PageLoading />
            <Router />
            <Toaster />
          </OnboardingWrapper>
        </OnboardingProvider>
      </PageTransitionProvider>
    </AuthContext.Provider>
  );
}

export default App;
