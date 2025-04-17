import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { useEffect, useState, lazy, Suspense } from "react";
import { DebugHelper } from "@/components/DebugHelper";
import AuthMiddleware from "@/middleware/AuthMiddleware";
import AdminLayout from "@/components/layouts/AdminLayout";
import InvestorLayout from "@/components/layouts/InvestorLayout";
import { HelmetProvider } from 'react-helmet-async';

// Lazily load all page components
const NotFound = lazy(() => import("@/pages/not-found"));
const HomePage = lazy(() => import("@/pages/home-page"));
const PropertyPage = lazy(() => import("@/pages/property-page"));
const PropertiesPage = lazy(() => import("@/pages/properties-page"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const AnalyticsPage = lazy(() => import("@/pages/analytics-page"));
const CommunityPage = lazy(() => import("@/pages/community-page"));
const ForumPage = lazy(() => import("@/pages/forum-page"));
const TopicDetailPage = lazy(() => import("@/pages/topic-detail-page"));
const VerificationPage = lazy(() => import("@/pages/verification-page"));
const TeamPage = lazy(() => import("@/pages/company/team-page"));
const CulturePage = lazy(() => import("@/pages/company/culture-page"));
const PressPage = lazy(() => import("@/pages/company/press-page"));
const PortfolioPage = lazy(() => import("@/pages/portfolio-page"));
const WalletPage = lazy(() => import("@/pages/wallet-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const ExplorePage = lazy(() => import("@/pages/explore-page"));
const MobileHomePage = lazy(() => import("@/pages/mobile-home-page"));
const AdminDashboard = lazy(() => import("@/pages/admin/admin-dashboard"));
const JwtTestPage = lazy(() => import("@/pages/jwt-test-page"));
const TestLogin = lazy(() => import("./test-login"));
const DebugLoginPage = lazy(() => import("@/pages/DebugLoginPage"));

const queryClient = new QueryClient();

function Router() {
  const [isMobile, setIsMobile] = useState(false);
  
  // Lazy load the page components to avoid potential issues with circular dependencies
  const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
  const KYCManagementPage = lazy(() => import('@/pages/admin/kyc-management'));
  const AdminProjectsPage = lazy(() => import('@/pages/admin/AdminProjectsPage'));
  const InvestorDashboard = lazy(() => import('@/pages/investor/InvestorDashboard'));
  const InvestorProjectsPage = lazy(() => import('@/pages/investor/InvestorProjectsPage'));
  
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
      <Route path="/dashboard">
        {() => <DashboardPage />}
      </Route>
      <Route path="/admin">
        {() => (
          <Suspense fallback={<div>Loading...</div>}>
            <AdminDashboard />
          </Suspense>
        )}
      </Route>
      <Route path="/analytics">
        {() => <AnalyticsPage />}
      </Route>
      <Route path="/community">
        {() => <CommunityPage />}
      </Route>
      <Route path="/portfolio">
        {() => <PortfolioPage />}
      </Route>
      <Route path="/wallet">
        {() => <WalletPage />}
      </Route>
      <Route path="/profile">
        {() => <ProfilePage />}
      </Route>
      <Route path="/verification">
        {() => <VerificationPage />}
      </Route>
      
      {/* New Admin Routes with Nested Structure */}
      <Route path="/admin-new">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin KYC Management Route */}
      <Route path="/admin/kyc">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <KYCManagementPage />
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>

      {/* Admin Projects Management Route */}
      <Route path="/admin/projects">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminProjectsPage />
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* New Investor Routes with Nested Structure */}
      <Route path="/investor">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <InvestorDashboard />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Projects Page */}
      <Route path="/investor/projects">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorProjectsPage />
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* 404 Not Found */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Determine if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
          {/* Only show debug helper in development mode */}
          {isDevelopment && <DebugHelper />}
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
