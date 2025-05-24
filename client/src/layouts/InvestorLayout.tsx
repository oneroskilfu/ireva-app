import { ReactNode } from "react";
import { Switch, Route } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import InvestorLayoutNew from "@/components/layouts/InvestorLayout-new";
import NotFound from "@/pages/not-found";

// Investor Pages
import InvestorDashboard from "@/pages/investor/InvestorDashboard";
import InvestorPortfolio from "@/pages/investor/portfolio-page";
import InvestorProperties from "@/pages/investor/properties-page";
import InvestorWallet from "@/pages/investor/wallet-page";

interface InvestorLayoutProps {
  children?: ReactNode;
}

const InvestorLayout = ({ children }: InvestorLayoutProps) => {
  const { user } = useAuth();
  
  if (!user) {
    return null; // This should never happen because of the AuthMiddleware
  }

  return (
    <InvestorLayoutNew>
      {children || (
        <Switch>
          <Route path="/investor" component={InvestorDashboard} />
          <Route path="/investor/portfolio" component={InvestorPortfolio} />
          <Route path="/investor/properties" component={InvestorProperties} />
          <Route path="/investor/wallet" component={InvestorWallet} />
          <Route component={NotFound} />
        </Switch>
      )}
    </InvestorLayoutNew>
  );
};

export default InvestorLayout;