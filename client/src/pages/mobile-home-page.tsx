import { useAuth } from "@/hooks/use-auth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Footer from "@/components/layout/Footer";
import MobileFeaturedProperty from "@/components/dashboard/MobileFeaturedProperty";
import MobileActiveProperties from "@/components/dashboard/MobileActiveProperties";
import { Button } from "@/components/ui/button";
import { Search, Map } from "lucide-react";

export default function MobileHomePage() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <DashboardHeader />
      
      <main className="flex-grow py-6 pb-20">
        <div className="max-w-lg mx-auto px-4">
          {/* Header with greeting */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1">
              Home
            </h2>
            <p className="text-gray-500">
              Explore Properties
            </p>
          </div>
          
          {/* Search bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search properties..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>
          
          {/* Featured Property */}
          <div className="mb-8">
            <MobileFeaturedProperty />
          </div>
          
          {/* Map Link */}
          <div className="mb-8">
            <div className="bg-blue-50 p-4 rounded-xl flex items-center">
              <div className="bg-white rounded-full p-2 mr-3">
                <Map className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">View on Map</h4>
                <p className="text-xs text-blue-700">See all properties locations</p>
              </div>
              <Button size="sm" variant="outline" className="bg-white border-blue-200 text-blue-600">
                Open
              </Button>
            </div>
          </div>
          
          {/* Active Investments */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Active Investments</h3>
              <Button variant="link" className="text-sm p-0">
                See all
              </Button>
            </div>
            <MobileActiveProperties />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}