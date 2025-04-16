import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import InvestorLayout from '@/components/layouts/InvestorLayout-new';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  MapPin, 
  Calendar, 
  Users, 
  TrendingUp, 
  LineChart, 
  FileText, 
  ImageIcon, 
  Home, 
  Briefcase,
  Clock
} from 'lucide-react';

const InvestmentDetails = () => {
  const { id } = useParams();
  const investmentId = parseInt(id);
  
  // Fetch investment details
  const { data: investment, isLoading: investmentLoading } = useQuery({
    queryKey: ['/api/investments', investmentId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/investments/${investmentId}`);
      return await res.json();
    },
    enabled: !!investmentId
  });
  
  // Fetch property details
  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ['/api/properties', investment?.propertyId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/properties/${investment?.propertyId}`);
      return await res.json();
    },
    enabled: !!investment?.propertyId
  });
  
  const isLoading = investmentLoading || propertyLoading;
  
  // Calculate investment metrics
  const calculateMetrics = () => {
    if (!investment || !property) return {};
    
    const initialInvestment = investment.amount;
    const currentValue = investment.currentValue;
    const percentageGrowth = ((currentValue - initialInvestment) / initialInvestment) * 100;
    const totalEarnings = investment.earnings || 0;
    const roi = (totalEarnings / initialInvestment) * 100;
    
    return {
      initialInvestment,
      currentValue,
      percentageGrowth,
      totalEarnings,
      roi
    };
  };
  
  const metrics = calculateMetrics();
  
  // Monthly returns data (sample data - would come from backend)
  const monthlyReturns = investment?.monthlyReturns || [
    { month: 'Jan', amount: 12500 },
    { month: 'Feb', amount: 12500 },
    { month: 'Mar', amount: 12500 },
    { month: 'Apr', amount: 12800 },
    { month: 'May', amount: 12800 },
    { month: 'Jun', amount: 12800 }
  ];
  
  if (isLoading) {
    return (
      <InvestorLayout>
        <div className="container py-12 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-12"></div>
            <div className="h-64 bg-gray-200 rounded-lg w-full max-w-3xl"></div>
          </div>
        </div>
      </InvestorLayout>
    );
  }
  
  if (!investment || !property) {
    return (
      <InvestorLayout>
        <div className="container py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Investment Not Found</h2>
          <p className="text-muted-foreground mb-8">The investment you're looking for doesn't exist or you don't have access to view it.</p>
          <Button asChild>
            <Link href="/investor/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </InvestorLayout>
    );
  }
  
  return (
    <InvestorLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center">
              <Link href="/investor/dashboard">
                <Button variant="link" className="p-0 h-auto font-medium">Dashboard</Button>
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span>Investment Details</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-2">{property.name}</h1>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline">Download Certificate</Button>
            <Button>Add to Investment</Button>
          </div>
        </div>
        
        {/* Investment summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Investment Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{metrics.initialInvestment?.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3 inline mr-1" />
                Invested on {new Date(investment.date).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{metrics.currentValue?.toLocaleString()}</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                <span className="text-xs text-emerald-500">
                  {metrics.percentageGrowth?.toFixed(2)}% growth
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{metrics.totalEarnings?.toLocaleString()}</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                <span className="text-xs text-emerald-500">
                  {metrics.roi?.toFixed(2)}% ROI
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Time Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{
                investment.maturityDate 
                  ? Math.max(0, Math.floor((new Date(investment.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                  : property.term - Math.floor((new Date().getTime() - new Date(investment.date).getTime()) / (1000 * 60 * 60 * 24 * 30))
              } months</div>
              <div className="flex items-center mt-1">
                <Clock className="h-3 w-3 text-blue-500 mr-1" />
                <span className="text-xs text-muted-foreground">
                  {property.term} month term
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Property image and progress */}
        <div className="mb-6">
          <Card>
            <div className="md:flex">
              <div className="md:w-1/2">
                <img 
                  src={property.imageUrl} 
                  alt={property.name}
                  className="w-full h-64 object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                />
              </div>
              <div className="md:w-1/2 p-6">
                <div className="flex space-x-2 mb-4">
                  <Badge variant={property.tier === 'premium' ? 'default' : 'secondary'}>
                    {property.tier}
                  </Badge>
                  <Badge variant="outline">{property.type}</Badge>
                  {property.accreditedOnly && (
                    <Badge variant="destructive">Accredited Only</Badge>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold mb-1">{property.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{property.description}</p>
                
                <div className="grid grid-cols-2 gap-y-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Developer</p>
                    <p className="font-medium">{property.developer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <p className="font-medium capitalize">{property.riskLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-medium">{property.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Built Year</p>
                    <p className="font-medium">{property.builtYear}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Funding Progress</span>
                    <span>
                      ₦{property.currentFunding.toLocaleString()} / ₦{property.totalFunding.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={property.currentFunding / property.totalFunding * 100} className="h-2" />
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{property.numberOfInvestors} investors</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Detailed tabs */}
        <Tabs defaultValue="performance" className="mb-6">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="performance">
              <LineChart className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="returns">
              <TrendingUp className="h-4 w-4 mr-2" />
              Returns
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <ImageIcon className="h-4 w-4 mr-2" />
              Gallery
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Performance</CardTitle>
                <CardDescription>
                  Track the performance of your investment over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-muted rounded-md">
                  <p className="text-muted-foreground">Performance chart will be displayed here</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Investment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge>{investment.status}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Investment Date:</span>
                        <span>{new Date(investment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Investment Term:</span>
                        <span>{property.term} months</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Maturity Date:</span>
                        <span>{
                          investment.maturityDate 
                            ? new Date(investment.maturityDate).toLocaleDateString()
                            : new Date(new Date(investment.date).getTime() + property.term * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
                        }</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Financial Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Initial Investment:</span>
                        <span>₦{metrics.initialInvestment?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Value:</span>
                        <span>₦{metrics.currentValue?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Earnings:</span>
                        <span>₦{metrics.totalEarnings?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ROI:</span>
                        <span className="text-emerald-500">{metrics.roi?.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Property Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{property.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="capitalize">{property.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Occupancy:</span>
                        <span>{property.occupancy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cash Flow:</span>
                        <span>{property.cashFlow}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="returns" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Returns</CardTitle>
                <CardDescription>
                  Monthly returns and payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Month</th>
                        <th className="text-left py-3 px-4 font-medium">Return Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Payment Date</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyReturns.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">{item.month}</td>
                          <td className="py-3 px-4">₦{item.amount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            {new Date(new Date().getFullYear(), index, 15).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                              Paid
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      <tr className="border-b bg-muted/50">
                        <td className="py-3 px-4">Jul</td>
                        <td className="py-3 px-4">₦12,800</td>
                        <td className="py-3 px-4">
                          {new Date(new Date().getFullYear(), 6, 15).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                            Pending
                          </Badge>
                        </td>
                      </tr>
                      <tr className="border-b bg-muted/50">
                        <td className="py-3 px-4">Aug</td>
                        <td className="py-3 px-4">₦12,800</td>
                        <td className="py-3 px-4">-</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
                            Upcoming
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium">Reinvestment Options</h4>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-2">Auto-reinvest returns</span>
                      {/* Add switch component here */}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose to automatically reinvest your returns to compound your growth or receive monthly payouts to your wallet.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2 border-primary">
                      <CardContent className="pt-6">
                        <div className="flex items-start mb-4">
                          <Briefcase className="h-6 w-6 text-primary mr-3" />
                          <div>
                            <h4 className="font-medium">Reinvest Returns</h4>
                            <p className="text-sm text-muted-foreground">Automatically reinvest your monthly returns to compound your growth</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">Projected Annual Return:</span>
                            <span className="font-medium">{(parseFloat(property.targetReturn) * 1.2).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Projected Future Value:</span>
                            <span className="font-medium">₦{(metrics.initialInvestment * (1 + parseFloat(property.targetReturn) / 100 / 12) ** property.term).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start mb-4">
                          <Banknote className="h-6 w-6 text-muted-foreground mr-3" />
                          <div>
                            <h4 className="font-medium">Monthly Payout</h4>
                            <p className="text-sm text-muted-foreground">Receive your monthly returns directly to your wallet</p>
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-muted-foreground">Monthly Payout:</span>
                            <span className="font-medium">₦{Math.round(metrics.initialInvestment * parseFloat(property.targetReturn) / 100 / 12).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Annual Return:</span>
                            <span className="font-medium">{property.targetReturn}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Documents</CardTitle>
                <CardDescription>
                  Access all documents related to your investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                          <h4 className="font-medium">Investment Certificate</h4>
                          <p className="text-sm text-muted-foreground">Official certificate of your investment</p>
                          <Button variant="link" className="p-0 h-auto mt-1 font-medium">Download PDF</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-emerald-500 mr-3" />
                        <div>
                          <h4 className="font-medium">Property Documentation</h4>
                          <p className="text-sm text-muted-foreground">Legal documents related to the property</p>
                          <Button variant="link" className="p-0 h-auto mt-1 font-medium">View Documents</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-amber-500 mr-3" />
                        <div>
                          <h4 className="font-medium">Due Diligence Report</h4>
                          <p className="text-sm text-muted-foreground">Comprehensive due diligence on the property</p>
                          <Button variant="link" className="p-0 h-auto mt-1 font-medium">Download PDF</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-purple-500 mr-3" />
                        <div>
                          <h4 className="font-medium">Transaction History</h4>
                          <p className="text-sm text-muted-foreground">Complete record of all transactions</p>
                          <Button variant="link" className="p-0 h-auto mt-1 font-medium">Download CSV</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="gallery" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Gallery</CardTitle>
                <CardDescription>
                  View images and videos of the property
                </CardDescription>
              </CardHeader>
              <CardContent>
                {property.imageGallery && property.imageGallery.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {property.imageGallery.map((image, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                        <img 
                          src={image} 
                          alt={`${property.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No gallery images available for this property</p>
                  </div>
                )}
                
                {property.videoUrl && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3">Property Video</h4>
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Video player will be embedded here</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </InvestorLayout>
  );
};

export default InvestmentDetails;