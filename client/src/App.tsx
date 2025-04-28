import React, { useEffect, useState, lazy, Suspense, StrictMode } from "react";
import { Switch, Route, useLocation, Redirect, Router } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
// ThemeProvider is now handled by IntegratedThemeProvider
import { DebugHelper } from "@/components/DebugHelper";
import PWAInstallToast from "@/components/PWAInstallToast";
import AuthMiddleware from "@/middleware/AuthMiddleware";
import AdminLayout from "@/components/layouts/AdminLayout";
import InvestorLayout from "@/components/layouts/InvestorLayout";
import { HelmetProvider } from 'react-helmet-async';
import LegalUpdateModal from "@/components/legal/LegalUpdateModal";
import SimplifiedThemedApp from "./pages/simplified-themed-app";
import StaticHome from "./pages/StaticHome";
import MobileOptimizedHomePage from "./pages/MobileOptimizedHomePage";

// Lazily load all page components
const NotFound = lazy(() => import("@/pages/not-found"));
const HomePage = lazy(() => import("@/pages/home-page"));
const PropertyPage = lazy(() => import("@/pages/property-page"));
const PropertiesPage = lazy(() => import("@/pages/properties-page"));
const PropertyInvestment = lazy(() => import("@/pages/properties/PropertyInvestment"));
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
const MuiHomePage = lazy(() => import("@/pages/mui-home-page"));
const CryptoEducationPage = lazy(() => import("@/pages/crypto-education-page"));
const CryptoWalletPage = lazy(() => import("@/pages/crypto-wallet-page"));
const AdminDashboard = lazy(() => import("@/pages/admin/admin-dashboard"));
const JwtTestPage = lazy(() => import("@/pages/jwt-test-page"));
const TestLogin = lazy(() => import("./test-login"));
const DebugLoginPage = lazy(() => import("@/pages/DebugLoginPage"));
// Add the WalletDemo component
const WalletDemo = lazy(() => import("@/components/wallet/WalletDemo"));
// Admin pages
const ComplianceCenter = lazy(() => import("@/admin/pages/ComplianceCenter"));

// Configure React Query with proper suspense handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
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
  const CryptoIntegrationPage = lazy(() => import('@/pages/admin/crypto-integration-page'));
  const CryptoTransactionsDashboard = lazy(() => import('@/pages/admin/CryptoTransactionsDashboard'));
  const UserEngagementDashboardPage = lazy(() => import('@/pages/metrics/UserEngagementDashboardPage'));
  const InvestorDashboard = lazy(() => import('@/pages/investor/InvestorDashboard'));
  const InvestorProjectsPage = lazy(() => import('@/pages/investor/InvestorProjectsPage'));
  const ProjectsPage = lazy(() => import('@/pages/investor/projects-page'));
  const ProjectDetailPage = lazy(() => import('@/pages/investor/project-detail-page'));
  const PropertyEscrowPage = lazy(() => import('@/pages/investor/PropertyEscrowPage'));
  const ROICalculatorPage = lazy(() => import('@/pages/investor/ROICalculatorPage'));
  const InvestorSavedPropertiesPage = lazy(() => import('@/pages/investor/InvestorSavedPropertiesPage'));
  const InvestorPortfolioPage = lazy(() => import('@/pages/investor/portfolio-page'));
  const InvestorProfilePage = lazy(() => import('@/pages/investor/profile-page'));
  const InvestorPropertiesPage = lazy(() => import('@/pages/investor/properties-page'));
  const InvestorWalletPage = lazy(() => import('@/pages/investor/wallet-page'));
  const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage'));
  const InvestorNotificationsPage = lazy(() => import('@/pages/investor/notifications-page'));
  const SendNotificationPage = lazy(() => import('@/pages/admin/SendNotificationPage'));
  const InvestorDocumentsPage = lazy(() => import('@/pages/investor/InvestorDocumentsPage'));
  const InvestorKYCPage = lazy(() => import('@/pages/investor/KYCPage'));
  const MessagesPage = lazy(() => import('@/pages/investor/MessagesPage'));
  const SupportPage = lazy(() => import('@/pages/investor/SupportPage'));
  const FAQsPage = lazy(() => import('@/pages/investor/FAQsPage'));
  const SettingsPage = lazy(() => import('@/pages/investor/SettingsPage'));
  const UserSettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
  const InvestorROIDashboardPage = lazy(() => import('@/pages/InvestorROIDashboard'));
  const TransactionsPage = lazy(() => import('@/pages/wallet/TransactionsPage'));
  // Issue Tracker Pages
  const IssuesPage = lazy(() => import('@/pages/issues/IssuesPage'));
  const IssueDetailPage = lazy(() => import('@/pages/issues/IssueDetailPage'));
  const NewIssuePage = lazy(() => import('@/pages/issues/NewIssuePage'));
  const OfflineFormDemoPage = lazy(() => import('@/pages/demo/offline-form-demo'));
  
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
      <Route path="/" component={() => {
        const UltraSimpleHome = React.lazy(() => import("./pages/ultra-simple-home"));
        return (
          <React.Suspense fallback={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100vh',
              background: '#f5f5f5'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  display: 'inline-block',
                  width: '40px',
                  height: '40px',
                  margin: '20px auto',
                  border: '4px solid rgba(0,0,0,0.1)',
                  borderRadius: '50%',
                  borderTop: '4px solid #4F46E5',
                  animation: 'spin 1s linear infinite'
                }} />
                <style>
                  {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                </style>
                <p style={{ fontFamily: 'Arial', color: '#333' }}>Loading iREVA...</p>
              </div>
            </div>
          }>
            <UltraSimpleHome />
          </React.Suspense>
        );
      }} />
      <Route path="/original" component={isMobile ? MobileHomePage : HomePage} />
      <Route path="/mui-home" component={() => {
        const StandaloneMuiHome = React.lazy(() => import("@/pages/standalone-mui-home"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <StandaloneMuiHome />
          </React.Suspense>
        );
      }} />
      {/* Direct access to simplified MUI homepage */}
      <Route path="/simple-mui-home" component={() => {
        const SimpleMuiHome = React.lazy(() => import("@/pages/simple-mui-home"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <SimpleMuiHome />
          </React.Suspense>
        );
      }} />
      
      {/* Simple routes for navigation */}
      <Route path="/simple" component={() => {
        const SimpleHomePage = React.lazy(() => import("./pages/simple-home-page"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <SimpleHomePage />
          </React.Suspense>
        );
      }} />
      
      {/* Minimal routes that don't depend on ThemeProvider */}
      <Route path="/minimal" component={() => {
        const MinimalHome = React.lazy(() => import("./pages/minimal-home"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <MinimalHome />
          </React.Suspense>
        );
      }} />
      
      {/* Standalone Material-UI page with its own ThemeProvider */}
      <Route path="/mui-standalone" component={() => {
        const MuiStandalone = React.lazy(() => import("./pages/mui-standalone"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <MuiStandalone />
          </React.Suspense>
        );
      }} />
      
      {/* Simplified Material-UI page with its own ThemeProvider */}
      <Route path="/mui-basic" component={() => {
        const MuiBasic = React.lazy(() => import("./pages/mui-basic"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <MuiBasic />
          </React.Suspense>
        );
      }} />
      
      {/* Pure React component with no external theming */}
      <Route path="/pure-react" component={() => {
        const PureReact = React.lazy(() => import("./pages/pure-react"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <PureReact />
          </React.Suspense>
        );
      }} />
      
      {/* iREVA Standalone Home */}
      <Route path="/home" component={() => {
        const StandaloneHome = React.lazy(() => import("./pages/standalone-home"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <StandaloneHome />
          </React.Suspense>
        );
      }} />
      
      {/* Simple iREVA Home - Complete standalone component */}
      <Route path="/simple-home" component={() => {
        const SimpleIREVAHome = React.lazy(() => import("./pages/simple-ireva-home"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <SimpleIREVAHome />
          </React.Suspense>
        );
      }} />
      
      {/* Minimal iREVA Home - Pure React with inline styles */}
      <Route path="/minimal-home" component={() => {
        const MinimalIREVAHome = React.lazy(() => import("./pages/minimal-ireva-home"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <MinimalIREVAHome />
          </React.Suspense>
        );
      }} />
      
      {/* Theme Test Page - Tests the integrated theme provider */}
      <Route path="/theme-test" component={() => {
        const ThemeTestPage = React.lazy(() => import("./pages/theme-test-page"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <ThemeTestPage />
          </React.Suspense>
        );
      }} />
      
      {/* Standalone iREVA Home - With self-contained MUI theme */}
      <Route path="/standalone-home" component={() => {
        const StandaloneIREVAHome = React.lazy(() => import("./pages/standalone-ireva-home"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <StandaloneIREVAHome />
          </React.Suspense>
        );
      }} />
      
      {/* Pure HTML Home - No dependencies at all */}
      <Route path="/pure-html-home" component={() => {
        const PureHTMLHome = React.lazy(() => import("./pages/pure-html-home"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <PureHTMLHome />
          </React.Suspense>
        );
      }} />
      
      {/* Ultra Simple iREVA Home - Absolute minimal implementation */}
      <Route path="/ultra-simple" component={() => {
        const UltraSimpleHome = React.lazy(() => import("./pages/ultra-simple-home"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <UltraSimpleHome />
          </React.Suspense>
        );
      }} />
      
      {/* Simplified themed app with built-in Material UI ThemeProvider */}
      <Route path="/simplified-themed" component={SimplifiedThemedApp} />
      
      {/* Static Home Page with direct CSS styling - no Material UI */}
      <Route path="/static-home" component={StaticHome} />
      
      {/* Mobile Optimized Homepage with inline styles - no Material UI */}
      <Route path="/mobile-optimized" component={MobileOptimizedHomePage} />
      
      {/* New Home Page with Material UI and React Helmet */}
      <Route path="/new-home" component={() => {
        const NewHomePage = React.lazy(() => import("@/pages/HomePage"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <NewHomePage />
          </React.Suspense>
        );
      }} />
      
      {/* Material-UI v7 with minimal theme */}
      <Route path="/mui-v7-basic" component={() => {
        const MuiV7Basic = React.lazy(() => import("./pages/mui-v7-basic"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <MuiV7Basic />
          </React.Suspense>
        );
      }} />
      
      {/* Material-UI v5 with minimal theme */}
      <Route path="/mui-v5-basic" component={() => {
        const MuiV5Basic = React.lazy(() => import("./pages/mui-v5-basic"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <MuiV5Basic />
          </React.Suspense>
        );
      }} />
      
      {/* Basic standalone test without dependencies */}
      <Route path="/basic-test" component={() => {
        const BasicStandaloneTest = React.lazy(() => import("./pages/basic-standalone-test"));
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <BasicStandaloneTest />
          </React.Suspense>
        );
      }} />
      <Route path="/simple/transactions" component={() => {
        return (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <TransactionsPage />
            </Suspense>
          </AuthMiddleware>
        );
      }} />
      <Route path="/simple/settings" component={() => {
        return (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <SettingsPage />
            </Suspense>
          </AuthMiddleware>
        );
      }} />
      <Route path="/simple/privacy-policy" component={React.lazy(() => import("@/pages/legal/privacy-policy"))} />
      <Route path="/simple/terms" component={React.lazy(() => import("@/pages/legal/terms-of-service"))} />
      <Route path="/property/:id" component={PropertyPage} />
      <Route path="/property/:id/invest" component={PropertyInvestment} />
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
      <Route path="/wallet-demo" component={WalletDemo} />
      <Route path="/demo/offline-form" component={OfflineFormDemoPage} />
      
      {/* Legal Pages */}
      <Route path="/legal" component={React.lazy(() => import("@/pages/legal/legal-center"))} />
      <Route path="/legal/privacy-policy" component={React.lazy(() => import("@/pages/legal/privacy-policy"))} />
      <Route path="/legal/terms-of-service" component={React.lazy(() => import("@/pages/legal/terms-of-service"))} />
      <Route path="/legal/cookies-policy" component={React.lazy(() => import("@/pages/legal/cookies-policy"))} />
      <Route path="/legal/investor-risk-disclosure" component={React.lazy(() => import("@/pages/legal/investor-risk-disclosure"))} />
      <Route path="/legal/aml-statement" component={React.lazy(() => import("@/pages/legal/aml-statement"))} />
      <Route path="/legal/gdpr-commitment" component={React.lazy(() => import("@/pages/legal/gdpr-commitment"))} />
      <Route path="/legal/crypto-risk-disclosure" component={React.lazy(() => import("@/pages/legal/investor-risk-disclosure"))} />
      
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
      <Route path="/wallet/transactions">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <TransactionsPage />
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      <Route path="/wallet/crypto">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <CryptoWalletPage />
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      <Route path="/crypto-wallet">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <CryptoWalletPage />
            </Suspense>
          </AuthMiddleware>
        )}
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
      
      {/* Admin Compliance Center Route */}
      <Route path="/admin/compliance">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <ComplianceCenter />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Crypto Integration Route */}
      <Route path="/admin/crypto-integration">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <CryptoIntegrationPage />
              </AdminLayout>
            </Suspense>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Admin Crypto Transactions Dashboard */}
      <Route path="/admin/crypto-transactions">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <CryptoTransactionsDashboard />
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
      
      {/* Admin Notifications Management Route */}
      <Route path="/admin/notifications">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <SendNotificationPage />
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
      
      {/* Admin Crypto Integration Route */}
      <Route path="/admin/crypto-integration">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminLayout>
                <CryptoIntegrationPage />
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
      
      {/* Property Escrow Page */}
      <Route path="/investor/escrow">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <InvestorLayout>
                <PropertyEscrowPage />
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
      
      {/* Notifications Page with Push Notification Settings */}
      <Route path="/notifications">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <Suspense fallback={<div>Loading...</div>}>
              <NotificationsPage />
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
                <InvestorNotificationsPage />
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
        <Router base="">
          {/* QueryClient and Auth are now handled in main.tsx */}
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-muted-foreground">Loading application...</p>
              </div>
            </div>
          }>
            <AppContent isDevelopment={isDevelopment} />
          </Suspense>
        </Router>
      </HelmetProvider>
    </StrictMode>
  );
}

// Separate component to access auth context
function AppContent({ isDevelopment }: { isDevelopment: boolean }) {
  const { user } = useAuth();
  
  return (
    <>
      <AppRouter />
      <Toaster />
      <PWAInstallToast />
      {/* Only show debug helper in development mode */}
      {isDevelopment && <DebugHelper />}
      {/* Show legal compliance modal when user is logged in */}
      {user && <LegalUpdateModal currentUser={user} />}
    </>
  );
}

export default App;
