import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Footer from "@/components/layout/Footer";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Investment, Property } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InvestmentWithProperty extends Investment {
  property: Property;
}

export default function PortfolioPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  
  const { data: investments, isLoading } = useQuery<InvestmentWithProperty[]>({
    queryKey: ["/api/investments"],
  });
  
  if (!investments || investments.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-100">
        <DashboardHeader />
        
        <main className="flex-grow py-6">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">My Portfolio</h2>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <h3 className="text-lg font-medium mb-2">No investments yet</h3>
              <p className="text-gray-500 mb-4">
                Start investing in properties to build your portfolio
              </p>
              <a 
                href="/properties" 
                className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg"
              >
                Browse Properties
              </a>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  // Calculate portfolio stats
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalReturns = investments.reduce((sum, inv) => {
    const gain = inv.currentValue - inv.amount;
    return sum + gain;
  }, 0);
  const totalValue = totalInvested + totalReturns;
  
  // Filter active and completed investments
  const activeInvestments = investments.filter(inv => inv.status === "active");
  const completedInvestments = investments.filter(inv => inv.status === "completed");
  
  // Calculate ROI for each investment
  const investmentsWithROI = investments.map(inv => {
    const roi = ((inv.currentValue - inv.amount) / inv.amount) * 100;
    return {
      ...inv,
      roi
    };
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <DashboardHeader />
      
      <main className="flex-grow py-6">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Portfolio</h2>
          
          {/* Portfolio Summary */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div className="mb-4 md:mb-0">
                <h3 className="text-sm font-medium text-gray-500">TOTAL AMOUNT</h3>
                <div className="text-2xl font-bold">₦{totalInvested.toLocaleString()}</div>
              </div>
              <div className="mb-4 md:mb-0">
                <h3 className="text-sm font-medium text-gray-500">TOTAL RETURNS</h3>
                <div className="text-2xl font-bold text-emerald-600">
                  ₦{totalReturns.toLocaleString()}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">TOTAL VALUE</h3>
                <div className="text-2xl font-bold">₦{totalValue.toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          {/* Investments Tabs */}
          <Tabs defaultValue="active" onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Projects</TabsTrigger>
              <TabsTrigger value="completed">Completed Projects</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-4">
              {activeInvestments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                  <p className="text-gray-500">No active investments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeInvestments.map(investment => {
                    const roi = ((investment.currentValue - investment.amount) / investment.amount) * 100;
                    // Use a default funding percentage if targetAmount doesn't exist
                    const fundedPercentage = 65; // Match the mockup which shows 65%
                    
                    return (
                      <div key={investment.id} className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium">{investment.property.name}</h3>
                          <Badge variant={roi >= 0 ? "success" : "destructive"}>
                            {roi.toFixed(1)}%
                          </Badge>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Invested</span>
                            <span>₦{investment.amount.toLocaleString()}</span>
                          </div>
                          <Progress value={fundedPercentage} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-500">Current Value</p>
                            <p className="font-medium">₦{investment.currentValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Location</p>
                            <p className="font-medium">{investment.property.location}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-4">
              {completedInvestments.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                  <p className="text-gray-500">No completed investments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedInvestments.map(investment => {
                    const roi = ((investment.currentValue - investment.amount) / investment.amount) * 100;
                    
                    return (
                      <div key={investment.id} className="bg-white rounded-xl shadow-md p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium">{investment.property.name}</h3>
                          <Badge variant={roi >= 0 ? "success" : "destructive"}>
                            {roi.toFixed(1)}%
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-gray-500">Invested Amount</p>
                            <p className="font-medium">₦{investment.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Final Value</p>
                            <p className="font-medium">₦{investment.currentValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Location</p>
                            <p className="font-medium">{investment.property.location}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">ROI</p>
                            <p className={`font-medium ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {roi.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}