import React, { useEffect, useState } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { Toaster } from '@/components/ui/toaster';

// Layouts
import LandingLayout from '@/components/layouts/LandingLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import InvestorLayout from '@/components/layouts/InvestorLayout';
import AdminLayout from '@/components/layouts/AdminLayout';

// Auth Middleware
import AuthMiddleware from '@/middleware/AuthMiddleware';

// Public Pages
import HomePage from '@/pages/landing/HomePage';
import PropertiesPage from '@/pages/landing/PropertiesPage';
import PropertyDetailsPage from '@/pages/landing/PropertyDetailsPage';
import AboutPage from '@/pages/landing/AboutPage';
import HowItWorksPage from '@/pages/landing/HowItWorksPage';
import ContactPage from '@/pages/landing/ContactPage';
import FaqPage from '@/pages/landing/FaqPage';
import NotFoundPage from '@/pages/landing/NotFoundPage';
import AuthPage from '@/pages/auth/AuthPage';

// Investor Pages
import InvestorDashboardPage from '@/pages/investor/DashboardPage';
import InvestorPortfolioPage from '@/pages/investor/PortfolioPage';
import InvestorPropertiesPage from '@/pages/investor/PropertiesPage';
import InvestorPropertyDetailsPage from '@/pages/investor/PropertyDetailsPage';
import InvestorWalletPage from '@/pages/investor/WalletPage';
import InvestorSavedPropertiesPage from '@/pages/investor/SavedPropertiesPage';
import InvestorRoiCalculatorPage from '@/pages/investor/RoiCalculatorPage';
import InvestorDocumentsPage from '@/pages/investor/DocumentsPage';
import InvestorKycPage from '@/pages/investor/KycPage';
import InvestorMessagesPage from '@/pages/investor/MessagesPage';
import InvestorSupportPage from '@/pages/investor/SupportPage';
import InvestorFaqPage from '@/pages/investor/FaqPage';
import InvestorSettingsPage from '@/pages/investor/SettingsPage';
import InvestorProfilePage from '@/pages/investor/ProfilePage';

// Admin Pages
import AdminDashboardPage from '@/pages/admin/DashboardPage';
import AdminUsersPage from '@/pages/admin/UsersPage';
import AdminPropertiesPage from '@/pages/admin/PropertiesPage';
import AdminKycPage from '@/pages/admin/KycPage';
import AdminInvestmentsPage from '@/pages/admin/InvestmentsPage';
import AdminTransactionsPage from '@/pages/admin/TransactionsPage';
import AdminPaymentsPage from '@/pages/admin/PaymentsPage';
import AdminDocumentsPage from '@/pages/admin/DocumentsPage';
import AdminMessagesPage from '@/pages/admin/MessagesPage';
import AdminResourcesPage from '@/pages/admin/ResourcesPage';
import AdminSystemPage from '@/pages/admin/SystemPage';
import AdminSettingsPage from '@/pages/admin/SettingsPage';
import AdminProfilePage from '@/pages/admin/ProfilePage';
import AdminHelpPage from '@/pages/admin/HelpPage';

const App: React.FC = () => {
  return (
    <>
      <Switch>
        {/* Public Routes with Landing Layout */}
        <Route path="/">
          <LandingLayout>
            <HomePage />
          </LandingLayout>
        </Route>
        
        <Route path="/properties">
          <LandingLayout>
            <PropertiesPage />
          </LandingLayout>
        </Route>
        
        <Route path="/properties/:id">
          {(params) => (
            <LandingLayout>
              <PropertyDetailsPage id={params.id} />
            </LandingLayout>
          )}
        </Route>
        
        <Route path="/about">
          <LandingLayout>
            <AboutPage />
          </LandingLayout>
        </Route>
        
        <Route path="/how-it-works">
          <LandingLayout>
            <HowItWorksPage />
          </LandingLayout>
        </Route>
        
        <Route path="/contact">
          <LandingLayout>
            <ContactPage />
          </LandingLayout>
        </Route>
        
        <Route path="/faq">
          <LandingLayout>
            <FaqPage />
          </LandingLayout>
        </Route>
        
        {/* Authentication Route */}
        <Route path="/auth">
          <AuthLayout>
            <AuthPage />
          </AuthLayout>
        </Route>
        
        {/* Investor Routes */}
        <Route path="/investor/dashboard">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorDashboardPage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/investor/portfolio">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorPortfolioPage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/investor/properties">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorPropertiesPage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/investor/properties/:id">
          {(params) => (
            <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
              <InvestorLayout>
                <InvestorPropertyDetailsPage id={params.id} />
              </InvestorLayout>
            </AuthMiddleware>
          )}
        </Route>
        
        <Route path="/investor/wallet">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorWalletPage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/investor/saved">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorSavedPropertiesPage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/investor/roi-calculator">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorRoiCalculatorPage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/investor/documents">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorDocumentsPage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/investor/kyc">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorKycPage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/investor/messages">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorMessagesPage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/investor/support">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorSupportPage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/investor/faqs">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorFaqPage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/investor/settings">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorSettingsPage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/investor/profile">
          <AuthMiddleware requiredRoles={["user", "admin", "super_admin"]}>
            <InvestorLayout>
              <InvestorProfilePage />
            </InvestorLayout>
          </AuthMiddleware>
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/users">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminUsersPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/properties">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminPropertiesPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/kyc">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminKycPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/investments">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminInvestmentsPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/transactions">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminTransactionsPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/payments">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminPaymentsPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/documents">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminDocumentsPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/messages">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminMessagesPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/resources">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminResourcesPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/system">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminSystemPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/settings">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminSettingsPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/profile">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminProfilePage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        <Route path="/admin/help">
          <AuthMiddleware requiredRoles={["admin", "super_admin"]}>
            <AdminLayout>
              <AdminHelpPage />
            </AdminLayout>
          </AuthMiddleware>
        </Route>
        
        {/* 404 Not Found */}
        <Route>
          <LandingLayout>
            <NotFoundPage />
          </LandingLayout>
        </Route>
      </Switch>
      <Toaster />
    </>
  );
};

export default App;