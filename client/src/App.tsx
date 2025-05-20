import { Route, Switch } from "wouter";
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "./components/ui/toaster";
import HomePage from "./pages/home-page";
import AuthPage from "./pages/auth-page";
import AuthTestPage from "./pages/auth-test";
import UnauthorizedPage from "./pages/unauthorized-page";
import { ProtectedRoute, AdminRoute, InvestorRoute } from "./lib/protected-route";
import AdminDashboardPage from "./pages/admin/admin-dashboard";
import InvestorDashboardPage from "./pages/investor/investor-dashboard";
import { AuthProvider } from "./hooks/use-auth";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ireva-ui-theme">
      <AuthProvider>
        <div className="min-h-screen">
          <Switch>
            {/* Public routes */}
            <Route path="/auth" component={AuthPage} />
            <Route path="/auth-test" component={AuthTestPage} />
            <Route path="/unauthorized" component={UnauthorizedPage} />
            
            {/* Protected admin routes */}
            <AdminRoute path="/admin/dashboard" component={AdminDashboardPage} />
            
            {/* Protected investor routes */}
            <ProtectedRoute path="/investor/dashboard" component={InvestorDashboardPage} />
            
            {/* Home route - for testing purposes, redirect to auth page */}
            <Route path="/">
              {() => {
                window.location.href = "/auth";
                return null;
              }}
            </Route>
            
            {/* 404 fallback */}
            <Route>
              <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
                <a href="/" className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                  Go Home
                </a>
              </div>
            </Route>
          </Switch>
        </div>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;