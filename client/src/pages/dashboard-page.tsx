import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InvestmentStats from "@/components/dashboard/InvestmentStats";
import InvestmentPortfolio from "@/components/dashboard/InvestmentPortfolio";
import RecommendedProperties from "@/components/dashboard/RecommendedProperties";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Welcome back,</h4>
              <h3 className="text-xl font-bold">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username}
              </h3>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
            </div>
          </div>
          
          <InvestmentStats />
          
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-4">Investment Portfolio</h4>
            <InvestmentPortfolio />
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Recommended Properties</h4>
            <RecommendedProperties />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
