import { useState, useEffect, Suspense } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import PropertyPage from "@/pages/property-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import DashboardWithWelcome from "@/pages/dashboard-with-welcome";
import CommunityPage from "@/pages/community-page";
import MarketTrendsPage from "@/pages/market-trends-page";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminSettingsPage from "@/pages/admin-settings-page";
import SimpleAdminPage from "@/pages/simple-admin-page";
import AccountSecurityPage from "@/pages/account-security";
import AnalyticsDashboard from "@/pages/analytics-dashboard";
import SupportPage from "@/pages/support-page";
import HowItWorksPage from "@/pages/how-it-works";
import JwtAuthTest from "@/pages/jwt-auth-test";
import UnauthorizedPage from "@/pages/unauthorized-page";
import LoginPage from "./pages/login-page";
import Projects from "./components/Projects";
import Users from "./components/Users";
import Properties from "./components/Properties";
import RoiTracker from "./components/RoiTracker";
import Messages from "./components/Messages";
import Investments from "./components/Investments";
import Dashboard from "./components/Dashboard";
import MuiDashboardPage from "./pages/mui-dashboard-page";
import SimpleDashboardPage from "./pages/simple-dashboard-page";
import SimpleInvestmentsPage from "./pages/simple-investments-page";
import SimpleRoiPage from "./pages/simple-roi-page";
import SimpleMessagesPage from "./pages/simple-messages-page";
import MessagesPage from "./pages/messages-page";
import { ProtectedRoute } from "./lib/protected-route";
import { PageTransitionProvider } from "./contexts/page-transition-context";
import { PageLoading } from "@/components/ui/page-loading";
import { OnboardingProvider } from "./contexts/onboarding-context";
import OnboardingWrapper from "./components/onboarding/OnboardingWrapper";
// Import auth context
import React from "react";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { RoleProtectedRoute } from "./lib/role-protected-route";

function Router() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      {isAuthenticated && (
        <div className="fixed top-0 right-0 p-4 z-50">
          <button
            onClick={logout}
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
        <Route path="/login" component={LoginPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/welcome-dashboard" component={DashboardWithWelcome} />
        <ProtectedRoute path="/mui-dashboard" component={MuiDashboardPage} />
        <ProtectedRoute path="/simple-dashboard" component={SimpleDashboardPage} />
        <ProtectedRoute path="/simple-investments" component={SimpleInvestmentsPage} />
        <ProtectedRoute path="/simple-roi" component={SimpleRoiPage} />
        <ProtectedRoute path="/simple-messages" component={SimpleMessagesPage} />
        <ProtectedRoute path="/api-messages" component={MessagesPage} />
        <ProtectedRoute path="/community" component={CommunityPage} />
        <Route path="/market-trends" component={MarketTrendsPage} />
        
        {/* Admin-only routes with role-based protection */}
        <RoleProtectedRoute 
          path="/admin" 
          component={AdminDashboard}
          allowedRoles={['admin']} 
        />
        <RoleProtectedRoute 
          path="/admin/settings" 
          component={AdminSettingsPage}
          allowedRoles={['admin']} 
        />
        <Route path="/admin/simple" component={SimpleAdminPage} />
        <ProtectedRoute path="/account/security" component={AccountSecurityPage} />
        <ProtectedRoute path="/analytics" component={AnalyticsDashboard} />
        
        {/* Routes that require admin role */}
        <RoleProtectedRoute 
          path="/projects" 
          component={Projects}
          allowedRoles={['admin']} 
        />
        <RoleProtectedRoute 
          path="/users" 
          component={Users}
          allowedRoles={['admin']} 
        />
        
        {/* Standard protected routes for investors */}
        <ProtectedRoute path="/roi" component={RoiTracker} />
        <ProtectedRoute path="/properties" component={Properties} />
        <ProtectedRoute path="/messages" component={Messages} />
        <ProtectedRoute path="/investments" component={Investments} />
        <Route path="/support" component={SupportPage} />
        <Route path="/how-it-works" component={HowItWorksPage} />
        <Route path="/jwt-auth-test" component={JwtAuthTest} />
        <Route path="/unauthorized" component={UnauthorizedPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <PageTransitionProvider>
        <OnboardingProvider>
          <OnboardingWrapper>
            <PageLoading />
            <Router />
            <Toaster />
          </OnboardingWrapper>
        </OnboardingProvider>
      </PageTransitionProvider>
    </AuthProvider>
  );
}

export default App;
