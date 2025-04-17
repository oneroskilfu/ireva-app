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
import TestLogin from "./test-login";
import DebugLoginPage from "@/pages/DebugLoginPage";
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
      <Route path="/test-login" component={TestLogin} />
      <Route path="/debug-login" component={DebugLoginPage} />
      <Route path="/forum" component={ForumPage} />
      <Route path="/forum/topic/:id" component={TopicDetailPage} />
      <Route path="/company/team" component={TeamPage} />
      <Route path="/company/culture" component={CulturePage} />
      <Route path="/company/press" component={PressPage} />
      <Route path="/explore" component={ExplorePage} />
      
      {/* Legacy Protected Routes - will be deprecated gradually */}
      <ProtectedRoute path="/dashboard" component={DashboardPage} requiredRole="user" />
      <ProtectedRoute path="/admin" component={AdminDashboard} requiredRole="admin" />
      <ProtectedRoute path="/analytics" component={AnalyticsPage} requiredRole="user" />
      <ProtectedRoute path="/community" component={CommunityPage} requiredRole="user" />
      <ProtectedRoute path="/portfolio" component={PortfolioPage} requiredRole="user" />
      <ProtectedRoute path="/wallet" component={WalletPage} requiredRole="user" />
      <ProtectedRoute path="/profile" component={ProfilePage} requiredRole="user" />
      <ProtectedRoute path="/verification" component={VerificationPage} requiredRole="user" />
      
      {/* New Admin Routes with Nested Structure */}
      <Route path="/admin-new">
        {() => {
          // Use dynamic import to avoid having to move the file immediately
          const NewProtectedRoute = require('@/middleware/AuthMiddleware').default;
          const AdminLayout = require('@/components/layouts/AdminLayout').default;
          const AdminDashboard = require('@/pages/admin/AdminDashboard').default;
          
          return (
            <NewProtectedRoute requiredRoles={["admin", "super_admin"]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </NewProtectedRoute>
          );
        }}
      </Route>
      
      {/* Admin KYC Management Route */}
      <Route path="/admin/kyc">
        {() => {
          const NewProtectedRoute = require('@/middleware/AuthMiddleware').default;
          const KYCManagementPage = require('@/pages/admin/kyc-management').default;
          
          return (
            <NewProtectedRoute requiredRoles={["admin", "super_admin"]}>
              <KYCManagementPage />
            </NewProtectedRoute>
          );
        }}
      </Route>

      {/* Admin Projects Management Route */}
      <Route path="/admin/projects">
        {() => {
          const NewProtectedRoute = require('@/middleware/AuthMiddleware').default;
          const AdminProjectsPage = require('@/pages/admin/AdminProjectsPage').default;
          
          return (
            <NewProtectedRoute requiredRoles={["admin", "super_admin"]}>
              <AdminProjectsPage />
            </NewProtectedRoute>
          );
        }}
      </Route>
      
      {/* New Investor Routes with Nested Structure */}
      <Route path="/investor">
        {() => {
          // Use dynamic import to avoid having to move the file immediately
          const NewProtectedRoute = require('@/middleware/AuthMiddleware').default;
          const InvestorLayout = require('@/components/layouts/InvestorLayout').default;
          const InvestorDashboard = require('@/pages/investor/InvestorDashboard').default;
          
          return (
            <NewProtectedRoute requiredRoles={["user", "admin", "super_admin"]}>
              <InvestorLayout>
                <InvestorDashboard />
              </InvestorLayout>
            </NewProtectedRoute>
          );
        }}
      </Route>
      
      {/* Investor Projects Page */}
      <Route path="/investor/projects">
        {() => {
          const NewProtectedRoute = require('@/middleware/AuthMiddleware').default;
          const InvestorProjectsPage = require('@/pages/investor/InvestorProjectsPage').default;
          
          return (
            <NewProtectedRoute requiredRoles={["user", "admin", "super_admin"]}>
              <InvestorProjectsPage />
            </NewProtectedRoute>
          );
        }}
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
