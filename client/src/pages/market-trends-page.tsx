import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketOverview } from "@/components/market/MarketOverview";
import { PriceIndexChart } from "@/components/market/PriceIndexChart";
import { RegionalHeatmap } from "@/components/market/RegionalHeatmap";
import { MarketForecasts } from "@/components/market/MarketForecasts";
import { PropertyTypeComparison } from "@/components/market/PropertyTypeComparison";

export default function MarketTrendsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold">Real Estate Market Trends</h1>
              <p className="text-gray-500 mt-2">
                Analyze current market conditions, track trends, and forecast future opportunities
              </p>
            </div>
            
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full max-w-4xl">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="price-index">Price Index</TabsTrigger>
                <TabsTrigger value="regional">Regional Data</TabsTrigger>
                <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
                <TabsTrigger value="comparison">Property Types</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <MarketOverview />
              </TabsContent>
              
              <TabsContent value="price-index" className="mt-6">
                <PriceIndexChart />
              </TabsContent>
              
              <TabsContent value="regional" className="mt-6">
                <RegionalHeatmap />
              </TabsContent>
              
              <TabsContent value="forecasts" className="mt-6">
                <MarketForecasts />
              </TabsContent>
              
              <TabsContent value="comparison" className="mt-6">
                <PropertyTypeComparison />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}