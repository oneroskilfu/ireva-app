import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import PropertyPage from "@/pages/property-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import AnalyticsPage from "@/pages/analytics-page";
import CommunityPage from "@/pages/community-page";
import ForumPage from "@/pages/forum-page";
import TopicDetailPage from "@/pages/topic-detail-page";
import VerificationPage from "@/pages/verification-page";
import TeamPage from "@/pages/company/team-page";
import CulturePage from "@/pages/company/culture-page";
import PressPage from "@/pages/company/press-page";
import PortfolioPage from "@/pages/portfolio-page";
import WalletPage from "@/pages/wallet-page";
import ProfilePage from "@/pages/profile-page";
import ExplorePage from "@/pages/explore-page";
import MobileHomePage from "@/pages/mobile-home-page";
import { ProtectedRoute } from "./lib/protected-route";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

function Router() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Function to check if viewport is mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  return (
    <Switch>
      <Route path="/" component={isMobile ? MobileHomePage : HomePage} />
      <Route path="/properties/:id" component={PropertyPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} />
      <ProtectedRoute path="/community" component={CommunityPage} />
      <ProtectedRoute path="/portfolio" component={PortfolioPage} />
      <ProtectedRoute path="/wallet" component={WalletPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/verification" component={VerificationPage} />
      <Route path="/forum" component={ForumPage} />
      <Route path="/forum/topic/:id" component={TopicDetailPage} />
      <Route path="/company/team" component={TeamPage} />
      <Route path="/company/culture" component={CulturePage} />
      <Route path="/company/press" component={PressPage} />
      <Route path="/explore" component={ExplorePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
