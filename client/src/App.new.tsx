import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";

// Layouts
import AdminLayout from "@/components/layouts/AdminLayout-new";
import InvestorLayout from "@/components/layouts/InvestorLayout-new";

// Public Pages
import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import PropertyPage from "@/pages/property-page";
import PropertiesPage from "@/pages/properties-page";
import AuthPage from "@/pages/auth-page";
import TeamPage from "@/pages/company/team-page";
import CulturePage from "@/pages/company/culture-page";
import PressPage from "@/pages/company/press-page";
import ForumPage from "@/pages/forum-page";
import TopicDetailPage from "@/pages/topic-detail-page";
import ExplorePage from "@/pages/explore-page";
import TestLogin from "@/test-login";
import MobileHomePage from "@/pages/mobile-home-page";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/users-page";
import AdminProperties from "@/pages/admin/properties-page";
import AdminKyc from "@/pages/admin/kyc-page";

// Investor Pages
import InvestorDashboard from "@/pages/investor/InvestorDashboard";
import InvestorPortfolio from "@/pages/investor/portfolio-page";
import InvestorProperties from "@/pages/investor/properties-page";
import InvestorWallet from "@/pages/investor/wallet-page";
import InvestorKYC from "@/pages/investor/KYCPage";

// Middleware & Utilities
import AuthMiddleware from "@/middleware/AuthMiddleware";
import { useEffect, useState } from "react";

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
      <Route path="/test-login" component={TestLogin} />
      <Route path="/forum" component={ForumPage} />
      <Route path="/forum/topic/:id" component={TopicDetailPage} />
      <Route path="/company/team" component={TeamPage} />
      <Route path="/company/culture" component={CulturePage} />
      <Route path="/company/press" component={PressPage} />
      <Route path="/explore" component={ExplorePage} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        {() => (
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <Switch>
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/admin/users" component={AdminUsers} />
                <Route path="/admin/properties" component={AdminProperties} />
                <Route path="/admin/kyc" component={AdminKyc} />
                {/* Add more admin routes as needed */}
                <Route component={NotFound} />
              </Switch>
            </AdminLayout>
          </AuthMiddleware>
        )}
      </Route>
      
      {/* Investor Routes */}
      <Route path="/investor">
        {() => (
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <Switch>
                <Route path="/investor" component={InvestorDashboard} />
                <Route path="/investor/portfolio" component={InvestorPortfolio} />
                <Route path="/investor/properties" component={InvestorProperties} />
                <Route path="/investor/wallet" component={InvestorWallet} />
                <Route path="/investor/kyc" component={InvestorKYC} />
                {/* Add more investor routes as needed */}
                <Route component={NotFound} />
              </Switch>
            </InvestorLayout>
          </AuthMiddleware>
        )}
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