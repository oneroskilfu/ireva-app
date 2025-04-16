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
import JwtTestPage from "@/pages/jwt-test-page";

// New imports for reorganized routes
import AdminLayout from "@/components/layouts/AdminLayout";
import InvestorLayout from "@/components/layouts/InvestorLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import InvestorDashboard from "@/pages/investor/InvestorDashboard";
import ProtectedRoute from "@/middleware/AuthMiddleware";

import { ProtectedRoute as LegacyProtectedRoute } from "./lib/protected-route";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

// Create a new QueryClient instance
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
      {/* Public Routes */}
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
      <Route path="/forum" component={ForumPage} />
      <Route path="/forum/topic/:id" component={TopicDetailPage} />
      <Route path="/company/team" component={TeamPage} />
      <Route path="/company/culture" component={CulturePage} />
      <Route path="/company/press" component={PressPage} />
      <Route path="/explore" component={ExplorePage} />

      {/* Legacy Protected Routes - will be deprecated in future */}
      <LegacyProtectedRoute path="/dashboard" component={DashboardPage} requiredRole="user" />
      <LegacyProtectedRoute path="/admin" component={AdminDashboard} requiredRole="admin" />
      <LegacyProtectedRoute path="/analytics" component={AnalyticsPage} requiredRole="user" />
      <LegacyProtectedRoute path="/community" component={CommunityPage} requiredRole="user" />
      <LegacyProtectedRoute path="/portfolio" component={PortfolioPage} requiredRole="user" />
      <LegacyProtectedRoute path="/wallet" component={WalletPage} requiredRole="user" />
      <LegacyProtectedRoute path="/profile" component={ProfilePage} requiredRole="user" />
      <LegacyProtectedRoute path="/verification" component={VerificationPage} requiredRole="user" />
      
      {/* New Admin Routes with Nested Structure */}
      <Route path="/admin-new">
        {() => 
          <ProtectedRoute requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      </Route>
      
      <Route path="/admin-new/dashboard">
        {() => 
          <ProtectedRoute requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      </Route>
      
      {/* New Investor Routes with Nested Structure */}
      <Route path="/investor">
        {() => 
          <ProtectedRoute requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorDashboard />
            </InvestorLayout>
          </ProtectedRoute>
        }
      </Route>
      
      <Route path="/investor/dashboard">
        {() => 
          <ProtectedRoute requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorDashboard />
            </InvestorLayout>
          </ProtectedRoute>
        }
      </Route>
      
      {/* 404 Not Found */}
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