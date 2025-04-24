import { Switch, Route, useLocation, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { useEffect, useState, lazy, Suspense, StrictMode } from "react";
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
const CryptoEducationPage = lazy(() => import("@/pages/crypto-education-page"));
const AdminDashboard = lazy(() => import("@/pages/admin/admin-dashboard"));
const JwtTestPage = lazy(() => import("@/pages/jwt-test-page"));
const TestLogin = lazy(() => import("./test-login"));
const DebugLoginPage = lazy(() => import("@/pages/DebugLoginPage"));

// Configure React Query with proper suspense handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  const [isMobile, setIsMobile] = useState(false);
  
  // Lazy load the page components to avoid potential issues with circular dependencies
  const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
  const AdminActivityLogs = lazy(() => import('@/pages/admin/AdminActivityLogs'));
  const KYCManagementPage = lazy(() => import('@/pages/admin/kyc-management'));
  const AdminProjectsPage = lazy(() => import('@/pages/admin/AdminProjectsPage'));
  const AdminUsersPage = lazy(() => import('@/pages/admin/users-page'));
  const AdminPropertiesPage = lazy(() => import('@/pages/admin/properties-page'));
  const AdminInvestmentsPage = lazy(() => import('@/pages/admin/investments-page'));
  const AdminTransactionsPage = lazy(() => import('@/pages/admin/transactions-page'));
  const AdminPaymentsPage = lazy(() => import('@/pages/admin/payments-page'));
  const AdminDocumentsPage = lazy(() => import('@/pages/admin/documents-page'));
  const AdminMessagesPage = lazy(() => import('@/pages/admin/messages-page'));
  const AdminSystemPage = lazy(() => import('@/pages/admin/system-page'));
  const AdminSettingsPage = lazy(() => import('@/pages/admin/settings-page'));
  const AdminResourcesPage = lazy(() => import('@/pages/admin/resources-page'));
  const AdminWalletManagementPage = lazy(() => import('@/pages/admin/wallet-management'));
  const AdminROIDashboardPage = lazy(() => import('@/pages/AdminROIDashboard'));
  const UserEngagementDashboardPage = lazy(() => import('@/pages/metrics/UserEngagementDashboardPage'));
  const InvestorDashboard = lazy(() => import('@/pages/investor/InvestorDashboard'));
  const InvestorProjectsPage = lazy(() => import('@/pages/investor/InvestorProjectsPage'));
  const ProjectsPage = lazy(() => import('@/pages/investor/projects-page'));
  const ProjectDetailPage = lazy(() => import('@/pages/investor/project-detail-page'));
  const ROICalculatorPage = lazy(() => import('@/pages/investor/ROICalculatorPage'));
  const InvestorSavedPropertiesPage = lazy(() => import('@/pages/investor/InvestorSavedPropertiesPage'));
  const InvestorPortfolioPage = lazy(() => import('@/pages/investor/portfolio-page'));
  const InvestorProfilePage = lazy(() => import('@/pages/investor/profile-page'));
  const InvestorPropertiesPage = lazy(() => import('@/pages/investor/properties-page'));
  const InvestorWalletPage = lazy(() => import('@/pages/investor/wallet-page'));
  const NotificationsPage = lazy(() => import('@/pages/investor/notifications-page'));
  const InvestorDocumentsPage = lazy(() => import('@/pages/investor/InvestorDocumentsPage'));
  const InvestorKYCPage = lazy(() => import('@/pages/investor/KYCPage'));
  const MessagesPage = lazy(() => import('@/pages/investor/MessagesPage'));
  const SupportPage = lazy(() => import('@/pages/investor/SupportPage'));
  const FAQsPage = lazy(() => import('@/pages/investor/FAQsPage'));
  const SettingsPage = lazy(() => import('@/pages/investor/SettingsPage'));
  const UserSettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
  const InvestorROIDashboardPage = lazy(() => import('@/pages/InvestorROIDashboard'));
  // Issue Tracker Pages
  const IssuesPage = lazy(() => import('@/pages/issues/IssuesPage'));
  const IssueDetailPage = lazy(() => import('@/pages/issues/IssueDetailPage'));
  const NewIssuePage = lazy(() => import('@/pages/issues/NewIssuePage'));
  
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
      <Route path="/crypto-education" component={CryptoEducationPage} />
      
      {/* Legacy Protected Routes - will be deprecated gradually */}
      <Route path="/dashboard">
        {() => <DashboardPage />}
      </Route>
      {/* Admin redirect to ROI Dashboard */}
      <Route path="/admin">
        {() => <Redirect to="/admin/roi-dashboard" />}
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
              <AdminLayout>
                <AdminProjectsPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Dashboard Route */}
      <Route path="/admin/dashboard">
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
      
      {/* Admin Users Management Route */}
      <Route path="/admin/users">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminUsersPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Properties Management Route */}
      <Route path="/admin/properties">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminPropertiesPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Investments Management Route */}
      <Route path="/admin/investments">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminInvestmentsPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Transactions Management Route */}
      <Route path="/admin/transactions">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminTransactionsPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Payments Management Route */}
      <Route path="/admin/payments">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminPaymentsPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Documents Management Route */}
      <Route path="/admin/documents">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminDocumentsPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Messages Management Route */}
      <Route path="/admin/messages">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminMessagesPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin System Management Route */}
      <Route path="/admin/system">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminSystemPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Settings Management Route */}
      <Route path="/admin/settings">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminSettingsPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Educational Resources Management Route */}
      <Route path="/admin/resources">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminResourcesPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Wallet Management Route */}
      <Route path="/admin/wallet-management">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminWalletManagementPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin ROI Dashboard Route */}
      <Route path="/admin/roi-dashboard">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminROIDashboardPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Activity Logs Route */}
      <Route path="/admin/activity-logs">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <AdminActivityLogs />
              </AdminLayout>
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
              <InvestorLayout>
                <ProjectsPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Project Detail Page */}
      <Route path="/investor/projects/:id">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <ProjectDetailPage />
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor ROI Calculator Page */}
      <Route path="/investor/roi-calculator">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <ROICalculatorPage />
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor ROI Dashboard Page */}
      <Route path="/investor/roi-dashboard">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <InvestorROIDashboardPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Issue Tracker Routes */}
      <Route path="/issues">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <IssuesPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      <Route path="/issues/new">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <NewIssuePage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      <Route path="/issues/:id">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <IssueDetailPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* User Engagement Metrics Dashboard */}
      <Route path="/admin/engagement-metrics">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <UserEngagementDashboardPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* User Settings & Preferences Page */}
      <Route path="/account/settings">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <UserSettingsPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Saved Properties Page */}
      <Route path="/investor/saved">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <InvestorSavedPropertiesPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Dashboard Page */}
      <Route path="/investor/dashboard">
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
      
      {/* Investor Portfolio Page */}
      <Route path="/investor/portfolio">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <InvestorPortfolioPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Properties Page */}
      <Route path="/investor/properties">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <InvestorPropertiesPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Wallet Page */}
      <Route path="/investor/wallet">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <InvestorWalletPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Notifications Page */}
      <Route path="/investor/notifications">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <NotificationsPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Profile Page */}
      <Route path="/investor/profile">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <InvestorProfilePage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Documents Page */}
      <Route path="/investor/documents">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <InvestorDocumentsPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor KYC Page */}
      <Route path="/investor/kyc">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <InvestorKYCPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Messages Page */}
      <Route path="/investor/messages">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <MessagesPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Support Page */}
      <Route path="/investor/support">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <SupportPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor FAQs Page */}
      <Route path="/investor/faqs">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <FAQsPage />
              </InvestorLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Settings Page */}
      <Route path="/investor/settings">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <SettingsPage />
              </InvestorLayout>
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
    <StrictMode>
      <HelmetProvider>
        <ThemeProvider defaultTheme="system" storageKey="ireva-theme">
          <QueryClientProvider client={queryClient}>
            <Suspense fallback={
              <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
                  <p className="text-muted-foreground">Loading application...</p>
                </div>
              </div>
            }>
              <AuthProvider>
                <Router />
                <Toaster />
                {/* Only show debug helper in development mode */}
                {isDevelopment && <DebugHelper />}
              </AuthProvider>
            </Suspense>
          </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    </StrictMode>
  );
}

export default App;
