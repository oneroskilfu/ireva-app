import React, { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import InvestorLayout from '@/components/layouts/InvestorLayout-new';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Property } from '@/shared/schema';
import { AlertCircle, Calendar, CheckCircle2, FileText, Home, InfoIcon, LineChart, MapPin, Plus, Timer, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Sample ROI projection data
const roiData = [
  { year: 'Year 1', value: 12.5 },
  { year: 'Year 2', value: 12.5 },
  { year: 'Year 3', value: 13.2 },
  { year: 'Year 4', value: 13.8 },
  { year: 'Year 5', value: 14.5 },
];

// Sample cash flow projection data
const cashFlowData = [
  { month: 'Jan', income: 450000, expenses: 120000 },
  { month: 'Feb', income: 450000, expenses: 125000 },
  { month: 'Mar', income: 450000, expenses: 118000 },
  { month: 'Apr', income: 450000, expenses: 122000 },
  { month: 'May', income: 450000, expenses: 130000 },
  { month: 'Jun', income: 450000, expenses: 123000 },
  { month: 'Jul', income: 450000, expenses: 127000 },
  { month: 'Aug', income: 450000, expenses: 115000 },
  { month: 'Sep', income: 450000, expenses: 120000 },
  { month: 'Oct', income: 450000, expenses: 125000 },
  { month: 'Nov', income: 450000, expenses: 118000 },
  { month: 'Dec', income: 450000, expenses: 122000 },
];

// Sample breakdown data
const breakdownData = [
  { name: 'Rental Income', value: 70 },
  { name: 'Property Appreciation', value: 20 },
  { name: 'Tax Benefits', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PropertyDetailsPage = () => {
  const { id } = useParams();
  const [investmentAmount, setInvestmentAmount] = useState('');
  const propertyId = parseInt(id);
  
  // Fetch property details
  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ['/api/properties', propertyId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/properties/${propertyId}`);
      return await res.json();
    },
    enabled: !!propertyId
  });
  
  const handleInvestmentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setInvestmentAmount(value);
    }
  };
  
  const handleInvest = () => {
    // Add investment logic here
    console.log('Investing', investmentAmount, 'in property', propertyId);
  };
  
  // Calculate projected returns based on investment amount
  const calculateReturns = () => {
    if (!property || !investmentAmount || parseInt(investmentAmount) < property.minimumInvestment) {
      return null;
    }
    
    const amount = parseInt(investmentAmount);
    const annualReturn = parseFloat(property.targetReturn) / 100;
    const monthlyReturn = annualReturn / 12;
    const termInMonths = property.term;
    
    const monthlyReturns = Array.from({ length: termInMonths }, (_, i) => {
      const month = i + 1;
      return {
        month,
        return: Math.round(amount * monthlyReturn)
      };
    });
    
    const totalReturn = monthlyReturns.reduce((sum, item) => sum + item.return, 0);
    const roi = (totalReturn / amount) * 100;
    
    return {
      monthlyReturns,
      totalReturn,
      roi
    };
  };
  
  const projectedReturns = calculateReturns();
  
  if (isLoading) {
    return (
      <InvestorLayout>
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-40" />
            </div>
            <div className="mt-4 md:mt-0">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
          
          <div className="mb-6">
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="mb-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </InvestorLayout>
    );
  }
  
  if (!property) {
    return (
      <InvestorLayout>
        <div className="container py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <p className="text-muted-foreground mb-8">The property you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/investor/properties">Browse Properties</Link>
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
              <Link href="/investor/properties">
                <Button variant="link" className="p-0 h-auto font-medium">Properties</Button>
              </Link>
              <span className="mx-2 text-muted-foreground">/</span>
              <span>Property Details</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-2">{property.name}</h1>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add to Watchlist
            </Button>
            <Button>Apply Now</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Property image gallery */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="relative">
                <img 
                  src={property.imageUrl} 
                  alt={property.name}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge 
                    variant={property.tier === 'premium' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {property.tier}
                  </Badge>
                  <Badge variant="outline" className="capitalize bg-white/80">
                    {property.type}
                  </Badge>
                  {property.accreditedOnly && (
                    <Badge variant="destructive">Accredited Only</Badge>
                  )}
                </div>
              </div>
              
              {property.imageGallery && property.imageGallery.length > 0 && (
                <div className="grid grid-cols-4 gap-2 p-2">
                  {property.imageGallery.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative aspect-video overflow-hidden rounded">
                      <img 
                        src={image} 
                        alt={`${property.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
          
          {/* Investment summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Investment Summary</CardTitle>
                <CardDescription>Key details about this investment opportunity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Minimum Investment</span>
                      <span className="font-medium">₦{property.minimumInvestment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Target Return</span>
                      <span className="font-medium">{property.targetReturn}% p.a.</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Investment Term</span>
                      <span className="font-medium">{property.term} months</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Risk Level</span>
                      <span className="font-medium capitalize">{property.riskLevel}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Property Size</span>
                      <span className="font-medium">{property.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Built Year</span>
                      <span className="font-medium">{property.builtYear}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Funding Goal</span>
                      <span className="font-medium">₦{property.totalFunding.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Current Funding</span>
                      <span className="font-medium">₦{property.currentFunding.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={property.currentFunding / property.totalFunding * 100}
                      className="h-2 mb-3"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{property.numberOfInvestors} investors</span>
                      </div>
                      <div className="flex items-center">
                        <Timer className="h-3 w-3 mr-1" />
                        <span>{property.daysLeft} days left</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label htmlFor="investmentAmount" className="block text-sm font-medium mb-1">
                      Your Investment Amount (₦)
                    </label>
                    <Input
                      id="investmentAmount"
                      type="text"
                      placeholder={`Min. ${property.minimumInvestment.toLocaleString()}`}
                      value={investmentAmount}
                      onChange={handleInvestmentAmountChange}
                      className="mb-2"
                    />
                    {investmentAmount && parseInt(investmentAmount) < property.minimumInvestment && (
                      <p className="text-xs text-destructive mb-2">
                        Investment amount must be at least ₦{property.minimumInvestment.toLocaleString()}
                      </p>
                    )}
                    
                    {projectedReturns && (
                      <div className="bg-muted p-3 rounded-md mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Monthly Return</span>
                          <span className="text-xs font-medium">₦{projectedReturns.monthlyReturns[0].return.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Total Return ({property.term} months)</span>
                          <span className="text-xs font-medium">₦{projectedReturns.totalReturn.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">ROI</span>
                          <span className="text-xs font-medium text-emerald-500">{projectedReturns.roi.toFixed(2)}%</span>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      className="w-full" 
                      onClick={handleInvest}
                      disabled={!investmentAmount || parseInt(investmentAmount) < property.minimumInvestment}
                    >
                      Invest Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Property details tabs */}
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="grid grid-cols-4 sm:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="developer">Developer</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{property.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3">Property Details</h4>
                        <div className="space-y-2">
                          <div className="flex">
                            <div className="w-1/2 text-sm text-muted-foreground">Type</div>
                            <div className="w-1/2 text-sm capitalize">{property.type}</div>
                          </div>
                          <div className="flex">
                            <div className="w-1/2 text-sm text-muted-foreground">Size</div>
                            <div className="w-1/2 text-sm">{property.size}</div>
                          </div>
                          <div className="flex">
                            <div className="w-1/2 text-sm text-muted-foreground">Built Year</div>
                            <div className="w-1/2 text-sm">{property.builtYear}</div>
                          </div>
                          <div className="flex">
                            <div className="w-1/2 text-sm text-muted-foreground">Occupancy</div>
                            <div className="w-1/2 text-sm">{property.occupancy}</div>
                          </div>
                          <div className="flex">
                            <div className="w-1/2 text-sm text-muted-foreground">Cash Flow</div>
                            <div className="w-1/2 text-sm">{property.cashFlow}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-3">Amenities</h4>
                        <div className="space-y-2">
                          {property.amenities && property.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                              <span className="text-sm">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="mt-0.5 mr-3 bg-primary/10 p-2 rounded-full">
                          <LineChart className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Strong Rental Yield</h4>
                          <p className="text-sm text-muted-foreground">Consistent monthly returns from stable rental income</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-0.5 mr-3 bg-primary/10 p-2 rounded-full">
                          <Home className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Prime Location</h4>
                          <p className="text-sm text-muted-foreground">Located in a high-demand area with strong appreciation potential</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-0.5 mr-3 bg-primary/10 p-2 rounded-full">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Professional Management</h4>
                          <p className="text-sm text-muted-foreground">Experienced property management team handling all operations</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="mt-0.5 mr-3 bg-primary/10 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Defined Exit Strategy</h4>
                          <p className="text-sm text-muted-foreground">Clear plan for property refinance or sale at the end of the term</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="financial" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Projected ROI</CardTitle>
                  <CardDescription>Expected returns over the investment period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={roiData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip 
                          formatter={(value) => [`${value}%`, 'ROI']}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8884d8" 
                          fill="url(#colorValue)" 
                          name="ROI"
                        />
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Return Breakdown</CardTitle>
                  <CardDescription>Sources of investment returns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={breakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {breakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Projected Cash Flow</CardTitle>
                <CardDescription>Monthly income and expenses projection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={cashFlowData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₦${value / 1000}k`} />
                      <Tooltip 
                        formatter={(value) => [`₦${value.toLocaleString()}`, '']}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="#82ca9d" />
                      <Bar dataKey="expenses" name="Expenses" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Key financial metrics for this property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Revenue</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Annual Rental Income</span>
                        <span className="text-sm">₦450,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                        <span className="text-sm">{property.occupancy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Rental Growth (Annual)</span>
                        <span className="text-sm">5%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Expenses</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Management Fee</span>
                        <span className="text-sm">5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Maintenance</span>
                        <span className="text-sm">₦54,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Insurance</span>
                        <span className="text-sm">₦15,000,000</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Return Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cap Rate</span>
                        <span className="text-sm">8.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cash-on-Cash Return</span>
                        <span className="text-sm">12.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">5-Year IRR</span>
                        <span className="text-sm">16.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="location" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Location</CardTitle>
                <CardDescription>
                  {property.location} - Latitude: {property.latitude}, Longitude: {property.longitude}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted h-96 rounded-md flex items-center justify-center mb-6">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Map view will be displayed here</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Neighborhood</h4>
                    <p className="text-sm text-muted-foreground">
                      {property.location} is a prime area known for its excellent infrastructure, 
                      security, and proximity to key commercial centers. The neighborhood has seen 
                      consistent property value appreciation over the past decade.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Nearby Amenities</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                        <span>Shopping centers (0.5 km)</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                        <span>Hospitals (1.2 km)</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                        <span>Schools and universities (0.8 km)</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                        <span>Restaurants and cafes (0.3 km)</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                        <span>Public transportation (0.4 km)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Area Growth</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      This location has experienced 15% average property value appreciation annually 
                      over the past 5 years. Recent infrastructure developments include:
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
                        <span>New expressway connecting to business district</span>
                      </div>
                      <div className="flex items-center">
                        <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
                        <span>Expanded shopping mall (completed 2022)</span>
                      </div>
                      <div className="flex items-center">
                        <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
                        <span>Upcoming metro station (2025)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="developer" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Developer Information</CardTitle>
                <CardDescription>{property.developer}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium mb-3">About the Developer</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {property.developer} is a leading real estate development company in Nigeria with 
                      over 15 years of experience in the industry. They specialize in developing high-quality 
                      residential and commercial properties in prime locations across major Nigerian cities.
                    </p>
                    
                    <h4 className="text-sm font-medium mb-3">Track Record</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      With a portfolio of over 20 completed projects valued at more than ₦50 billion, 
                      {property.developer} has established a reputation for delivering projects on time 
                      and to the highest standards. Their properties consistently achieve above-market 
                      occupancy rates and returns for investors.
                    </p>
                    
                    <h4 className="text-sm font-medium mb-3">Management Team</h4>
                    <p className="text-sm text-muted-foreground">
                      Led by industry veterans with decades of combined experience in real estate 
                      development, construction, and property management. The management team includes 
                      certified architects, engineers, and financial experts committed to creating 
                      value for investors.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Previous Projects</h4>
                    <div className="space-y-4">
                      <div className="border rounded-md overflow-hidden">
                        <div className="h-32 bg-muted" />
                        <div className="p-3">
                          <h5 className="text-sm font-medium">Victoria Heights</h5>
                          <p className="text-xs text-muted-foreground mb-1">Lagos, 2021</p>
                          <div className="text-xs">
                            <span className="text-emerald-500 font-medium">15.3% ROI</span>
                            <span className="mx-2">•</span>
                            <span>₦4.2B value</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <div className="h-32 bg-muted" />
                        <div className="p-3">
                          <h5 className="text-sm font-medium">Lekki Office Complex</h5>
                          <p className="text-xs text-muted-foreground mb-1">Lagos, 2019</p>
                          <div className="text-xs">
                            <span className="text-emerald-500 font-medium">13.7% ROI</span>
                            <span className="mx-2">•</span>
                            <span>₦3.8B value</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Documents</CardTitle>
                <CardDescription>Due diligence and legal documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start p-4 border rounded-md">
                    <FileText className="h-10 w-10 text-blue-500 mr-4" />
                    <div>
                      <h4 className="font-medium mb-1">Property Title Documents</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Verified legal title and ownership documents for the property.
                      </p>
                      <Button variant="outline" size="sm">
                        View Document
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 border rounded-md">
                    <FileText className="h-10 w-10 text-emerald-500 mr-4" />
                    <div>
                      <h4 className="font-medium mb-1">Financial Projections</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Detailed 5-year financial model and cash flow projections.
                      </p>
                      <Button variant="outline" size="sm">
                        Download Excel
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 border rounded-md">
                    <FileText className="h-10 w-10 text-amber-500 mr-4" />
                    <div>
                      <h4 className="font-medium mb-1">Property Valuation Report</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Independent third-party valuation of the property.
                      </p>
                      <Button variant="outline" size="sm">
                        View Report
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 border rounded-md">
                    <FileText className="h-10 w-10 text-purple-500 mr-4" />
                    <div>
                      <h4 className="font-medium mb-1">Investment Agreement</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Legal agreement outlining investor rights and obligations.
                      </p>
                      <Button variant="outline" size="sm">
                        View Agreement
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 border rounded-md">
                    <FileText className="h-10 w-10 text-red-500 mr-4" />
                    <div>
                      <h4 className="font-medium mb-1">Building Permits & Approvals</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        All regulatory approvals and building permits.
                      </p>
                      <Button variant="outline" size="sm">
                        View Documents
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 border rounded-md">
                    <FileText className="h-10 w-10 text-orange-500 mr-4" />
                    <div>
                      <h4 className="font-medium mb-1">Property Insurance</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Comprehensive property insurance coverage details.
                      </p>
                      <Button variant="outline" size="sm">
                        View Policy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="updates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Construction & Property Updates</CardTitle>
                <CardDescription>Latest news and progress reports</CardDescription>
              </CardHeader>
              <CardContent>
                {property.constructionUpdates ? (
                  <div className="space-y-6">
                    {property.constructionUpdates.map((update, index) => (
                      <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                          <span className="text-sm text-muted-foreground">{update.date}</span>
                        </div>
                        <h4 className="font-medium mb-2">{update.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4">{update.description}</p>
                        {update.images && update.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2">
                            {update.images.map((image, imgIndex) => (
                              <div key={imgIndex} className="aspect-video bg-muted rounded-md overflow-hidden">
                                <img 
                                  src={image} 
                                  alt={`Update ${index + 1} - Image ${imgIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No updates available</h3>
                    <p className="text-muted-foreground">
                      Property updates will be posted here once available.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Similar Properties</CardTitle>
            <CardDescription>You might also be interested in these properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-md overflow-hidden">
                  <div className="h-48 bg-muted" />
                  <div className="p-4">
                    <h4 className="font-medium mb-1">Heritage Heights</h4>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>Lagos</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground text-xs">Min. Investment</p>
                        <p className="font-medium">₦150,000</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Target Return</p>
                        <p className="font-medium">13.5%</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">View Property</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </InvestorLayout>
  );
};

export default PropertyDetailsPage;