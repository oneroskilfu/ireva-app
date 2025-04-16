import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import PropertyPage from "@/pages/property-page";
import PropertiesPage from "@/pages/properties-page";
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
import AdminDashboard from "@/pages/admin/admin-dashboard";
import JwtTestPage from "@/pages/jwt-test-page";
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
      <Route path="/property/:id" component={PropertyPage} />
      <Route path="/properties" component={PropertiesPage} />
      <Route path="/properties/residential" component={PropertiesPage} />
      <Route path="/properties/commercial" component={PropertiesPage} />
      <Route path="/properties/industrial" component={PropertiesPage} />
      <Route path="/properties/mixed-use" component={PropertiesPage} />
      <Route path="/properties/land" component={PropertiesPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/jwt-test" component={JwtTestPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} requiredRole="user" />
      <ProtectedRoute path="/admin" component={AdminDashboard} requiredRole="admin" />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} requiredRole="user" />
      <ProtectedRoute path="/community" component={CommunityPage} requiredRole="user" />
      <ProtectedRoute path="/portfolio" component={PortfolioPage} requiredRole="user" />
      <ProtectedRoute path="/wallet" component={WalletPage} requiredRole="user" />
      <ProtectedRoute path="/profile" component={ProfilePage} requiredRole="user" />
      <ProtectedRoute path="/verification" component={VerificationPage} requiredRole="user" />
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
