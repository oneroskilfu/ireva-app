import { Switch, Route } from "wouter";
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
import { ProtectedRoute } from "./lib/protected-route";
import { PageTransitionProvider } from "./contexts/page-transition-context";
import { PageLoading } from "@/components/ui/page-loading";
import { OnboardingProvider } from "./contexts/onboarding-context";
import OnboardingWrapper from "./components/onboarding/OnboardingWrapper";

function Router() {
  return (
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
      <Route path="/support" component={SupportPage} />
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <PageTransitionProvider>
      <OnboardingProvider>
        <OnboardingWrapper>
          <PageLoading />
          <Router />
          <Toaster />
        </OnboardingWrapper>
      </OnboardingProvider>
    </PageTransitionProvider>
  );
}

export default App;
