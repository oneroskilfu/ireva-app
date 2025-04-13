import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InvestmentStats from "@/components/dashboard/InvestmentStats";
import InvestmentPortfolio from "@/components/dashboard/InvestmentPortfolio";
import RecommendedProperties from "@/components/dashboard/RecommendedProperties";
import ActiveProjects from "@/components/dashboard/ActiveProjects";
import CompletedProjects from "@/components/dashboard/CompletedProjects";
import EarningsBreakdown from "@/components/dashboard/EarningsBreakdown";
import AdvancedAnalytics from "@/components/dashboard/AdvancedAnalytics";
import { 
  Download, 
  Plus, 
  ChevronDown, 
  LayoutDashboard, 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  LineChart, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch investments for analytics
  const investmentsQuery = useQuery({
    queryKey: ['/api/investments'],
    enabled: !!user
  });

  // Extract payment status from URL if coming back from Paystack redirect
  const searchParams = new URLSearchParams(window.location.search);
  const paymentStatus = searchParams.get('status');
  const showPaymentSuccess = paymentStatus === 'success';
  const showPaymentError = paymentStatus === 'failed' || paymentStatus === 'error';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showPaymentSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Payment Successful</AlertTitle>
              <AlertDescription className="text-green-700">
                Your investment has been processed successfully. You can view the details in your portfolio.
              </AlertDescription>
            </Alert>
          )}

          {showPaymentError && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Payment Failed</AlertTitle>
              <AlertDescription className="text-red-700">
                There was an issue processing your payment. Please try again or contact support.
              </AlertDescription>
            </Alert>
          )}

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
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full sm:w-auto grid-cols-4 sm:inline-flex">
              <TabsTrigger value="overview" className="flex items-center">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="flex items-center">
                <PieChart className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Portfolio</span>
              </TabsTrigger>
              <TabsTrigger value="earnings" className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Earnings</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center">
                <LineChart className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab Content */}
            <TabsContent value="overview">
              <InvestmentStats />
              
              <div className="mb-6 mt-6">
                <h4 className="font-semibold text-lg mb-4">Investment Portfolio</h4>
                <InvestmentPortfolio />
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-4">Recommended Properties</h4>
                <RecommendedProperties />
              </div>
            </TabsContent>
            
            {/* Portfolio Tab Content */}
            <TabsContent value="portfolio">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg">Active Projects</h4>
                  <Button variant="ghost" size="sm" className="text-xs flex items-center">
                    View All <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <ActiveProjects />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg">Completed Projects</h4>
                  <Button variant="ghost" size="sm" className="text-xs flex items-center">
                    View All <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <CompletedProjects />
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-4">Recommended For You</h4>
                <RecommendedProperties />
              </div>
            </TabsContent>
            
            {/* Earnings Tab Content */}
            <TabsContent value="earnings">
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-4">Earnings Breakdown</h4>
                <EarningsBreakdown />
              </div>
              
              <div className="mb-6 mt-8">
                <h4 className="font-semibold text-lg mb-4">Investment Performance</h4>
                <InvestmentPortfolio />
              </div>
            </TabsContent>

            {/* Analytics Tab Content */}
            <TabsContent value="analytics">
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-4">Advanced Analytics Dashboard</h4>
                {investmentsQuery.isLoading ? (
                  <div className="flex justify-center items-center p-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : investmentsQuery.isError ? (
                  <Alert className="mb-6 bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Error Loading Investments</AlertTitle>
                    <AlertDescription className="text-red-700">
                      Unable to load your investment data. Please try again later.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <AdvancedAnalytics investments={investmentsQuery.data || []} />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
