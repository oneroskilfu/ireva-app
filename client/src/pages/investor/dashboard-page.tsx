import { useAuth } from "@/hooks/use-auth";
import Footer from "@/components/layout/Footer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import InvestmentBreakdown from "@/components/dashboard/InvestmentBreakdown";
import InvestmentHighlights from "@/components/dashboard/InvestmentHighlights";
import LocationInsights from "@/components/dashboard/LocationInsights";
import RecommendedProperties from "@/components/dashboard/RecommendedProperties";

export default function DashboardPage() {
  const { user } = useAuth();
  
  if (!user) {
    return null; // Protected route should handle this
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <DashboardHeader />
      
      <main className="flex-grow py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Investment Stats */}
          <DashboardStats />
          
          {/* Main dashboard grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - wider */}
            <div className="lg:col-span-2 space-y-6">
              {/* Performance Chart */}
              <PerformanceChart />
              
              {/* Investment by Property Type */}
              <InvestmentBreakdown />
              
              {/* Recommended Properties */}
              <div className="bg-white p-5 rounded-xl shadow-sm">
                <h4 className="text-lg font-semibold mb-4">Recommended Properties</h4>
                <RecommendedProperties />
              </div>
            </div>
            
            {/* Right column - narrower */}
            <div className="space-y-6">
              {/* Top Performing Investments */}
              <InvestmentHighlights />
              
              {/* Location Insights */}
              <LocationInsights />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
