import { ReactNode } from "react";
import { Switch, Route } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import InvestorLayoutNew from "@/components/layouts/InvestorLayout-new";
import NotFound from "@/pages/not-found";

// Shared Pages (these can be accessed by both investors and admins)
import ProfilePage from "@/pages/profile-page";
import VerificationPage from "@/pages/verification-page";

interface SharedLayoutProps {
  children?: ReactNode;
}

const SharedLayout = ({ children }: SharedLayoutProps) => {
  const { user } = useAuth();
  
  if (!user) {
    return null; // This should never happen because of the AuthMiddleware
  }

  // We use InvestorLayout for shared pages, as it's a more generic layout
  return (
    <InvestorLayoutNew>
      {children || (
        <Switch>
          <Route path="/profile" component={ProfilePage} />
          <Route path="/verification" component={VerificationPage} />
          <Route component={NotFound} />
        </Switch>
      )}
    </InvestorLayoutNew>
  );
};

export default SharedLayout;