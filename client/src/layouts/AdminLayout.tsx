import { ReactNode } from "react";
import { Switch, Route } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayoutNew from "@/components/layouts/AdminLayout-new";
import NotFound from "@/pages/not-found";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/users-page";
import AdminProperties from "@/pages/admin/properties-page";
import AdminKyc from "@/pages/admin/kyc-page";

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuth();
  
  if (!user) {
    return null; // This should never happen because of the AuthMiddleware
  }

  return (
    <AdminLayoutNew>
      {children || (
        <Switch>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/properties" component={AdminProperties} />
          <Route path="/admin/kyc" component={AdminKyc} />
          <Route component={NotFound} />
        </Switch>
      )}
    </AdminLayoutNew>
  );
};

export default AdminLayout;